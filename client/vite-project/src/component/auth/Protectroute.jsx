import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const Protectroute = ({ children, user, redirect = "Login" }) => {
  if (!user) {
    return <Navigate to={redirect} />;
  }
  return children ? children : <Outlet />;
};

export default Protectroute;
