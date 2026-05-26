import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const PatientVideoCall = ({ callData, onEnd }) => {

  const clientRef = useRef(
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  );

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const localTracksRef = useRef([]);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;

  useEffect(() => {

    const startCall = async () => {

      try {

        const client = clientRef.current;

        await client.join(
          AGORA_APP_ID,
          callData.channelName,
          callData.agoraToken,
          0
        );

        const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();

        localTracksRef.current = tracks;

        tracks[1].play(localVideoRef.current);

        await client.publish(tracks);

        client.on("user-published", async (user, mediaType) => {

          await client.subscribe(user, mediaType);

          if (mediaType === "video") {
            user.videoTrack.play(remoteVideoRef.current);
          }

          if (mediaType === "audio") {
            user.audioTrack.play();
          }

        });

        client.on("user-left", () => {
          alert("Doctor left the call");
          endCall();
        });

      } catch (error) {
        console.error("Video call error:", error);
      }

    };

    startCall();

    return () => {
      cleanup();
    };

  }, []);

  const toggleMic = async () => {

    const audioTrack = localTracksRef.current[0];

    if (!audioTrack) return;

    const newState = !micOn;

    await audioTrack.setEnabled(newState);

    setMicOn(newState);

  };

  const toggleCamera = async () => {

    const videoTrack = localTracksRef.current[1];

    if (!videoTrack) return;

    const newState = !camOn;

    await videoTrack.setEnabled(newState);

    setCamOn(newState);

  };

  const cleanup = async () => {

    try {

      const client = clientRef.current;

      localTracksRef.current.forEach(track => {
        track.stop();
        track.close();
      });

      localTracksRef.current = [];

      await client.leave();

    } catch (err) {
      console.log(err);
    }

  };

  const endCall = async () => {

    await cleanup();

    if (onEnd) onEnd();

  };

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
        padding: "30px",
        color: "white",
        fontFamily: "sans-serif"
      }}
    >

      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        🩺 Video Consultation
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "25px",
          maxWidth: "1100px",
          margin: "auto"
        }}
      >

        {/* Doctor */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "15px",
            padding: "15px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
          }}
        >

          <h4 style={{ marginBottom: "10px" }}>👨‍⚕️ Doctor</h4>

          <div
            ref={remoteVideoRef}
            style={{
              width: "100%",
              height: "400px",
              background: "#000",
              borderRadius: "12px",
              overflow: "hidden"
            }}
          />

        </div>

        {/* Patient */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "15px",
            padding: "15px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
          }}
        >

          <h4 style={{ marginBottom: "10px" }}>🙂 You</h4>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: "400px",
              background: "#000",
              borderRadius: "12px",
              overflow: "hidden"
            }}
          >

            <div
              ref={localVideoRef}
              style={{
                width: "100%",
                height: "100%"
              }}
            />

            {!camOn && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "#000",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "22px",
                  fontWeight: "bold"
                }}
              >
                📷 Camera Off
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Controls */}
      <div
        style={{
          marginTop: "35px",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap"
        }}
      >

        <button
          onClick={toggleMic}
          style={{
            padding: "12px 20px",
            borderRadius: "30px",
            border: "none",
            background: micOn ? "#1abc9c" : "#555",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
          }}
        >
          {micOn ? "🎤 Mute Mic" : "🔇 Unmute Mic"}
        </button>

        <button
          onClick={toggleCamera}
          style={{
            padding: "12px 20px",
            borderRadius: "30px",
            border: "none",
            background: camOn ? "#3498db" : "#555",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
          }}
        >
          {camOn ? "📷 Camera Off" : "📸 Camera On"}
        </button>

        <button
          onClick={endCall}
          style={{
            padding: "12px 25px",
            borderRadius: "30px",
            border: "none",
            background: "#e74c3c",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(0,0,0,0.4)"
          }}
        >
          ❌ End Call
        </button>

      </div>

    </div>

  );

};

export default PatientVideoCall;