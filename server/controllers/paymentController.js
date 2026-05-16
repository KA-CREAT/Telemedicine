// // controllers/paymentController.js
// const axios = require("axios");
// const { v4: uuidv4 } = require("uuid");
// const Payment = require("../models/payment");
// require("dotenv").config();

// const CHAPA_SECRET = process.env.CHAPA_SECRET;

// exports.initiatePayment = async (req, res) => {
//   try {
//     const tx_ref = uuidv4();

//     const {
//       amount,
//       email,
//       first_name,
//       last_name,
//       phone,
//       consultationId,
//       patientId,
//       doctorId
//     } = req.body;

//     // Step 1: Save pending payment
//     await Payment.create({
//       consultationId,
//       patientId,
//       doctorId,
//       amount,
//       transactionId: tx_ref,
//       status: "pending",
//       paymentMethod: "card",
//     });

//     // Step 2: Call Chapa API
//     const payload = {
//       amount,
//       currency: "ETB",
//       email,
//       first_name,
//       last_name,
//       phone_number: phone,
//       tx_ref,
//       callback_url: `http://localhost:5000/api/payment/verify/${tx_ref}`,
//       return_url: `http://localhost:3000/payment-success`,
//       customization: {
//         title: "Consultation Payment",
//         description: "Payment for doctor consultation",
//       },
//     };

//     const response = await axios.post(
//       "https://api.chapa.co/v1/transaction/initialize",
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${CHAPA_SECRET}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     res.json({ checkout_url: response.data.data.checkout_url });

//   } catch (error) {
//     console.error("Payment error:", error.response?.data || error.message);
//     res.status(500).json({ error: "Payment initiation failed" });
//   }
// };
