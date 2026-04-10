import React, { Suspense, useState } from "react";
import {
  AppBar, Backdrop, Box, IconButton, Toolbar, Tooltip, Typography,
} from "@mui/material";
import {
  Menu as MenuIcon, Search as SearchIcon, Add as AddIcon,
  Group as GroupIcon, Logout as LogoutIcon, Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Search = React.lazy(() => import("../specific/Search"));
const Notificationdialog = React.lazy(() => import("../specific/Notification"));
const Newgroupdialog = React.lazy(() => import("../dialogs/Newgroups"));

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [ismobile, setismobile] = useState(false);
  const [issearch, setissearch] = useState(false);
  const [isnewgroup, setisnewgroup] = useState(false);
  const [isnotification, setisnotification] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <Box sx={{ flexGrow: 1, bgcolor: "#ea7070" }} height={"4rem"}>
        <AppBar position="static" sx={{ bgcolor: "#ea7070", boxShadow: "none" }} />
        <Toolbar>
          <Typography variant="h6" sx={{ display: { xs: "none", md: "block" } }}>
            APP
          </Typography>
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton color="inherit" onClick={() => setismobile((p) => !p)}>
              <MenuIcon />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box>
            <Tooltip title="Search users">
              <IconButton color="inherit" size="large" onClick={() => setissearch(true)}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="New group">
              <IconButton color="inherit" size="large" onClick={() => setisnewgroup(true)}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Manage groups">
              <IconButton color="inherit" size="large" onClick={() => navigate("/group")}>
                <GroupIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton color="inherit" size="large" onClick={() => setisnotification(true)}>
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton color="inherit" size="large" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Box>

      {issearch && (
        <Suspense fallback={<Backdrop open />}>
          <Search onClose={() => setissearch(false)} />
        </Suspense>
      )}
      {isnotification && (
        <Suspense fallback={<Backdrop open />}>
          <Notificationdialog onClose={() => setisnotification(false)} />
        </Suspense>
      )}
      {isnewgroup && (
        <Suspense fallback={<Backdrop open />}>
          <Newgroupdialog onClose={() => setisnewgroup(false)} />
        </Suspense>
      )}
    </>
  );
};

export default Header;
