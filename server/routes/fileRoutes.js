const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/upload", authMiddleware, upload.single("file"), fileController.uploadFile);
router.delete("/:fileId", authMiddleware, fileController.deleteFile);

module.exports = router;