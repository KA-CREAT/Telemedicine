import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "../styles/video.css";

const SOCKET_SERVER_URL = "http://localhost:5015";
const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const VideoCallPage = () => {
  const { appointmentId: roomId = "main" } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const socket = useRef(null);
  const localStream = useRef(null);
  const chatContainerRef = useRef(null);

  // Audio/Video states
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [focusedVideo, setFocusedVideo] = useState(null);
  const [connectionState, setConnectionState] = useState("connecting");

  // Chat states
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showChat, setShowChat] = useState(true);

  const initializePeerConnection = () => {
    try {
      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);
      
      peerConnection.current.onconnectionstatechange = () => {
        const state = peerConnection.current?.connectionState;
        setConnectionState(state || "disconnected");
        console.log("Connection state changed:", state);
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate && socket.current?.connected) {
          socket.current.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      return true;
    } catch (error) {
      console.error("Error initializing peer connection:", error);
      return false;
    }
  };

  const initializeMediaStream = async () => {
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      // Add tracks to peer connection if it exists
      if (peerConnection.current) {
        localStream.current.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, localStream.current);
        });
      }

      return true;
    } catch (error) {
      console.error("Error getting user media:", error);
      return false;
    }
  };

  const initializeSocket = () => {
    try {
      socket.current = io(SOCKET_SERVER_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.current.on("connect", () => {
        console.log("Socket connected");
        socket.current.emit("join-room", roomId);
      });

      socket.current.on("user-joined", async () => {
        try {
          if (!peerConnection.current) {
            if (!initializePeerConnection()) return;
          }

          if (peerConnection.current.connectionState === "closed") {
            console.log("PeerConnection was closed, reinitializing...");
            if (!initializePeerConnection()) return;
          }

          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          socket.current.emit("offer", { roomId, offer });
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      });

      socket.current.on("receive-offer", async (offer) => {
        try {
          if (!peerConnection.current) {
            if (!initializePeerConnection()) return;
          }

          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.current.emit("answer", { roomId, answer });
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      });

      socket.current.on("receive-answer", async (answer) => {
        try {
          if (!peerConnection.current) return;
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      });

      socket.current.on("receive-ice", async (candidate) => {
        try {
          if (!peerConnection.current) return;
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      });

      socket.current.on("peer-left", () => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      socket.current.on("chat-message", (message) => {
        setMessages((msgs) => [...msgs, { ...message, sender: "peer" }]);
      });

      socket.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      return true;
    } catch (error) {
      console.error("Error initializing socket:", error);
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (!initializePeerConnection()) return;
        if (!await initializeMediaStream()) return;
        if (!initializeSocket()) return;
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    init();

    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
        localStream.current = null;
      }
    };
  }, [roomId]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Toggle mic
  const toggleMic = () => {
    const audioTrack = localStream.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  // Toggle cam
  const toggleCam = () => {
    const videoTrack = localStream.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
    }
  };

  // Toggle chat visibility
  const toggleChat = () => {
    setShowChat(!showChat);
  };

  // Video focus toggle
  const handleVideoClick = (videoType) => {
    setFocusedVideo((prev) => (prev === videoType ? null : videoType));
  };

  // Styles for video elements
  const getVideoStyle = (videoType) => {
    const baseStyle = {
      borderRadius: "8px",
      backgroundColor: "#000",
      cursor: "pointer",
      transition: "all 0.3s ease",
      objectFit: "cover",
    };

    if (!focusedVideo) {
      return {
        ...baseStyle,
        width: showChat ? "45%" : "48%",
        height: showChat ? "60%" : "70%",
      };
    } else if (focusedVideo === videoType) {
      return {
        ...baseStyle,
        width: showChat ? "70%" : "90%",
        height: "80vh",
      };
    } else {
      return {
        ...baseStyle,
        width: "120px",
        height: "90px",
        position: "absolute",
        bottom: "20px",
        right: videoType === "local" ? "20px" : "160px",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      };
    }
  };

  // Send text message
  const sendMessage = () => {
    if (inputMessage.trim() === "") return;
    const message = {
      type: "text",
      content: inputMessage.trim(),
      sender: "me",
      timestamp: Date.now(),
    };
    setMessages((msgs) => [...msgs, message]);
    socket.current.emit("chat-message", { roomId, message });
    setInputMessage("");
  };

  // Handle pressing Enter in chat input
  const handleInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For demo: create a local URL for preview/download
    const fileUrl = URL.createObjectURL(file);
    const message = {
      type: "file",
      content: {
        name: file.name,
        url: fileUrl,
        size: file.size,
        type: file.type.split('/')[0] // 'image', 'video', 'application', etc.
      },
      sender: "me",
      timestamp: Date.now(),
    };

    setMessages((msgs) => [...msgs, message]);
    socket.current.emit("chat-message", { roomId, message });

    // Clear input
    e.target.value = null;
  };

  return (
    <div
      className="video-container"
      style={{
        position: "relative",
        display: "flex",
        height: "100vh",
        backgroundColor: "#111",
      }}
    >
      {/* Main video area */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        {/* Video display area */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            width: "100%",
            marginBottom: "20px",
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="local-video"
            style={getVideoStyle("local")}
            onClick={() => handleVideoClick("local")}
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
            style={getVideoStyle("remote")}
            onClick={() => handleVideoClick("remote")}
          />
        </div>

        {/* Controls */}
        <div
          className="video-actions"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            zIndex: 10,
          }}
        >
          <button
            onClick={toggleMic}
            aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
            style={{
              background: micOn ? "#4caf50" : "#f44336",
              border: "none",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {micOn ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#fff"
                height="24px"
                viewBox="0 0 24 24"
                width="24px"
              >
                <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
                <path d="M19 11v1a7 7 0 0 1-14 0v-1H3v1a9 9 0 0 0 8 8.91V22h2v-1.09A9 9 0 0 0 21 12v-1z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#fff"
                height="24px"
                viewBox="0 0 24 24"
                width="24px"
              >
                <path d="M19 11v1a7 7 0 0 1-14 0v-1H3v1a9 9 0 0 0 8 8.91V22h2v-1.09A9 9 0 0 0 21 12v-1z" />
                <path d="M15.59 10.59L12 7l-3.59 3.59L7 10v1a3 3 0 0 0 6 0v-1zM5 5.41L3.59 7 4 7.41 5.41 5.99 5 5.41z" />
                <path d="M20.49 20.49L4.1 4.1 2.69 5.51l16.39 16.39z" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleCam}
            aria-label={camOn ? "Turn off camera" : "Turn on camera"}
            style={{
              background: camOn ? "#4caf50" : "#f44336",
              border: "none",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {camOn ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#fff"
                height="24px"
                viewBox="0 0 24 24"
                width="24px"
              >
                <path d="M17 10.5V6c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4.5l4 4v-11l-4 4z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#fff"
                height="24px"
                viewBox="0 0 24 24"
                width="24px"
              >
                <path d="M21 6.5l-4 4V6c0-1.1-.9-2-2-2H5c-.39 0-.75.15-1.01.39L21 20.9 22.41 19.5 21 18.09V6.5zM17 10.5v4.59L5.41 4H15c1.1 0 2 .9 2 2v4.5zM3.27 3L2 4.27l3.16 3.16C4.18 8.1 4 8.52 4 9v6c0 1.1.9 2 2 2h8c.48 0 .9-.18 1.23-.47l4.51 4.51 1.27-1.27L3.27 3z" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleChat}
            aria-label={showChat ? "Hide chat" : "Show chat"}
            style={{
              background: "#2196F3",
              border: "none",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#fff"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat sidebar */}
      {showChat && (
        <div
          style={{
            width: "350px",
            backgroundColor: "#222",
            borderLeft: "1px solid #444",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          <div
            style={{
              padding: "15px",
              borderBottom: "1px solid #444",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            Chat
          </div>

          {/* Messages container */}
          <div
            ref={chatContainerRef}
            style={{
              flexGrow: 1,
              overflowY: "auto",
              padding: "15px",
            }}
          >
            {messages.length === 0 ? (
              <div style={{ color: "#777", textAlign: "center", marginTop: "20px" }}>
                No messages yet
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "15px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender === "me" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: msg.sender === "me" ? "#4caf50" : "#333",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "18px",
                      maxWidth: "80%",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.type === "text" ? (
                      msg.content
                    ) : (
                      <div>
                        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                          📎 {msg.content.name}
                        </div>
                        {msg.content.type === "image" ? (
                          <img
                            src={msg.content.url}
                            alt={msg.content.name}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "200px",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          <a
                            href={msg.content.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#fff", textDecoration: "underline" }}
                          >
                            Download file ({Math.round(msg.content.size / 1024)} KB)
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aaa",
                      marginTop: "4px",
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input area */}
          <div
            style={{
              padding: "15px",
              borderTop: "1px solid #444",
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleInputKeyPress}
              placeholder="Type a message..."
              style={{
                flexGrow: 1,
                borderRadius: "20px",
                border: "1px solid #555",
                padding: "10px 15px",
                backgroundColor: "#333",
                color: "white",
                outline: "none",
              }}
            />
            <label
              htmlFor="file-upload"
              style={{
                backgroundColor: "#444",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#fff"
                height="20px"
                viewBox="0 0 24 24"
                width="20px"
              >
                <path d="M19 13v5c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-5H3v5c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4v-5h-2z" />
                <path d="M12 15l5-6h-3V3h-4v6H7l5 6z" />
              </svg>
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;