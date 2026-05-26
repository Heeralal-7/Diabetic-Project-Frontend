/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAe1bnFqKjL4DXi6LNTjuWaN3dA5TOwbRI",
  authDomain: "dibeteswala.firebaseapp.com",
  projectId: "dibeteswala",
  messagingSenderId: "1040438763927",
  appId: "1:1040438763927:web:543f592190143c205ae4d2"
});

const messaging = firebase.messaging();

// 1. Communication Channel banayein
const broadcast = new BroadcastChannel('fcm_call_channel');

messaging.onBackgroundMessage(function(payload) {
  console.log("📥 Background Message received:", payload);

  const notificationTitle = payload.notification.title || "Video Call Invitation";
  const notificationOptions = {
    body: payload.notification.body || "Doctor is calling you...",
    icon: "/logo192.png",
    data: payload.data, // 🚨 Token aur Channel yahan hai
    tag: 'call-notif',
    requireInteraction: true,
    actions: [
      { action: 'accept', title: 'Join Video Call' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🚀 CLICK LOGIC: Jab notification ya button par click ho
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Notification box band karein

  if (event.action === 'close') return;

  const callData = event.notification.data;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 1. Agar tab pehle se khuli hai toh use focus karein
      for (const client of clientList) {
        if (client.url.includes('localhost') || client.url.includes('dibeteswala')) {
          client.focus();
          // 2. Focused tab ko pipeline ke zariye data bhejein
          broadcast.postMessage({ 
            type: 'OPEN_VIDEO_CALL', 
            data: callData 
          });
          return;
        }
      }
      // 2. Agar koi tab nahi khuli toh naya window kholein
      if (clients.openWindow) {
        return clients.openWindow('/patient/dashboard');
      }
    })
  );
});