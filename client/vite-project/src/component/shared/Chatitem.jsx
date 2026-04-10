import React from "react";
import { Link } from "../style/Sylecomponent";
import { Box, Stack, Typography } from "@mui/material";
import { memo } from "react";
import { Avtarcard } from "./avtarcard";

const Chatitem = ({
  avatar = [],
  name,
  _id,
  groupchat = false,
  samesender,
  isonline,
  newmessagealert,
  index,
  handledeletechat,
}) => {
  return (
    <Link
      to={`/chat/${_id}`}
      onContextMenu={(e) => handledeletechat(e, _id, groupchat)}
      sx={{
        padding: "0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem",
          backgroundColor: samesender ? "black" : "unset",
          color: samesender ? "white" : "unset",
          position: "relative",
        }}
      >
        <Avtarcard avatar={avatar} />
        <Stack>
          <Typography>{name}</Typography>
          {newmessagealert && (
            <Typography>{newmessagealert.count} New Message</Typography>
          )}
        </Stack>
        {isonline ? (
          <Box
            sx={{
              height: "1rem",
              width: "1rem",
              backgroundColor: "black",
              borderRadius: "50%",
              position: "absolute",
              right: "1rem",
            }}
          />
        ) : (
          <Box
            sx={{
              height: "1rem",
              width: "1rem",
              backgroundColor: "red",
              borderRadius: "50%",
              position: "absolute",
              right: "1rem",
            }}
          />
        )}
      </div>
    </Link>
  );
};
export default memo(Chatitem);
