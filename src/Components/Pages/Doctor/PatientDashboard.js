import React, { useEffect, useState } from "react";
import { messaging } from "../../../firebase"; 
import { getToken, onMessage } from "firebase/messaging";
import axios from "axios";
import PatientVideoCall from "../../Pages/Doctor/PatientVideoCall";
import { toast } from "react-toastify";

function PatientDashboard() {
  const [callData, setCallData] = useState(null);
  const [isTokenSaved, setIsTokenSaved] = useState(false);
  const URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // 🚀 1. Broadcast Channel Listener (Service Worker Click ke liye)
    const broadcast = new BroadcastChannel('fcm_call_channel');
    
    broadcast.onmessage = (event) => {
      console.log("📥 Background Click Data Received:", event.data);
      if (event.data && event.data.type === 'OPEN_VIDEO_CALL') {
        setCallData(event.data.data);
        toast.success("Connecting to Video Call...");
      }
    };

    // 🚀 2. Foreground Listener (Jab user dashboard screen dekh raha ho)
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("🔔 Foreground Notification:", payload);
      if (payload.data && payload.data.callAction === "incoming_call") {
        setCallData(payload.data);
      }
    });

    return () => {
      broadcast.close(); // Cleanup channel
      unsubscribe(); // Cleanup firebase
    };
  }, []);

  // Token registration logic
  useEffect(() => {
    const handleFcmToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: "BLKxFzJaka0ZSgEZCJtWxmB8gIopykUNYAO5NKm6XmHw0UhpChmnufhx23WtbZLi9SRI_e3Xs-LE5I66Cldn2gM"
          });
          if (token) {
            const userData = JSON.parse(localStorage.getItem("user")); 
            const userId = userData?._id || "68870296c61a622be50d4cdf"; 
            await axios.post(`${URL}/fire/updatetoken`, { userId, regId: token });
            setIsTokenSaved(true);
            console.log("✅ Device Token Synced");
          }
        }
      } catch (err) {
        console.error("Token Error:", err);
      }
    };
    handleFcmToken();
  }, [URL]);

  return (
    <div className="container mt-5">
      {/* Video Call Window (Overlay) */}
      {callData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          zIndex: 9999, background: '#000'
        }}>
           <PatientVideoCall 
              callData={callData} 
              onEnd={() => setCallData(null)} 
           />
           <button 
             onClick={() => setCallData(null)}
             style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10000 }}
             className="btn btn-danger rounded-pill shadow"
           >
             Exit Call
           </button>
        </div>
      )}

      {/* Main UI */}
      <div className="card shadow-lg p-5 border-0 rounded-4">
        <h2>Patient Dashboard</h2>
        <p className="text-muted">Status: {isTokenSaved ? "✅ Device Registered" : "⏳ Syncing..."}</p>
        <hr />
        <div className="text-center py-5">
           <div className="spinner-grow text-primary mb-3"></div>
           <h4>Monitoring for Doctor Calls</h4>
           <p className="text-secondary">Keep this page open. Video call automatically starts when doctor calls.</p>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;