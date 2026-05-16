const SharedFile = require("../models/sharedfiles");
const Consultation = require("../models/consultation");
const { uploadToCloud } = require("../utils/fileUpload");

// Upload file to consultation
exports.uploadFile = async (req, res) => {
  try {
    const { consultationId, description } = req.body;
    const { userId } = req;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    // Check if user is participant in consultation
    const isParticipant = consultation.participants.some(
      p => p.userId.toString() === userId
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this consultation" });
    }

    // Determine file type
    let fileType;
    if (file.mimetype.startsWith("image/")) {
      fileType = "image";
    } else if (file.mimetype === "application/pdf") {
      fileType = "pdf";
    } else if (
      file.mimetype.startsWith("application/") || 
      file.mimetype.startsWith("text/")
    ) {
      fileType = "document";
    } else {
      fileType = "other";
    }

    // Upload to cloud storage
    const uploadResult = await uploadToCloud(file);

    const sharedFile = new SharedFile({
      consultationId,
      uploadedBy: userId,
      fileType,
      fileUrl: uploadResult.url,
      fileName: file.originalname,
      description
    });

    await sharedFile.save();

    res.status(201).json(sharedFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a shared file
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId } = req;

    const file = await SharedFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.uploadedBy.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete files you uploaded" });
    }

    await file.remove();
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};