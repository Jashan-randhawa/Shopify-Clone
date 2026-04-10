import { Box, Stack, Typography } from "@mui/material";
import moment from "moment";
import React, { memo } from "react";
import fileformat from "../../lib/Features";
import Renderattachment from "./Renderattachment";
import { DoneAll as DoneAllIcon } from '@mui/icons-material';

const Messagecomponent = ({ message, user, chatMembers = [] }) => {
  const { sender, content, createdAt, attachment = [], readBy = [], pending } = message;
  const timeago = moment(createdAt).fromNow();
  const samesender = sender._id === user._id;

  // Calculate read status
  const getReadStatus = () => {
    if (pending) return "sending";
    if (!samesender) return null; // Only show read status for sender's messages
    
    const readByOthers = readBy.filter(id => id !== user._id);
    if (readByOthers.length === 0) return "sent";
    if (readByOthers.length < chatMembers.length - 1) return "delivered";
    return "read";
  };

  // Get read status color
  const getReadStatusColor = (status) => {
    switch (status) {
      case "sending":
        return "text.disabled";
      case "sent":
        return "text.secondary";
      case "delivered":
        return "info.main";
      case "read":
        return "success.main";
      default:
        return "text.secondary";
    }
  };

  // Get read status text
  const getReadStatusText = (status) => {
    switch (status) {
      case "sending":
        return "Sending...";
      case "sent":
        return "Sent";
      case "delivered":
        return "Delivered";
      case "read":
        return "Read";
      default:
        return "";
    }
  };

  const readStatus = getReadStatus();

  return (
    <Box
      alignSelf={samesender ? "flex-end" : "flex-start"}
      sx={{
        backgroundColor: "white",
        color: "black",
        borderRadius: "12px",
        padding: "0.75rem",
        maxWidth: "70%",
        position: "relative",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      }}
    >
      {!samesender && (
        <Typography 
          color="primary.main" 
          fontWeight="600" 
          variant="caption" 
          display="block" 
          mb={0.5}
        >
          {sender.name}
        </Typography>
      )}

      {content && (
        <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
          {content}
        </Typography>
      )}

      {attachment && attachment.length > 0 && (
        <Stack spacing={1} mt={content ? 1 : 0}>
          {attachment.map((file, index) => {
            const fileType = fileformat(file.url);
            return (
              <Box key={index}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  {Renderattachment(fileType, file.url)}
                </a>
              </Box>
            );
          })}
        </Stack>
      )}

      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        justifyContent="flex-end"
        mt={0.5}
      >
        <Typography 
          variant="caption" 
          color="text.secondary"
          fontSize="0.7rem"
        >
          {timeago}
        </Typography>

        {samesender && readStatus && (
          <Box 
            component="span" 
            display="flex" 
            alignItems="center" 
            ml={0.5}
            color={getReadStatusColor(readStatus)}
          >
            <DoneAllIcon 
              sx={{ 
                fontSize: '0.9rem',
                opacity: readStatus === "sending" ? 0.5 : 1
              }} 
            />
            <Typography 
              variant="caption" 
              fontSize="0.7rem" 
              ml={0.25}
            >
              {getReadStatusText(readStatus)}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default memo(Messagecomponent);
