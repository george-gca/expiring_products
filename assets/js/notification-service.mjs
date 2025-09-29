/**
 * Firebase Cloud Messaging (FCM) Notification Service
 * Handles push notification permissions, token management, and scheduling
 */

export class NotificationService {
  constructor() {
    this.messaging = null;
    this.currentToken = null;
    this.userId = null;
    this.db = null;
    this.vapidKey = null;
    this.isSupported = this.checkSupport();
  }

  /**
   * Check if push notifications are supported in this browser
   * @returns {boolean} True if supported, false otherwise
   */
  checkSupport() {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window &&
      typeof firebase !== "undefined" &&
      firebase.messaging
    );
  }

  /**
   * Initialize the notification service
   * @param {Object} firebaseApp - Firebase app instance
   * @param {Object} firestore - Firestore database instance
   * @param {string} vapidKey - VAPID key for FCM
   * @param {string} userId - Current user ID
   */
  async initialize(firebaseApp, firestore, vapidKey, userId) {
    if (!this.isSupported) {
      console.warn("Push notifications are not supported in this browser");
      return false;
    }

    try {
      this.db = firestore;
      this.userId = userId;
      this.vapidKey = vapidKey;

      console.log('Initializing with VAPID key:', vapidKey ? vapidKey.substring(0, 20) + '...' : 'null');

      if (!vapidKey) {
        throw new Error('VAPID key is required for FCM');
      }

      // Initialize Firebase Messaging
      this.messaging = firebase.messaging();

      console.log('Firebase messaging initialized');

      // Get existing token or generate new one
      await this.getOrGenerateToken();

      // Handle foreground messages
      this.messaging.onMessage((payload) => {
        console.log("Foreground message received:", payload);
        this.handleForegroundMessage(payload);
      });

      // Listen for service worker messages (notification clicks)
      navigator.serviceWorker.addEventListener("message", (event) => {
        this.handleServiceWorkerMessage(event);
      });

      console.log("Notification service initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize notification service:", error);
      return false;
    }
  }

  /**
   * Request notification permission from the user
   * @returns {Promise<boolean>} True if permission granted, false otherwise
   */
  async requestPermission() {
    if (!this.isSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);

      if (permission === "granted") {
        await this.getOrGenerateToken();
        await this.saveNotificationPreference(true);
        return true;
      } else {
        await this.saveNotificationPreference(false);
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  /**
   * Get current notification permission status
   * @returns {string} Permission status: 'granted', 'denied', or 'default'
   */
  getPermissionStatus() {
    if (!this.isSupported) {
      return "denied";
    }
    return Notification.permission;
  }

  /**
   * Get or generate FCM token
   * @returns {Promise<string|null>} The FCM token or null if failed
   */
  async getOrGenerateToken() {
    console.log('getOrGenerateToken called, messaging:', !!this.messaging, 'permission:', Notification.permission);
    
    if (!this.messaging || Notification.permission !== "granted") {
      console.log('Cannot generate token - messaging or permission not available');
      return null;
    }

    try {
      console.log('Attempting to get FCM token with VAPID key:', this.vapidKey ? this.vapidKey.substring(0, 20) + '...' : 'null');
      
      const token = await this.messaging.getToken({
        vapidKey: this.vapidKey,
      });

      if (token) {
        console.log("FCM token generated:", token.substring(0, 20) + "...");
        this.currentToken = token;
        await this.saveTokenToDatabase(token);
        return token;
      } else {
        console.warn("No FCM token available");
        return null;
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

  /**
   * Save FCM token to user's profile in Firestore
   * @param {string} token - The FCM token to save
   */
  async saveTokenToDatabase(token) {
    if (!this.db || !this.userId || !token) {
      return;
    }

    try {
      await this.db
        .collection("users")
        .doc(this.userId)
        .set(
          {
            fcmToken: token,
            notificationSettings: {
              enabled: true,
              weeklyReminders: true,
              urgentAlerts: true,
              lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            },
          },
          { merge: true }
        );

      console.log("FCM token saved to database");
    } catch (error) {
      console.error("Error saving FCM token to database:", error);
    }
  }

  /**
   * Save notification preference to database
   * @param {boolean} enabled - Whether notifications are enabled
   */
  async saveNotificationPreference(enabled) {
    if (!this.db || !this.userId) {
      return;
    }

    try {
      await this.db
        .collection("users")
        .doc(this.userId)
        .set(
          {
            notificationSettings: {
              enabled: enabled,
              lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            },
          },
          { merge: true }
        );
    } catch (error) {
      console.error("Error saving notification preference:", error);
    }
  }

  /**
   * Get user's notification settings from database
   * @returns {Promise<Object>} Notification settings object
   */
  async getNotificationSettings() {
    if (!this.db || !this.userId) {
      return { enabled: false, weeklyReminders: true, urgentAlerts: true };
    }

    try {
      const doc = await this.db.collection("users").doc(this.userId).get();
      const data = doc.data();
      return (
        data?.notificationSettings || {
          enabled: false,
          weeklyReminders: true,
          urgentAlerts: true,
        }
      );
    } catch (error) {
      console.error("Error getting notification settings:", error);
      return { enabled: false, weeklyReminders: true, urgentAlerts: true };
    }
  }

  /**
   * Update notification settings
   * @param {Object} settings - Settings to update
   */
  async updateNotificationSettings(settings) {
    if (!this.db || !this.userId) {
      return;
    }

    try {
      await this.db
        .collection("users")
        .doc(this.userId)
        .set(
          {
            notificationSettings: {
              ...settings,
              lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            },
          },
          { merge: true }
        );

      console.log("Notification settings updated:", settings);
    } catch (error) {
      console.error("Error updating notification settings:", error);
    }
  }

  /**
   * Handle foreground messages (when app is open)
   * @param {Object} payload - Message payload from FCM
   */
  handleForegroundMessage(payload) {
    const { notification, data } = payload;

    if (notification) {
      // Show browser notification even when app is in foreground
      const options = {
        body: notification.body,
        icon: "/assets/img/favicon_colored.png",
        badge: "/assets/img/favicon.png",
        data: data,
        tag: data?.type || "expiring-products",
        requireInteraction: data?.type === "urgent",
      };

      new Notification(notification.title, options);
    }
  }

  /**
   * Handle messages from service worker (notification interactions)
   * @param {Event} event - Service worker message event
   */
  handleServiceWorkerMessage(event) {
    const { type, category, data } = event.data;

    switch (type) {
      case "NOTIFICATION_CLICK":
        console.log("Notification clicked, switching to category:", category);
        // Trigger category switch in the UI
        if (category && typeof window.switchToCategory === "function") {
          window.switchToCategory(category);
        }
        break;

      case "NOTIFICATION_DISMISSED":
        console.log("Notification dismissed:", data);
        // Could track analytics or update UI state
        break;

      default:
        console.log("Unknown service worker message:", event.data);
    }
  }

  /**
   * Disable notifications (revoke permission and clean up)
   */
  async disableNotifications() {
    try {
      // Update database
      await this.saveNotificationPreference(false);

      // Clear the token
      if (this.messaging && this.currentToken) {
        await this.messaging.deleteToken();
        this.currentToken = null;
      }

      console.log("Notifications disabled");
    } catch (error) {
      console.error("Error disabling notifications:", error);
    }
  }

  /**
   * Test notification (for debugging purposes)
   */
  async sendTestNotification() {
    if (Notification.permission === "granted") {
      const notification = new Notification("Test Notification", {
        body: "This is a test notification from Expiring Products app",
        icon: "/assets/img/favicon_colored.png",
        badge: "/assets/img/favicon.png",
        tag: "test",
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
