import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const Protect = ({ children }) => {
  const getAdmin = sessionStorage.getItem("admin");
  const isAdmin = JSON.parse(getAdmin);
  const location = useLocation();
  // console.log(location.pathname);
  if (isAdmin && location.pathname === "/admin") {
    return <Navigate to="/dashboard" />;
  } else if (!isAdmin && location.pathname !== "/admin") {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default Protect;
