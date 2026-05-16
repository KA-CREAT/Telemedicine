import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, CircularProgress } from '@mui/material';
import { CloudUpload, InsertDriveFile, Delete } from '@mui/icons-material';
import axios from 'axios';

interface FileSharingProps {
  consultationId: string;
}

interface SharedFile {
  _id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedBy: {
    _id: string;
    firstname: string;
    lastname: string;
    pic: string;
  };
  createdAt: string;
}

const FileSharing: React.FC<FileSharingProps> = ({ consultationId }) => {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`/api/consultations/${consultationId}/files`);
        setFiles(response.data);
      } catch (err) {
        setError('Failed to load shared files');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [consultationId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('consultationId', consultationId);

      try {
        setLoading(true);
        const response = await axios.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setFiles([...files, response.data]);
      } catch (err) {
        setError('Failed to upload file');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await axios.delete(`/api/files/${fileId}`);
      setFiles(files.filter(file => file._id !== fileId));
    } catch (err) {
      setError('Failed to delete file');
      console.error(err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <Button
        variant="contained"
        startIcon={<CloudUpload />}
        onClick={() => fileInputRef.current?.click()}
        sx={{ mb: 3 }}
      >
        Upload File
      </Button>

      {error && <Typography color="error">{error}</Typography>}

      {loading ? (
        <CircularProgress />
      ) : files.length === 0 ? (
        <Typography>No files shared yet</Typography>
      ) : (
        <Paper sx={{ p: 2 }}>
          <List>
            {files.map((file) => (
              <ListItem 
                key={file._id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleDeleteFile(file._id)}>
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  {/* <Avatar>
                    <InsertDriveFile />
                  </Avatar> */}
                </ListItemAvatar>
                <ListItemText
                  primary={file.filename}
                  secondary={
                    <>
                      <Typography component="span" display="block">
                        Uploaded by: {file.uploadedBy.firstname} {file.uploadedBy.lastname}
                      </Typography>
                      <Typography component="span" display="block">
                        {formatFileSize(file.fileSize)} • {file.fileType}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default FileSharing;