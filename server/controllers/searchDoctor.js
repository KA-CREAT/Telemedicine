const Doctor = require('../models/doctorModel'); // Adjust path if needed

exports.searchDoctor = async (req, res) => {
  const { query } = req.query; // single query param

  try {
    let doctors;

    if (query) {
      // Search both name and specialty fields using case-insensitive regex
      doctors = await Doctor.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { specialty: { $regex: query, $options: 'i' } },
        ],
      });
    } else {
      // If no query param, return all doctors or empty array (choose behavior)
      doctors = await Doctor.find({});
      // Or: doctors = [];
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
