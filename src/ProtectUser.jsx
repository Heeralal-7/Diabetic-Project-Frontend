import React from "react";
import { Navigate} from "react-router-dom";

const ProtectUser = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("token"));


  if (!user) {
    return <Navigate to="/UserLogin" />;
  }
  return children;
};

export default ProtectUser;
