// controllers/consultationController.js
const startConsultation = async (req, res) => {
  try {
    const { appointmentId, roomId, doctorId, patientId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const newConsultation = new Consultation({
      appointmentId,
      roomId,
      startTime: new Date(),
      status: "ongoing",
      participants: [
        { userId: doctorId, role: "doctor", joinedAt: new Date() },
        { userId: patientId, role: "patient", joinedAt: new Date() }
      ]
    });

    await newConsultation.save();
    return res.status(201).json({ message: "Consultation started", consultation: newConsultation });
  } catch (error) {
    console.error("Error starting consultation:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { startConsultation }; // ✅ This is required
