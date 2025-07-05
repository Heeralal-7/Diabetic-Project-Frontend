import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectPharmacy = ({ children }) => {
  const getPharmacy = sessionStorage.getItem("Pharmacytoken");
  const isVendor = JSON.parse(getPharmacy);
  const location = useLocation();
  // console.log(location.pathname);
  if (isVendor && location.pathname === "/vendordashboard") {
    return <Navigate to="/pharmacy-dashboard" />;
  } else if (!isVendor && location.pathname !== "/vendordashboard") {
    return <Navigate to="/vendordashboard" />;
  }



  return children;
};

export default ProtectPharmacy;