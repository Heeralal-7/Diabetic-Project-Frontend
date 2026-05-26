import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { toast } from "react-toastify";
import { MyContext } from "../../Context/Context";

const VideoCallComponent = ({ appointment, patientData, onCallEnd }) => {
  /* ------------------------- Your Original Logic ------------------------- */
  const { sendCallNotification, endCall } = useContext(MyContext);

  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callStatus, setCallStatus] = useState("idle");
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [cameraAccess, setCameraAccess] = useState("checking");

  const localPlayerRef = useRef(null);
  const remotePlayerRef = useRef(null);

  const clientRef = useRef(
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  );

  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);

  const AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;

  const releaseLocalTracks = useCallback(() => {
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current.close();
      localVideoTrackRef.current = null;
    }
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
    }
  }, []);

  const generateChannelName = () => {
    return appointment?._id?.toString() || `call_${Date.now()}`;
  };

  const setupAgoraEvents = (client) => {
    client.removeAllListeners();
    client.on("user-published", async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          const remoteVideoTrack = user.videoTrack;
          if (remotePlayerRef.current && remoteVideoTrack) {
            remotePlayerRef.current.innerHTML = "";
            remoteVideoTrack.play(remotePlayerRef.current);
          }
        }
        if (mediaType === "audio") {
          const remoteAudioTrack = user.audioTrack;
          if (remoteAudioTrack) remoteAudioTrack.play();
        }
      } catch (error) {
        console.error("Subscribe error:", error);
      }
    });

    client.on("user-unpublished", (user, mediaType) => {
      if (mediaType === "video" && remotePlayerRef.current) {
        remotePlayerRef.current.innerHTML = "";
      }
    });

    client.on("user-left", () => {
      if (remotePlayerRef.current) remotePlayerRef.current.innerHTML = "";
      toast.info(`${patientData?.name || "Patient"} left the call`);
    });

    client.on("connection-state-change", (state, reason) => {
      console.log("Connection:", state, reason);
    });
  };

  const createAndPublishLocalTracks = async (client) => {
    try {
      const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
      localAudioTrackRef.current = tracks[0];
      localVideoTrackRef.current = tracks[1];
      setCameraAccess("granted");

      if (localPlayerRef.current && localVideoTrackRef.current) {
        localPlayerRef.current.innerHTML = "";
        localVideoTrackRef.current.play(localPlayerRef.current, { mirror: true });
      }

      await client.publish([localVideoTrackRef.current, localAudioTrackRef.current]);
    } catch (error) {
      releaseLocalTracks();
      setCameraAccess("denied");
      toast.error("Camera/Mic access failed");
      throw error;
    }
  };

  const endVideoCall = useCallback(async () => {
    try {
      const client = clientRef.current;
      if (client) {
        try { await client.leave(); } catch (err) { console.warn("Leave error:", err); }
      }
      releaseLocalTracks();
      if (localPlayerRef.current) localPlayerRef.current.innerHTML = "";
      if (remotePlayerRef.current) remotePlayerRef.current.innerHTML = "";
      if (isInCall) {
        try { await endCall(appointment._id); } catch (err) { console.warn("Backend endCall error:", err); }
      }
      setIsCalling(false);
      setIsInCall(false);
      setCallStatus("ended");
      if (onCallEnd) onCallEnd();
    } catch (error) {
      console.error("End call error:", error);
    }
  }, [appointment, endCall, isInCall, onCallEnd, releaseLocalTracks]);

  const initializeAgora = async (channelName, token) => {
    try {
      const client = clientRef.current;
      setupAgoraEvents(client);
      await client.join(AGORA_APP_ID, channelName, token || null, null);
      await createAndPublishLocalTracks(client);
      setIsInCall(true);
      setIsCalling(false);
      setCallStatus("connected");
    } catch (error) {
      console.error("Agora Init Error:", error);
      setCallStatus("error");
      endVideoCall();
    }
  };

  const startVideoCall = async () => {
    if (isCalling || isInCall) return;
    if (cameraAccess === "denied") { toast.error("Camera permission required"); return; }
    if (!patientData?.regId) { toast.error("Patient device ID missing"); return; }
    if (!AGORA_APP_ID) { toast.error("Agora App ID missing"); return; }

    setIsCalling(true);
    setCallStatus("calling");
    const channelName = generateChannelName();

    try {
      const notificationResponse = await sendCallNotification(
        patientData.regId,
        channelName,
        "video",
        appointment._id
      );
      if (!notificationResponse?.success) throw new Error("Notification failed");
      const agoraToken = notificationResponse?.details?.agoraToken;
      await initializeAgora(channelName, agoraToken);
    } catch (error) {
      toast.error("Call setup failed");
      endVideoCall();
    }
  };

  const toggleLocalVideo = async () => {
    if (!localVideoTrackRef.current) return;
    const newState = !localVideoEnabled;
    await localVideoTrackRef.current.setEnabled(newState);
    setLocalVideoEnabled(newState);
    if (newState && localPlayerRef.current) {
      localVideoTrackRef.current.play(localPlayerRef.current, { mirror: true });
    }
  };

  const toggleLocalAudio = async () => {
    if (!localAudioTrackRef.current) return;
    const newState = !localAudioEnabled;
    await localAudioTrackRef.current.setEnabled(newState);
    setLocalAudioEnabled(newState);
  };

  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        setCameraAccess("granted");
      } catch { setCameraAccess("denied"); }
    };
    checkCameraPermission();
    return () => { if (clientRef.current) endVideoCall(); };
  }, [endVideoCall]);

  useEffect(() => {
    return () => {
      try {
        const client = clientRef.current;
        if (client) client.leave();
        releaseLocalTracks();
      } catch (error) { console.warn("Cleanup error:", error); }
    };
  }, [releaseLocalTracks]);

  /* ------------------------- UI Rendering ------------------------- */
  return (
    <div className="vc-main-container">
      {/* INTERNAL CSS START */}
      <style>{`
        .vc-main-container {
          position: relative;
          width: 100%;
          height: 600px;
          background: #0f172a;
          border-radius: 12px;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          color: white;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
        }

        .vc-header {
          position: absolute;
          top: 0;
          width: 100%;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
          z-index: 10;
        }

        .patient-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          padding: 6px 16px;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.9rem;
        }

        .vc-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: #111;
        }

        /* Remote Video: Full screen */
        .remote-video-feed {
          width: 100%;
          height: 100%;
        }
        .remote-video-feed > div {
          width: 100% !important;
          height: 100% !important;
        }
        .remote-video-feed video {
          object-fit: cover !important;
        }

        /* Local Video: Picture-in-Picture */
        .local-video-pip {
          position: absolute;
          bottom: 100px;
          right: 20px;
          width: 200px;
          height: 130px;
          background: #1e293b;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          z-index: 20;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }
        .local-video-pip > div {
          width: 100% !important;
          height: 100% !important;
        }
        .local-video-pip video {
          object-fit: cover !important;
        }

        /* Placeholder UI */
        .vc-placeholder {
          text-align: center;
          animation: fadeIn 0.5s ease-out;
        }
        .vc-avatar {
          width: 120px;
          height: 120px;
          background: #334155;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          margin: 0 auto 20px;
          border: 4px solid #475569;
        }
        .ringing-pulse {
          animation: pulse 2s infinite;
        }

        /* Controls bar */
        .vc-controls {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 15px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          padding: 12px 24px;
          border-radius: 50px;
          z-index: 30;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-ctrl {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: all 0.2s;
        }
        .btn-ctrl:hover { background: rgba(255, 255, 255, 0.2); transform: scale(1.05); }
        .btn-ctrl.off { background: #ef4444; }
        .btn-ctrl.hangup { background: #ef4444; width: 60px; height: 60px; font-size: 1.5rem; }
        .btn-ctrl.hangup:hover { background: #dc2626; }

        .btn-primary {
          background: #10b981;
          color: white;
          padding: 12px 32px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-primary:hover { background: #059669; }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .status-pill {
          font-size: 10px;
          text-transform: uppercase;
          background: #1e293b;
          padding: 2px 8px;
          border-radius: 4px;
          color: #94a3b8;
        }
      `}</style>
      {/* INTERNAL CSS END */}

      {/* HEADER */}
      <div className="vc-header">
        <div className="patient-badge">
          <span style={{ color: '#10b981' }}>●</span>
          <span>Consultation: <strong>{patientData?.name || "Patient"}</strong></span>
        </div>
        <div className="status-pill">Status: {callStatus}</div>
      </div>

      {/* CONTENT AREA */}
      <div className="vc-content">
        {!isInCall && !isCalling && (
          <div className="vc-placeholder">
            <div className="vc-avatar">{patientData?.name?.[0] || "P"}</div>
            <h3>Ready for Consultation?</h3>
            <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
              Ensure your camera and microphone are ready.
            </p>
            <button className="btn-primary" onClick={startVideoCall}>
              Start Video Call
            </button>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
              Camera: {cameraAccess}
            </div>
          </div>
        )}

        {isCalling && !isInCall && (
          <div className="vc-placeholder">
            <div className="vc-avatar ringing-pulse">{patientData?.name?.[0] || "P"}</div>
            <h3>Calling {patientData?.name}...</h3>
            <button onClick={endVideoCall} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
              Cancel Call
            </button>
          </div>
        )}

        {isInCall && (
          <>
            {/* FULL REMOTE FEED (The Patient) */}
            <div className="remote-video-feed" ref={remotePlayerRef}>
              {!remotePlayerRef.current?.innerHTML && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#475569' }}>
                  Waiting for patient to join video...
                </div>
              )}
            </div>

            {/* FLOATING LOCAL FEED (The Doctor) */}
            <div className="local-video-pip">
              <div ref={localPlayerRef}></div>
              {!localVideoEnabled && (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', fontSize: '12px' }}>
                  Camera Off
                </div>
              )}
            </div>

            {/* FLOATING CONTROLS */}
            <div className="vc-controls">
              <button 
                className={`btn-ctrl ${!localAudioEnabled ? 'off' : ''}`} 
                onClick={toggleLocalAudio}
                title={localAudioEnabled ? "Mute" : "Unmute"}
              >
                {localAudioEnabled ? "🎤" : "🔇"}
              </button>

              <button className="btn-ctrl hangup" onClick={endVideoCall} title="End Call">
                📞
              </button>

              <button 
                className={`btn-ctrl ${!localVideoEnabled ? 'off' : ''}`} 
                onClick={toggleLocalVideo}
                title={localVideoEnabled ? "Stop Camera" : "Start Camera"}
              >
                {localVideoEnabled ? "📹" : "❌"}
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '8px 20px', background: '#000', fontSize: '11px', color: '#475569' }}>
        Appointment ID: {appointment?._id || "N/A"}
      </div>
    </div>
  );
};

export default VideoCallComponent;