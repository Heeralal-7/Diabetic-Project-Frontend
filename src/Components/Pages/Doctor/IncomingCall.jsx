import React from "react";

const IncomingCall = ({ callData, acceptCall, rejectCall }) => {

  return (
    <div style={{textAlign:"center", padding:"40px"}}>

      <h2>📞 {callData.doctorName} is calling</h2>

      <button onClick={acceptCall}>
        Accept
      </button>

      <button onClick={rejectCall}>
        Reject
      </button>

    </div>
  );

};

export default IncomingCall;