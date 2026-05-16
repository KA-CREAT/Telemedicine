const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  consultationId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Consultation",
    required: true
  },
  patientId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true
  },
  doctorId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank', 'wallet'],
    default: 'card'
  },
  transactionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },
  paymentDate: {
    type: Date
  }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
