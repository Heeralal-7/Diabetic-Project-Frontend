// ProtectClinic.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectClinic = ({ children }) => {
  // Retrieve the token for the clinic type
  const getClinicToken = sessionStorage.getItem("clinictoken");
  const isClinic = getClinicToken ? JSON.parse(getClinicToken) : null;

  const location = useLocation();

  // If the user is logged in as a clinic and tries to access clinic login/register pages
  if (isClinic && (location.pathname === "/clinic/login" || location.pathname === "/clinic/register")) {
    return <Navigate to="/clinic/dashboard" replace />;
  }

  // If the user is NOT logged in as a clinic and tries to access protected clinic routes
  if (!isClinic && location.pathname.startsWith("/clinic/") && 
      !["/clinic/login", "/clinic/register"].includes(location.pathname)) {
    return <Navigate to="/clinic/login" replace />;
  }

  // Otherwise, render the children
  return children;
};

export default ProtectClinic;