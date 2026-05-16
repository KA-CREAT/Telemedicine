const Prescription = require("../models/prescription");
const Consultation = require("../models/consultation");
const Appointment = require("../models/appointmentModel");

// Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const { consultationId, diagnosis, medicines, tests, advice, followUpDate } = req.body;
    const { userId } = req; // Assuming doctor's ID is in the request from auth middleware

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (consultation.status !== "completed") {
      return res.status(400).json({ message: "Consultation must be completed to create a prescription" });
    }

    const appointment = await Appointment.findOne({ consultation: consultationId });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const prescription = new Prescription({
      consultationId,
      doctorId: userId,
      patientId: appointment.userId,
      diagnosis,
      medicines,
      tests,
      advice,
      followUpDate
    });

    await prescription.save();

    // Update appointment with prescription reference
    appointment.prescription = prescription._id;
    await appointment.save();

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get prescription by ID
exports.getPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id)
      .populate("doctorId", "firstname lastname pic")
      .populate("patientId", "firstname lastname pic");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get prescriptions for a patient
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await Prescription.find({ patientId })
      .populate("doctorId", "firstname lastname pic")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};