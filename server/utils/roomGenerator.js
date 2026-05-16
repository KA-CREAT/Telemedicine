const crypto = require("crypto");

function generateRoomId() {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = { generateRoomId };