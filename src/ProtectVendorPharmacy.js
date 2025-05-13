import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const Protectpharmacy = ({ children }) => {
  const getPharmacy = sessionStorage.getItem("pharmacytoken");
  const isPharmacy = JSON.parse(getPharmacy);
  const location = useLocation();

  if (isPharmacy && location.pathname === "/pharmacydashboard") {
    return <Navigate to="/pharmacy-dashboard" />;
  } else if (!isPharmacy && location.pathname !== "/pharmacydashboard") {
    return <Navigate to="/pharmacydashboard" />;
  }

  return children;
};

export default Protectpharmacy;
