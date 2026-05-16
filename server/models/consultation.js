const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Appointment",
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ["scheduled", "ongoing", "completed", "cancelled"],
    default: "scheduled"
  },
  participants: [{
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["doctor", "patient"],
      required: true
    },
    joinedAt: Date,
    leftAt: Date
  }],
  recordingUrl: {
    type: String
  }
}, { timestamps: true });

const Consultation = mongoose.model("Consultation", consultationSchema);

module.exports = Consultation;