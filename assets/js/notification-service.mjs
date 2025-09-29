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
    // Check for basic notification support
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    // Check for service worker support
    if (!("serviceWorker" in navigator)) {
      console.warn("This browser does not support service workers");
      return false;
    }

    // Check for push manager support
    if (!("PushManager" in window)) {
      console.warn("This browser does not support push messaging");
      return false;
    }

    // Check for Firebase support
    if (typeof firebase === "undefined") {
      console.warn("Firebase is not loaded");
      return false;
    }

    if (!firebase.messaging) {
      console.warn("Firebase messaging is not available");
      return false;
    }

    // Additional check for mobile browsers
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    if (isMobile) {
      console.log("Mobile device detected, ensuring compatibility");
      
      // Check if running as PWA (installed app)
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    window.navigator.standalone === true ||
                    document.referrer.includes('android-app://');
      
      if (!isPWA) {
        console.warn("On mobile, notifications work best when the app is installed as a PWA");
        // Still allow, but warn user
      }
    }

    return true;
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
      // Check current permission status
      let permission = Notification.permission;
      
      if (permission === "granted") {
        console.log("Notification permission already granted");
        await this.getOrGenerateToken();
        await this.saveNotificationPreference(true);
        return true;
      }

      if (permission === "denied") {
        console.warn("Notification permission was denied");
        await this.saveNotificationPreference(false);
        return false;
      }

      // Request permission with user-friendly approach for mobile
      console.log("Requesting notification permission...");
      
      // For mobile browsers, ensure user interaction
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      if (isMobile) {
        // Add a small delay to ensure user gesture is recognized
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      permission = await Notification.requestPermission();
      console.log("Notification permission result:", permission);

      if (permission === "granted") {
        console.log("Notification permission granted!");
        await this.getOrGenerateToken();
        await this.saveNotificationPreference(true);
        
        // Send a welcome notification on mobile to confirm it's working
        if (isMobile) {
          setTimeout(() => {
            this.sendWelcomeNotification();
          }, 1000);
        }
        
        return true;
      } else {
        console.warn("Notification permission not granted:", permission);
        await this.saveNotificationPreference(false);
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  /**
   * Send a welcome notification after permission is granted
   */
  async sendWelcomeNotification() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification("🎉 Notifications Enabled!", {
        body: "You'll now receive alerts about expiring items",
        icon: "/assets/img/favicon_colored.png",
        badge: "/assets/img/favicon.png",
        tag: "welcome",
        data: {
          type: "welcome",
          timestamp: Date.now(),
        },
        silent: false,
        vibrate: [100, 50, 100],
      });
    } catch (error) {
      console.error("Failed to send welcome notification:", error);
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
    console.log('sendTestNotification called, permission:', Notification.permission);
    
    if (Notification.permission !== "granted") {
      console.warn("Cannot send test notification: permission not granted");
      return false;
    }

    // Detect if we're on mobile for method selection
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    console.log('Device type:', isMobile ? 'mobile' : 'desktop');

    try {
      // For desktop, prefer direct Notification API for better compatibility
      // For mobile, use service worker for better support
      if (!isMobile) {
        console.log('Using direct Notification API for desktop');
        
        const notification = new Notification("🔔 Test Notification", {
          body: "This is a test notification from Expiring Products app",
          icon: "/assets/img/favicon_colored.png",
          badge: "/assets/img/favicon.png",
          tag: "test",
          requireInteraction: false,
          data: {
            type: "test",
            timestamp: Date.now(),
          }
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
        
        console.log("Test notification sent successfully via direct API");
        return true;
      } else {
        console.log('Using service worker for mobile');
        
        // For mobile compatibility, use the service worker to show notifications
        const registration = await navigator.serviceWorker.ready;
        console.log('Service worker ready:', registration);
        
        const notificationOptions = {
          body: "This is a test notification from Expiring Products app",
          icon: "/assets/img/favicon_colored.png",
          badge: "/assets/img/favicon.png",
          tag: "test",
          data: {
            type: "test",
            timestamp: Date.now(),
            url: "/",
          },
          actions: [
            {
              action: "view",
              title: "Open App",
            },
            {
              action: "dismiss",
              title: "Dismiss",
            },
          ],
          requireInteraction: false,
          vibrate: [200, 100, 200], // Mobile vibration pattern
          silent: false,
        };

        // Use service worker registration to show notification for better mobile support
        await registration.showNotification("🔔 Test Notification", notificationOptions);
        
        console.log("Test notification sent successfully via service worker");
        return true;
      }
    } catch (error) {
      console.error("Primary notification method failed:", error);
      
      // Fallback: try the opposite method
      try {
        if (isMobile) {
          console.log('Mobile fallback: trying direct Notification API');
          const notification = new Notification("🔔 Test Notification", {
            body: "This is a test notification from Expiring Products app",
            icon: "/assets/img/favicon_colored.png",
            badge: "/assets/img/favicon.png",
            tag: "test",
          });

          setTimeout(() => {
            notification.close();
          }, 5000);
        } else {
          console.log('Desktop fallback: trying service worker');
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification("🔔 Test Notification", {
            body: "This is a test notification from Expiring Products app",
            icon: "/assets/img/favicon_colored.png",
            badge: "/assets/img/favicon.png",
            tag: "test",
          });
        }
        
        console.log("Fallback notification sent successfully");
        return true;
      } catch (fallbackError) {
        console.error("All notification methods failed:", fallbackError);
        return false;
      }
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
