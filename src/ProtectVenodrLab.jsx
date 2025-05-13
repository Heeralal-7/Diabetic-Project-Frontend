import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const Protectlab = ({ children }) => {
  const getLab = sessionStorage.getItem("labtoken");
  const isVendor = JSON.parse(getLab);
  const location = useLocation();
  // console.log(location.pathname);
  if (isVendor && location.pathname === "/vendordashboard") {
    return <Navigate to="/panel" />;
  } else if (!isVendor && location.pathname !== "/vendordashboard") {
    return <Navigate to="/vendordashboard" />;
  }



  return children;
};

export default Protectlab;