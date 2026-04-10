import { Button, Dialog, DialogTitle, Stack, Typography, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";
import UserItem from "../shared/UserItem";
import api from "../../utils/api";

const Addmemberdialog = ({ chatid, onClose }) => {
  const [members, setMembers] = useState([]);
  const [selectedmembers, setSelectedmembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const addmembersubmithandler = async () => {
    if (selectedmembers.length === 0) return;
    setSubmitting(true);
    try {
      for (const userId of selectedmembers) {
        await api.put(`/api/chats/group/add/${chatid}/${userId}`);
      }
      if (onClose) onClose();
    } catch (err) {
      console.error("Add member failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const closehandler = () => {
    setSelectedmembers([]);
    if (onClose) onClose();
  };

  return (
    <Dialog open onClose={closehandler}>
      <Stack p={"2rem"} width={"20rem"} spacing={"2rem"}>
        <DialogTitle textAlign={"center"}>Add Members</DialogTitle>
        {loading ? (
          <Stack alignItems="center"><CircularProgress size={24} /></Stack>
        ) : (
          <Stack>
            {members.length > 0 ? (
              members.map((user) => (
                <UserItem
                  key={user._id}
                  user={user}
                  userhandler={selectmemberhandler}
                  isadded={selectedmembers.includes(user._id)}
                />
              ))
            ) : (
              <Typography textAlign={"center"}>No friends to add</Typography>
            )}
          </Stack>
        )}
        <Stack direction={"row"} justifyContent={"space-evenly"} alignItems={"center"}>
          <Button color="error" onClick={closehandler}>Cancel</Button>
          <Button
            variant="contained"
            onClick={addmembersubmithandler}
            disabled={submitting || selectedmembers.length === 0}
          >
            {submitting ? <CircularProgress size={20} /> : "Add Members"}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default Addmemberdialog;
