import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import React from "react";

const Confirmdeletedialog = ({ open, handleClose, handleDelete }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {" "}
          Are you sure you want to delete this user?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>No</Button>
        <Button onClick={handleDelete} color="error">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Confirmdeletedialog;
