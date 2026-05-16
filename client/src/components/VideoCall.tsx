import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper, IconButton } from '@mui/material';
import { Videocam, VideocamOff, Mic, MicOff, CallEnd } from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';

interface VideoCallProps {
  roomId: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [callStarted, setCallStarted] = useState(false);
  const [error, setError] = useState('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<any>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const initCall = async () => {
      try {
        // Join the consultation room
        await axios.post(`/api/consultations/join`, { roomId, userId: 'current-user-id' });

        // Initialize socket connection
        socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
        
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Setup WebRTC
        setupWebRTC();

        socketRef.current.emit('join-room', roomId);
        setCallStarted(true);
      } catch (err) {
        setError('Failed to initialize call');
        console.error(err);
      }
    };

    initCall();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [roomId]);

  const setupWebRTC = () => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnectionRef.current = peerConnection;

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const remoteStream = new MediaStream();
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // ICE candidate handling
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          roomId,
          candidate: event.candidate
        });
      }
    };

    // Socket events
    socketRef.current.on('offer', async (offer: RTCSessionDescriptionInit) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socketRef.current.emit('answer', { roomId, answer });
    });

    socketRef.current.on('answer', async (answer: RTCSessionDescriptionInit) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socketRef.current.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ice candidate', err);
      }
    });
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setCallStarted(false);
    // Additional cleanup and API calls to end consultation
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {error && <Typography color="error">{error}</Typography>}
      
      <Box sx={{ display: 'flex', width: '100%', mb: 2 }}>
        <Paper sx={{ flex: 1, p: 1, mr: 1 }}>
          <Typography variant="subtitle1" align="center">You</Typography>
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            style={{ width: '100%', backgroundColor: '#000' }}
          />
        </Paper>
        <Paper sx={{ flex: 1, p: 1 }}>
          <Typography variant="subtitle1" align="center">Doctor</Typography>
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', backgroundColor: '#000' }}
          />
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <IconButton 
          color={videoEnabled ? 'primary' : 'default'} 
          onClick={toggleVideo}
          sx={{ mx: 1 }}
        >
          {videoEnabled ? <Videocam /> : <VideocamOff />}
        </IconButton>
        <IconButton 
          color={audioEnabled ? 'primary' : 'default'} 
          onClick={toggleAudio}
          sx={{ mx: 1 }}
        >
          {audioEnabled ? <Mic /> : <MicOff />}
        </IconButton>
        <IconButton 
          color="error" 
          onClick={endCall}
          sx={{ mx: 1 }}
        >
          <CallEnd />
        </IconButton>
      </Box>
    </Box>
  );
};

export default VideoCall;