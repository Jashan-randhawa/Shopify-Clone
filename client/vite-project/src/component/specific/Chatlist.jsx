import { Stack, Typography } from "@mui/material";
import React from "react";
import Chatitem from "../shared/Chatitem";

const Chatlist = ({
  w = "100%",
  chats = [],
  chatid,
  onlineuser = [],
  newmessagesalert = [],
  handledeletechat,
}) => {
  return (
    <Stack width={w} direction={"column"} overflow={"auto"} height={"100%"}>
      {chats.length === 0 && (
        <Typography textAlign="center" color="text.secondary" p={3}>
          No chats yet
        </Typography>
      )}
      {chats.map((data, index) => {
        const { avatar, name, _id, groupchat, members } = data;
        const newmessagealert = newmessagesalert.find((alert) => alert.chatid === _id);
        const isonline = members?.some((member) =>
          onlineuser.includes(member._id || member)
        );
        return (
          <Chatitem
            key={_id}
            index={index}
            newmessagealert={newmessagealert}
            isonline={isonline}
            avatar={avatar}
            name={name}
            _id={_id}
            groupchat={groupchat}
            samesender={chatid === _id}
            handledeletechat={handledeletechat}
          />
        );
      })}
    </Stack>
  );
};

export default Chatlist;
