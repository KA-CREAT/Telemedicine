const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function uploadToLocal(file) {
  const fileExt = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExt}`;
  const filePath = path.join(uploadDir, fileName);

  // Move file from temp location to uploads directory
  await fs.promises.rename(file.path, filePath);

  return {
    url: `/uploads/${fileName}`,
    path: filePath
  };
}

module.exports = { uploadToCloud: uploadToLocal };