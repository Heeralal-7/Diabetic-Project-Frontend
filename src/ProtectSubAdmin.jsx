import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectSubAdmin = ({ children }) => {
  const getSubAdmin = sessionStorage.getItem("subadmintoken");
  const location = useLocation();

  // Check if token exists and is valid (you might want to add more validation)
  const isSubAdmin = getSubAdmin && getSubAdmin !== 'null' && getSubAdmin !== 'undefined';

  if (isSubAdmin && location.pathname === "/subadmin/login") {
    return <Navigate to="/subadmin-dashboard" />;
  } else if (!isSubAdmin && location.pathname !== "/subadmin/login") {
    return <Navigate to="/subadmin/login" />;
  }

  return children;
};

export default ProtectSubAdmin;