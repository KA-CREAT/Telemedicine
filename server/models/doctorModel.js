const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    fees: {
      type: Number,
      required: true,
    },
    isDoctor: {
      type: Boolean,
      default: false,
    },
    // Add these fields to your existing Appointment model
    prescription: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Prescription",
    },
    consultation: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Consultation",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    // Add these fields to your existing Doctor model
    videoConsultation: {
      type: Boolean,
      default: false,
    },
    consultationFee: {
      type: Number,
    },
    availability: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        slots: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model("Doctor", schema);

module.exports = Doctor;
