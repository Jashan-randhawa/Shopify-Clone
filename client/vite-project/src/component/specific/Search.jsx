import {
  Dialog, DialogTitle, InputAdornment, List,
  Stack, TextField, CircularProgress, Typography,
} from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import { useInputValidation } from "6pp";
import { Search as SearchIcon } from "@mui/icons-material";
import UserItem from "../shared/UserItem";
import api from "../../utils/api";

const Search = ({ onClose }) => {
  const search = useInputValidation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(null);

  const fetchUsers = useCallback(async (query) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/users/search?q=${encodeURIComponent(query || "")}`);
      if (res.data.success) setUsers(res.data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(search.value), 400);
    return () => clearTimeout(timer);
  }, [search.value, fetchUsers]);

  const addfriendhandler = async (id) => {
    setSendingRequest(id);
    try {
      await api.post(`/api/users/friend-request/send/${id}`);
    } catch (err) {
      console.error("Friend request failed", err);
    } finally {
      setSendingRequest(null);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <Stack p={"2rem"} direction={"column"} width={"25rem"}>
        <DialogTitle textAlign={"center"}>Find People</DialogTitle>
        <TextField
          label="Search"
          value={search.value}
          onChange={search.changeHandler}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {loading ? (
          <Stack alignItems="center" py={2}><CircularProgress size={24} /></Stack>
        ) : (
          <List>
            {users.length === 0 && search.value ? (
              <Typography textAlign="center" py={2} color="text.secondary">No users found</Typography>
            ) : (
              users.map((user) => (
                <UserItem
                  user={user}
                  key={user._id}
                  userhandler={addfriendhandler}
                  handlerisloading={sendingRequest === user._id}
                />
              ))
            )}
          </List>
        )}
      </Stack>
    </Dialog>
  );
};

export default Search;
