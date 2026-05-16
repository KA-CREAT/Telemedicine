const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  consultationId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Consultation",
    required: true
  },
  doctorId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true
  },
  patientId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  medicines: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    instructions: {
      type: String
    }
  }],
  tests: [{
    name: {
      type: String,
      required: true
    },
    instructions: {
      type: String
    }
  }],
  advice: {
    type: String
  },
  followUpDate: {
    type: Date
  }
}, { timestamps: true });

const Prescription = mongoose.model("Prescription", prescriptionSchema);

module.exports = Prescription;