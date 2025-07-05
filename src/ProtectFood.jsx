import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectFood = ({ children }) => {
  const getFood = sessionStorage.getItem("foodtoken");
  const isVendor = JSON.parse(getFood);
  const location = useLocation();
  // console.log(location.pathname);
  if (isVendor && location.pathname === "/vendordashboard") {
    return <Navigate to="/food-dashboard" />;
  } else if (!isVendor && location.pathname !== "/vendordashboard") {
    return <Navigate to="/vendordashboard" />;
  }



  return children;
};

export default ProtectFood;