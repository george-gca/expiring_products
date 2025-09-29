// Firebase messaging service worker
// This file is required by Firebase messaging

// Import Firebase messaging for push notifications
importScripts('https://www.gstatic.com/firebasejs/9.6.7/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.7/firebase-messaging-compat.js');

// Initialize Firebase in service worker
const firebaseConfig = {
  apiKey: "AIzaSyDWnhbrMHJb4B-kwi4G1RPP3YbSEEtquAo",
  authDomain: "expiring-products-app.firebaseapp.com",
  projectId: "expiring-products-app",
  storageBucket: "expiring-products-app.firebasestorage.app",
  messagingSenderId: "805185556283",
  appId: "1:805185556283:web:8281626936439c3859f11e"
};

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages from Firebase Cloud Messaging
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const { notification, data } = payload;
  const title = notification?.title || "Expiring Products";
  const body = notification?.body || "You have items to check!";

  const notificationOptions = {
    body,
    icon: '/assets/img/favicon_colored.png',
    badge: '/assets/img/favicon.png',
    data: {
      url: data?.url || "/",
      category: data?.category || null,
      type: data?.type || "general",
      timestamp: Date.now(),
      ...data,
    },
    actions: [
      {
        action: "view",
        title: "View Items",
        icon: "/assets/img/favicon.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
    tag: data?.type || "expiring-products",
    requireInteraction: data?.type === "urgent",
    vibrate: data?.type === "urgent" ? [200, 100, 200] : [100],
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Forward notification clicks to main service worker
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  const { notification, action } = event;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  if (action === "dismiss") {
    return;
  }

  // Default action or "view" action - open the app
  const urlToOpen = data.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if the app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            // Focus the existing window and navigate if needed
            return client.focus().then(() => {
              if (urlToOpen !== "/" && "navigate" in client) {
                return client.navigate(urlToOpen);
              }
              // Send message to client to handle category switching
              if (data.category) {
                client.postMessage({
                  type: "NOTIFICATION_CLICK",
                  category: data.category,
                  data: data,
                });
              }
            });
          }
        }

        // No existing window found, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error("Failed to handle notification click:", error);
      })
  );
});
