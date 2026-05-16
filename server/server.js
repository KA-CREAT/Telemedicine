const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const multer = require("multer");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const socketIo = require("socket.io");

require("dotenv").config();
require("./db/conn");

// Routes
const userRouter = require("./routes/userRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const appointRouter = require("./routes/appointRoutes");
const notificationRouter = require("./routes/notificationRouter");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5015;

// ====================
// Middleware
// ====================

app.use(cors());
app.use(express.json());

// ====================
// Swagger Setup
// ====================

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Doctor Appointment API",
      version: "1.0.0",
      description: "API documentation for Doctor Appointment App",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: [
  "./routes/*.js",
  "./routes/swagger/*.js"
]

};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// ====================
// File Upload Setup
// ====================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      "-" +
      file.originalname;

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ====================
// Routes
// ====================

app.use("/api/user", userRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/appointment", appointRouter);
app.use("/api/notification", notificationRouter);

// ====================
// Upload Route
// ====================

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */

app.post(
  "/api/upload",
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    res.status(200).json({
      success: true,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
    });
  }
);

// ====================
// Static Folders
// ====================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use(
  express.static(path.join(__dirname, "./client/build"))
);

// ====================
// Socket.IO Setup
// ====================

const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Personal notification room
  socket.on("join-user-room", (userId) => {
    socket.join(userId);

    console.log(`User joined room: ${userId}`);
  });

  // Video call notification
  socket.on(
    "doctor-started-call",
    ({ roomId, patientId }) => {
      io.to(patientId).emit("incoming-call", {
        roomId,
      });
    }
  );

  // Join video room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    const users =
      io.sockets.adapter.rooms.get(roomId);

    const totalUsers = users?.size || 0;

    console.log(
      `Room ${roomId} users: ${totalUsers}`
    );

    if (totalUsers === 2) {
      socket.to(roomId).emit("user-joined");
    }

    // WebRTC Offer
    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit(
        "receive-offer",
        offer
      );
    });

    // WebRTC Answer
    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit(
        "receive-answer",
        answer
      );
    });

    // ICE Candidate
    socket.on(
      "ice-candidate",
      ({ roomId, candidate }) => {
        socket.to(roomId).emit(
          "receive-ice",
          candidate
        );
      }
    );

    // Leave Room
    socket.on("leave-room", () => {
      socket.to(roomId).emit("peer-left");
      socket.leave(roomId);
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ====================
// React SPA Fallback
// ====================

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "./client/build/index.html")
  );
});

// ====================
// Start Server
// ====================

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  console.log(
    `Swagger Docs: http://localhost:${PORT}/api-docs`
  );

  console.log(
    `Swagger JSON: http://localhost:${PORT}/swagger.json`
  );
});