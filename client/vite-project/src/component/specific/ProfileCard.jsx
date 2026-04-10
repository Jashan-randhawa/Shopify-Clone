import { Avatar, Stack, Typography } from "@mui/material";
import React from "react";
import {
  Face as FaceIcon,
  AlternateEmail as UsernameIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Stack spacing={"2rem"} direction={"column"} alignItems={"center"}>
      <Avatar
        src={user.avatar}
        alt={user.name}
        sx={{
          width: 200,
          height: 200,
          objectFit: "contain",
          marginTop: "1rem",
          border: "5px solid white",
          bgcolor: "#1a237e",
          fontSize: "3rem",
        }}
      >
        {!user.avatar && user.name?.[0]?.toUpperCase()}
      </Avatar>
      {user.bio && <ProfileCard heading={"bio"} text={user.bio} />}
      <ProfileCard
        heading={"username"}
        text={`@${user.email?.split("@")[0]}`}
        Icon={<UsernameIcon />}
      />
      <ProfileCard
        heading={"name"}
        text={user.name}
        Icon={<FaceIcon />}
      />
      <ProfileCard
        heading={"joined"}
        text={moment(user.createdAt).fromNow()}
        Icon={<CalendarIcon />}
      />
    </Stack>
  );
};

const ProfileCard = ({ text, Icon, heading }) => (
  <Stack
    direction={"row"}
    alignItems={"center"}
    spacing={"1rem"}
    color={"white"}
    textAlign={"center"}
  >
    {Icon && Icon}
    <Stack>
      <Typography variant={"body1"}>{text}</Typography>
      <Typography color="gray" variant={"caption"}>{heading}</Typography>
    </Stack>
  </Stack>
);

export default Profile;
