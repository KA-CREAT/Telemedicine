const mongoose = require("mongoose");
require("dotenv").config(); // Load .env file

mongoose.set("strictQuery", false);

const mongoURI = process.env.MONGO_URL;

if (!mongoURI) {
  console.error("❌ Error: MONGO_URL is not defined in .env");
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
})
.catch((error) => {
  console.error("❌ MongoDB connection error:", error);
});

module.exports = mongoose;
