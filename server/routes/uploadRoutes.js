const express = require("express");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


const router = express.Router();

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  region: process.env.AWS_DEFAULT_REGION,
});



// Route to generate a presigned URL for uploading files
router.post('/generate-presigned-url/:userID', async (req, res) => {
  const { fileName, fileType } = req.body;
  
  // Assuming userId is stored in req.user by the authentication middleware
  const {userID} = req.params;

  if (!userID) {
    return res.status(401).send({ message: "Unauthenticated" });
  }

  const allowedFileTypes = [
    "image/jpg", "image/jpeg", "image/png"
  ];

  if (!allowedFileTypes.includes(fileType)) {
    return res.status(404).send({ error: "Unsupported Image Type" });
  }

  try {
    const input = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      ContentType: fileType,
      Key: `/uploads/${userID}/documents/${fileName}-${Date.now()}`,
    };

    const putObjectCommand = new PutObjectCommand(input);
    const signedUrl = await getSignedUrl(s3Client, putObjectCommand);
    
    res.status(200).json({ getSignedURL: signedUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ error: "Failed to generate presigned URL" });
  }
});

module.exports= router;