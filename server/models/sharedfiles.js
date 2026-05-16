const mongoose = require("mongoose");

const sharedFileSchema = new mongoose.Schema({
  consultationId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Consultation",
    required: true
  },
  uploadedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true
  },
  fileType: {
    type: String,
    enum: ["image", "pdf", "document", "screenshot"],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
}, { timestamps: true });

const SharedFile = mongoose.model("SharedFile", sharedFileSchema);

module.exports = SharedFile;