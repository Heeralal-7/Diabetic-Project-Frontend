import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAe1bnFqKjL4DXi6LNTjuWaN3dA5TOwbRI",
  authDomain: "dibeteswala.firebaseapp.com",
  projectId: "dibeteswala",
  messagingSenderId: "1040438763927",
  appId: "1:1040438763927:web:543f592190143c205ae4d2"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);