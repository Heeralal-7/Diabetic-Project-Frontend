import { messaging } from "../../../firebase";
import { onMessage } from "firebase/messaging";

export const listenForCalls = (callback) => {

  onMessage(messaging, (payload) => {

    console.log("Incoming Notification:", payload);

    if (payload.data?.callAction === "incoming_call") {

      callback(payload.data);

    }

  });

};