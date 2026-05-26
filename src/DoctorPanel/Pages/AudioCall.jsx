import React, { useState, useRef, useEffect, useContext } from 'react';
import { MyContext } from '../../Context/Context';
import AgoraRTC from 'agora-rtc-sdk-ng';

const AudioCallComponent = ({ appointment, patientData, onCallEnd }) => {
  const { sendCallNotification, endCall } = useContext(MyContext);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  
  const clientRef = useRef(null);

  // 🔥 YAHAN APNA AGORA APP ID DALO
const AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;

  const generateChannelName = () => {
    return `call_${appointment._id}_${Date.now()}`;
  };

  const initializeAgora = async (channelName, token) => {
    try {
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      console.log("🔗 Joining Agora channel:", {
        appId: AGORA_APP_ID,
        channelName,
        token
      });

      // Join the channel
      await client.join(AGORA_APP_ID, channelName, token, "0");

      console.log("✅ Successfully joined audio channel");

      // Create local audio track
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      // Publish local audio track
      await client.publish([localAudioTrack]);
      console.log("🎤 Local audio published");

      // Subscribe to remote user
      client.on('user-published', async (user, mediaType) => {
        console.log("👤 Remote user published:", user, mediaType);
        
        if (mediaType === 'audio') {
          await client.subscribe(user, mediaType);
          user.audioTrack.play();
          console.log("🔊 Remote audio playing");
        }
      });

      setIsInCall(true);
      setCallStatus('connected');

    } catch (error) {
      console.error('❌ Error joining audio channel:', error);
      setCallStatus('error');
      setIsCalling(false);
    }
  };

  const startAudioCall = async () => {
    if (!patientData?.regId) {
      alert('Patient registration ID not found');
      return;
    }

    setIsCalling(true);
    setCallStatus('calling');
    
    const channelName = generateChannelName();
    
    try {
      console.log("📤 Sending audio call notification...");
      
      // Send notification to patient
      const notificationResponse = await sendCallNotification(
        patientData.regId,
        channelName,
        "audio",
        appointment._id
      );

      console.log("📨 Notification response:", notificationResponse);

      if (notificationResponse.success) {
        // Initialize Agora with the token from notification
        await initializeAgora(channelName, notificationResponse.details.agoraToken);
      } else {
        throw new Error("Notification failed");
      }
    } catch (error) {
      console.error('❌ Error starting audio call:', error);
      setCallStatus('error');
      setIsCalling(false);
    }
  };

  const endAudioCall = async () => {
    try {
      if (clientRef.current) {
        await clientRef.current.leave();
        console.log("📞 Left Agora audio channel");
      }
      
      // Update call status in backend
      await endCall(appointment._id);
      
      setIsInCall(false);
      setIsCalling(false);
      setCallStatus('ended');
      
      if (onCallEnd) {
        onCallEnd();
      }
    } catch (error) {
      console.error('❌ Error ending audio call:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
  }, []);

  return (
    <div className="audio-call-container">
      <div className="call-controls text-center mb-4">
        {!isCalling && !isInCall && (
          <button 
            className="btn btn-primary btn-lg"
            onClick={startAudioCall}
            disabled={!patientData?.regId}
          >
            <i className="fas fa-phone me-2"></i>
            Start Audio Call
          </button>
        )}
        
        {(isCalling || isInCall) && (
          <button 
            className="btn btn-danger btn-lg"
            onClick={endAudioCall}
          >
            <i className="fas fa-phone-slash me-2"></i>
            End Call
          </button>
        )}
      </div>

      {isInCall && (
        <div className="audio-status text-center">
          <div className="audio-wave mb-3">
            <i className="fas fa-volume-up fa-4x text-primary"></i>
            <div className="pulse-animation"></div>
          </div>
          <h5>Audio call with {patientData?.name}</h5>
          <p>Call in progress...</p>
        </div>
      )}

      {isCalling && !isInCall && (
        <div className="calling-status text-center">
          <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Calling...</span>
          </div>
          <h5>Calling {patientData?.name}...</h5>
          <p>Please wait while we connect the audio call</p>
        </div>
      )}

      <div className={`call-status alert ${
        callStatus === 'connected' ? 'alert-success' :
        callStatus === 'error' ? 'alert-danger' :
        callStatus === 'calling' ? 'alert-warning' : 'alert-info'
      }`}>
        <strong>Status:</strong> {callStatus.toUpperCase()}
      </div>

      {/* Debug Info */}
      <div className="debug-info mt-3 p-2 bg-light rounded">
        <small>
          <strong>Debug Info:</strong><br />
          Patient: {patientData?.name}<br />
          RegId: {patientData?.regId ? 'Available' : 'Not Available'}<br />
          App ID: {AGORA_APP_ID ? 'Set' : 'Not Set'}
        </small>
      </div>
    </div>
  );
};

export default AudioCallComponent;