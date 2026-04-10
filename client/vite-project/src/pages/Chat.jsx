import React, { Fragment, useRef, useState, useEffect, useCallback } from "react";
import Applayout from "../component/layout/Applayout";
import { IconButton, Stack, Typography } from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { Inputbox } from "../component/style/Sylecomponent";
import FileMenu from "../component/dialogs/FileMenu";
import Messagecomponent from "../component/shared/messagecomponent";
import { useParams } from "react-router-dom";
import socket, { 
  connectSocket, 
  sendMessage, 
  joinChat, 
  leaveChat,
  sendTyping,
  sendStopTyping,
  markMessagesAsRead,
  onTyping,
  onStopTyping,
  onMessagesRead,
  onMessageStatus
} from "../utils/socket";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";
import { useAuth } from "../context/AuthContext";

const Chat = () => {
  const { chatid } = useParams();
  const { user } = useAuth();
  const containerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);

  // Fetch chat info
  useEffect(() => {
    if (!chatid) return;
    
    const fetchChatInfo = async () => {
      try {
        const response = await api.get(`/api/chats/${chatid}`);
        if (response.data.success) {
          setChatInfo(response.data.chat);
        }
      } catch (error) {
        console.error("Error fetching chat info:", error);
      }
    };

    fetchChatInfo();
  }, [chatid]);

  // Fetch messages when chat ID changes
  useEffect(() => {
    if (!chatid) return;
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/messages/${chatid}`);
        if (response.data.success) {
          setMessages(response.data.messages);
          // Mark messages as read
          markMessagesAsRead(chatid);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatid]);

  // Connect to socket and listen for new messages
  useEffect(() => {
    // Connect to socket if not already connected
    if (!socket.connected) {
      const token = getAuthToken();
      connectSocket(user._id, token);
    }

    // Join the chat room
    if (chatid) {
      joinChat(chatid).catch(error => {
        console.error('Error joining chat:', error);
        toast.error('Failed to join chat room');
      });
    }

    // Listen for new messages
    const handleNewMessage = (newMessage) => {
      if (newMessage.chat === chatid) {
        setMessages((prev) => [...prev, newMessage]);
        // Mark message as read immediately
        markMessagesAsRead(chatid);
      }
    };

    // Handle message status updates
    const handleMessageStatus = (data) => {
      if (data.chatId === chatid) {
        setMessages((prev) => 
          prev.map(msg => {
            if (msg._id === data.messageId || msg._id === data.tempId) {
              return {
                ...msg,
                _id: data.messageId || msg._id,
                pending: false,
                error: data.error,
                ...data.updates
              };
            }
            return msg;
          })
        );
      }
    };

    // Handle typing indicators
    const handleTyping = (data) => {
      if (data.chatId === chatid && data.userId !== user._id) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
      }
    };

    // Handle stop typing
    const handleStopTyping = (data) => {
      if (data.chatId === chatid && data.userId !== user._id) {
        setTypingUsers((prev) => prev.filter(id => id !== data.userId));
      }
    };

    // Handle messages read
    const handleMessagesRead = (data) => {
      if (data.chatId === chatid && data.userId !== user._id) {
        // Update read status of messages
        setMessages((prev) => 
          prev.map(msg => {
            if (!msg.readBy.includes(data.userId)) {
              return {
                ...msg,
                readBy: [...msg.readBy, data.userId]
              };
            }
            return msg;
          })
        );
      }
    };

    // Register event listeners
    socket.on('receive_message', handleNewMessage);
    onMessageStatus(handleMessageStatus);
    onTyping(handleTyping);
    onStopTyping(handleStopTyping);
    onMessagesRead(handleMessagesRead);

    // Clean up on unmount
    return () => {
      if (chatid) {
        leaveChat(chatid);
      }
      socket.off('receive_message', handleNewMessage);
      socket.off('message_status', handleMessageStatus);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [chatid, user._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // Debounced typing indicator
  const debouncedTyping = useCallback(
    debounce(() => {
      sendStopTyping(chatid);
    }, 1000),
    [chatid]
  );

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    // Send typing indicator
    sendTyping(chatid);
    
    // Debounce stop typing
    debouncedTyping();
  };

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() && attachments.length === 0) return;
    
    try {
      // Prepare message data
      const messageData = {
        content: messageInput,
        chatId: chatid,
        attachments: attachments,
        // Callback for optimistic UI update
        onSent: (tempMessage) => {
          setMessages(prev => [...prev, tempMessage]);
        },
        // Callback for message acknowledgment
        onAck: (data) => {
          if (data.error) {
            toast.error(data.error);
          }
        }
      };
      
      // Send message via socket
      sendMessage(chatid, messageData);
      
      // Clear input fields
      setMessageInput("");
      setAttachments([]);
      
      // Stop typing indicator
      sendStopTyping(chatid);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Handle file attachment
  const handleAttachment = () => {
    setShowFileMenu(true);
  };

  // Add file to attachments
  const addAttachment = (file) => {
    setAttachments((prev) => [...prev, file]);
    setShowFileMenu(false);
  };

  // Get typing indicator text
  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    
    if (typingUsers.length === 1) {
      const typingUser = chatInfo?.members.find(m => m._id === typingUsers[0]);
      return `${typingUser?.name || 'Someone'} is typing...`;
    }
    
    return 'Multiple people are typing...';
  };

  // Get auth token from localStorage or your auth system
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please login again.');
      return null;
    }
    return token;
  };

  return (
    <Fragment>
      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        bgcolor={"rgba(247,247,247,1)"}
        height={"85%"}
        sx={{
          overflowx: "hidden",
          overflowY: "auto",
        }}
      >
        {loading ? (
          <div>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div>No messages yet. Start a conversation!</div>
        ) : (
          messages.map((message) => (
            <Messagecomponent 
              key={message._id} 
              message={message} 
              user={user} 
              chatMembers={chatInfo?.members || []}
            />
          ))
        )}
      </Stack>
      
      {/* Typing indicator */}
      <Stack height="5%" px={2} justifyContent="center">
        {getTypingText() && (
          <Typography variant="caption" fontStyle="italic" color="text.secondary">
            {getTypingText()}
          </Typography>
        )}
      </Stack>
      
      <form
        style={{
          height: "10%",
        }}
        onSubmit={handleSubmit}
      >
        <Stack
          direction={"row"}
          height={"100%"}
          padding={"1rem"}
          position={"relative"}
          alignItems={"center"}
        >
          <IconButton
            sx={{
              position: "absolute",
              left: "5px",
              rotate: "30deg",
            }}
            onClick={handleAttachment}
          >
            <AttachFileIcon />
          </IconButton>
          <Inputbox 
            placeholder="Enter Message here..." 
            value={messageInput}
            onChange={handleInputChange}
          />
          <IconButton
            type="submit"
            sx={{
              rotate: "-30deg",
              bgcolor: "#ea7070",
              color: "white",
              marginLeft: "1rem",
              padding: "0.5rem",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </form>
      {showFileMenu && (
        <FileMenu 
          onClose={() => setShowFileMenu(false)} 
          onFileSelect={addAttachment}
        />
      )}
    </Fragment>
  );
};

export default Applayout()(Chat);
