import React, { useEffect, useState } from "react";
import Header from "./Header";
import Title from "../shared/Title";
import { Grid, CircularProgress, Box } from "@mui/material";
import Chatlist from "../specific/Chatlist";
import { useParams } from "react-router-dom";
import Profile from "../specific/ProfileCard";
import api from "../../utils/api";

const Applayout = () => (WrappedComponent) => {
  return (props) => {
    const params = useParams();
    const chatid = params.chatid;
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      api.get("/api/chats")
        .then((res) => {
          if (res.data.success) setChats(res.data.chats);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

    const handledeletechat = async (e, _id, groupchat) => {
      e.preventDefault();
      try {
        await api.delete(`/api/chats/${_id}`);
        setChats((prev) => prev.filter((c) => c._id !== _id));
      } catch (err) {
        console.error("Delete chat failed", err);
      }
    };

    return (
      <>
        <Title title="Social Media App" />
        <Header />
        <Grid container height={" calc(100vh - 4rem) "}>
          <Grid
            item xs={4} md={3}
            sx={{ display: { xs: "none", md: "block" } }}
            height={"100%"}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={28} />
              </Box>
            ) : (
              <Chatlist
                chats={chats}
                chatid={chatid}
                handledeletechat={handledeletechat}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"}>
            <WrappedComponent {...props} />
          </Grid>
          <Grid
            item md={4} lg={3}
            sx={{ display: { xs: "none", md: "block" }, Padding: "2rem", bgcolor: "rgba(0, 0, 0, 0.8)" }}
            height={"100%"}
          >
            <Profile />
          </Grid>
        </Grid>
      </>
    );
  };
};

export default Applayout;
