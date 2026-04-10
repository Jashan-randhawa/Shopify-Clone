import {
  Box,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Dashboard,
  Group,
  ManageAccounts,
  Menu as MenuIcon,
  Message,
} from "@mui/icons-material";
import React, { useState } from "react";
import { useLocation, Link as LinkComponent } from "react-router-dom";
import styled from "@emotion/styled";
import { color } from "chart.js/helpers";

const Link = styled(LinkComponent)`
  text-decoration: none;
  border-radius: 2rem;
  color: red;
  padding: 1rem 2rem;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;
const admintab = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <Dashboard />,
  },
  {
    name: "User",
    path: "/admin/user-managment",
    icon: <ManageAccounts />,
  },
  {
    name: "Chat",
    path: "/admin/dashboard/Chat-managment",
    icon: <Group />,
  },
  {
    name: "Message",
    path: "/admin/massage-managment",
    icon: <Message />,
  },
];
const Sidebar = ({ w }) => {
  const location = useLocation();
  return (
    <Stack width={w} direction={"column"} p={"3rem"} spacing={"3rem"}>
      <Typography variant="h5" textTransform={"uppercase"}>
        ADMIN
      </Typography>
      <Stack spacing={"1rem"}>
        {admintab.map((tab) => {
          return (
            <Stack
              sx={
                location.pathname === tab.path && {
                  bgcolor: "black",
                  borderRadius: "2rem",
                  color: "white",
                  "&:hover": {
                    color: "gray",
                  },
                }
              }
            >
              <Link key={tab.path} to={tab.path}>
                <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
                  {tab.icon}
                  <Typography variant="h6">{tab.name}</Typography>
                </Stack>
              </Link>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};

const Adminlayout = ({ children }) => {
  const [ismobile, setismobile] = useState(false);
  const handlemobile = () => {
    setismobile(!ismobile);
  };
  const handleclose = () => {
    setismobile(false);
  };
  return (
    <Grid container maxHeight={"100vh"}>
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          top: "1rem",
          right: "1rem",
        }}
      >
        <IconButton onClick={handlemobile}>
          {ismobile ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      <Grid item md={4} lg={3} sx={{ display: { xs: "none", md: "block" } }}>
        <sidebar />
      </Grid>

      <Grid
        item
        xs={12}
        md={8}
        lg={9}
        sx={{ background: "bisque", height: "100vh" }}
      >
        {children}
      </Grid>
      <Drawer open={ismobile} onClose={handleclose}>
        <Sidebar w="50vw" />
      </Drawer>
    </Grid>
  );
};

export default Adminlayout;
