const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");

async function uploadMainImage(req, res) {
  try {
    if (!req.files || !req.files.uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadedFile = req.files.uploadedFile;
    const safeFileName = path.basename(uploadedFile.name); // Prevent directory traversal
    const uploadPath = path.join(__dirname, "../public", safeFileName);

    // Move file securely
    uploadedFile.mv(uploadPath, async (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(500).json({ error: "File upload failed" });
      }

      // Store metadata in MongoDB via Prisma
      const savedFile = await prisma.image.create({
        data: {
          fileName: safeFileName,
          filePath: uploadPath,
          uploadedAt: new Date(),
        },
      });

      res.status(200).json({ message: "File uploaded successfully", savedFile });
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  uploadMainImage,
};