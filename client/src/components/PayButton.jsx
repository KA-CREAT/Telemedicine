// const PayButton = ({ consultationId, patientId, doctorId, amount, email, firstName, lastName, phone }) => {
//   const handlePayment = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/api/pay", {
//         consultationId,
//         patientId,
//         doctorId,
//         amount,
//         email,
//         first_name: firstName,
//         last_name: lastName,
//         phone,
//       });

//       window.location.href = res.data.checkout_url;
//     } catch (error) {
//       console.error("Payment failed:", error);
//       alert("Payment initiation failed.");
//     }
//   };

//   return <button onClick={handlePayment}>Pay with Chapa</button>;
// };
