import { messaging } from "./firebase"; // Ensure this path is correct
import { getToken } from "firebase/messaging";

export const getFCMToken = async () => {

  try {

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BLKxFzJaka0ZSgEZCJtWxmB8gIopykUNYAO5NKm6XmHw0UhpChmnufhx23WtbZLi9SRI_e3Xs-LE5I66Cldn2gM"
    });

    console.log("FCM TOKEN:", token);

    return token;

  } catch (error) {

    console.log("Token error:", error);

  }

};