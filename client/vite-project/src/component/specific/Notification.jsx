import {
  Avatar, Button, Dialog, DialogTitle,
  ListItem, Stack, Typography, CircularProgress,
} from "@mui/material";
import React, { memo, useEffect, useState } from "react";
import api from "../../utils/api";

const Notification = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/users/friend-requests")
      .then((res) => {
        if (res.data.success) setNotifications(res.data.requests || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const friendrequesthandler = async ({ _id, accept }) => {
    try {
      if (accept) {
        await api.post(`/api/users/friend-request/accept/${_id}`);
      } else {
        await api.post(`/api/users/friend-request/reject/${_id}`);
      }
      setNotifications((prev) => prev.filter((n) => n._id !== _id));
    } catch (err) {
      console.error("Friend request action failed", err);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <Stack p={{ xs: "1rem", sm: "2rem" }} maxWidth={"25rem"}>
        <DialogTitle>Notifications</DialogTitle>
        {loading ? (
          <Stack alignItems="center" py={2}><CircularProgress size={24} /></Stack>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              sender={notification.sender}
              _id={notification._id}
              handler={friendrequesthandler}
              key={notification._id}
            />
          ))
        ) : (
          <Typography textAlign={"center"}>0 Notifications</Typography>
        )}
      </Stack>
    </Dialog>
  );
};

const NotificationItem = memo(({ sender, _id, handler }) => {
  const { name, avatar } = sender;
  return (
    <ListItem>
      <Stack direction={"row"} alignItems={"center"} spacing={"1rem"} width={"100%"}>
        <Avatar src={avatar} alt={name} />
        <Typography
          variant={"body1"}
          sx={{
            flexGrow: 1,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: "1",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
          }}
        >
          {name}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }}>
          <Button onClick={() => handler({ _id, accept: true })}>Accept</Button>
          <Button color="error" onClick={() => handler({ _id, accept: false })}>Reject</Button>
        </Stack>
      </Stack>
    </ListItem>
  );
});

export default Notification;
