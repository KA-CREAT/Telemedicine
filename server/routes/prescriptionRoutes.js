const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescriptionController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, prescriptionController.createPrescription);
router.get("/:id", authMiddleware, prescriptionController.getPrescription);
router.get("/patient/:patientId", authMiddleware, prescriptionController.getPatientPrescriptions);

module.exports = router;