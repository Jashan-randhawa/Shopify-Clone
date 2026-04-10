import { useInputValidation } from "6pp";
import {
  Button, Dialog, DialogTitle, Stack,
  TextField, Typography, CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import UserItem from "../shared/UserItem";
import api from "../../utils/api";

const Newgroups = ({ onClose }) => {
  const [members, setMembers] = useState([]);
  const [selectedmembers, setSelectedmembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const groupname = useInputValidation("");

  useEffect(() => {
    api.get("/api/users/friends")
      .then((res) => {
        if (res.data.success) setMembers(res.data.friends || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectmemberhandler = (id) => {
    setSelectedmembers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const submithandler = async () => {
    if (!groupname.value.trim() || selectedmembers.length < 2) return;
    setSubmitting(true);
    try {
      await api.post("/api/chats/group", {
        name: groupname.value,
        members: selectedmembers,
      });
      if (onClose) onClose();
    } catch (err) {
      console.error("Create group failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const closehandler = () => {
    if (onClose) onClose();
  };

  return (
    <Dialog open onClose={closehandler}>
      <Stack p={{ xs: "1rem", sm: "3rem" }} width={"25rem"} spacing={"2rem"}>
        <DialogTitle textAlign={"center"} variant="h4">New Group</DialogTitle>
        <TextField
          label="Group Name"
          value={groupname.value}
          onChange={groupname.changeHandler}
        />
        <Typography variant="body1">Members</Typography>
        {loading ? (
          <Stack alignItems="center"><CircularProgress size={24} /></Stack>
        ) : (
          <Stack>
            {members.map((user) => (
              <UserItem
                user={user}
                key={user._id}
                userhandler={selectmemberhandler}
                isadded={selectedmembers.includes(user._id)}
              />
            ))}
          </Stack>
        )}
        <Stack direction={"row"} justifyContent={"space-evenly"}>
          <Button color="error" onClick={closehandler}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submithandler}
            disabled={submitting || !groupname.value.trim() || selectedmembers.length < 2}
          >
            {submitting ? <CircularProgress size={20} /> : "Create"}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default Newgroups;
