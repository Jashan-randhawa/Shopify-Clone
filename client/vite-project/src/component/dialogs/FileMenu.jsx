import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import { AttachFile as AttachFileIcon, Image as ImageIcon, Description as DocumentIcon } from "@mui/icons-material";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

const FileMenu = ({ onClose, onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      // Upload file
      const response = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (response.data.success) {
        // Pass file data to parent component
        onFileSelect({
          public_id: response.data.public_id,
          url: response.data.url,
          fileType: selectedFile.type
        });
        
        toast.success("File uploaded successfully");
        onClose();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Attach File</DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center" py={2}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          
          <IconButton 
            onClick={triggerFileInput}
            sx={{ 
              width: 80, 
              height: 80,
              border: "1px dashed grey"
            }}
          >
            <AttachFileIcon fontSize="large" />
          </IconButton>
          
          {selectedFile && (
            <Stack direction="row" alignItems="center" spacing={1}>
              {selectedFile.type.includes("image") ? (
                <ImageIcon color="primary" />
              ) : (
                <DocumentIcon color="primary" />
              )}
              <Typography variant="body2">
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </Typography>
            </Stack>
          )}
          
          <Typography variant="caption" color="textSecondary" textAlign="center">
            Click to select a file to upload. Maximum file size: 5MB.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <Button 
          onClick={handleUpload} 
          variant="contained" 
          disabled={!selectedFile || uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileMenu;
