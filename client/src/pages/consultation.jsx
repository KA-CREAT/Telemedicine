import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import axios from 'axios';
import VideoCall from '../components/VideoCall';
import FileSharing from '../components/FileSharing';

const ConsultationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('call');

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const response = await axios.get(`/api/consultations/${id}`);
        setConsultation(response.data);
      } catch (err) {
        setError('Failed to load consultation details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [id]);

  const handleEndConsultation = async () => {
    try {
      await axios.post(`/api/consultations/end`, {
        roomId: consultation?.roomId,
      });
      navigate('/appointments');
    } catch (err) {
      setError('Failed to end consultation');
      console.error(err);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!consultation) return <Typography>Consultation not found</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Consultation Session
      </Typography>

      <Box sx={{ display: 'flex', mb: 3 }}>
        <Button
          variant={activeTab === 'call' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('call')}
          sx={{ mr: 2 }}
        >
          Video Call
        </Button>
        <Button
          variant={activeTab === 'files' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('files')}
        >
          Shared Files
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Session Details
        </Typography>
        <Typography>Status: {consultation.status}</Typography>
        <Typography>
          Started: {new Date(consultation.startTime).toLocaleString()}
        </Typography>
        {consultation.endTime && (
          <Typography>
            Ended: {new Date(consultation.endTime).toLocaleString()}
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Participants
        </Typography>
        <List>
          {consultation.participants.map((participant) => (
            <ListItem key={participant.userId._id}>
              <Avatar src={participant.userId.pic} sx={{ mr: 2 }} />
              <ListItemText
                primary={`${participant.userId.firstname} ${participant.userId.lastname}`}
                secondary={participant.role}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {activeTab === 'call' ? (
        <VideoCall roomId={consultation.roomId} />
      ) : (
        <FileSharing consultationId={consultation._id} />
      )}

      {consultation.status === 'ongoing' && (
        <Button
          variant="contained"
          color="error"
          onClick={handleEndConsultation}
          sx={{ mt: 3 }}
        >
          End Consultation
        </Button>
      )}
    </Box>
  );
};

export default ConsultationPage;
