import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectDoctor = ({ children }) => {
  // Retrieve the token for the doctor type
  const getDoctorToken = sessionStorage.getItem("doctortoken"); // Assuming 'doctortoken' is used for doctors
  const isDoctor = JSON.parse(getDoctorToken);

  const location = useLocation();

  // If the user is logged in as a doctor and tries to access the general vendor dashboard
  if (isDoctor && location.pathname === "/doctor-login") {
    return <Navigate to="/doctor/dashboard" />; // Redirect to the doctor's dashboard
  }
  // If the user is NOT logged in as a doctor and tries to access any other path
  // (except the general vendor dashboard, which is handled above), redirect them to the login page.
  // You might want to adjust the redirect path based on your app structure.
  else if (!isDoctor && location.pathname !== "/doctors/login") {
     // You might want to redirect to a general login page or a specific doctor login page
    return <Navigate to="/doctors/login" />;
  }

  // Otherwise, render the children (the component requested by the route)
  return children;
};

export default ProtectDoctor;