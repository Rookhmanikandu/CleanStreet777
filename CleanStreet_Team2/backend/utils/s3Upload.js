const { S3Client, DeleteObjectCommand, CopyObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure AWS SDK v3 S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Check if S3 is properly configured
const isS3Configured = process.env.AWS_ACCESS_KEY_ID && 
                       process.env.AWS_SECRET_ACCESS_KEY && 
                       process.env.AWS_S3_BUCKET_NAME &&
                       process.env.AWS_REGION;

if (isS3Configured) {
  console.log('🔧 S3 Configuration Status: ✅ Configured');
  console.log('📍 Region:', process.env.AWS_REGION);
  console.log('🪣 Bucket:', process.env.AWS_S3_BUCKET_NAME);
} else {
  console.log('🔧 S3 Configuration Status: ❌ Not Configured - Using Local Storage');
  console.log('⚠️ Missing:', !process.env.AWS_ACCESS_KEY_ID ? 'ACCESS_KEY_ID ' : '',
                            !process.env.AWS_SECRET_ACCESS_KEY ? 'SECRET_ACCESS_KEY ' : '',
                            !process.env.AWS_S3_BUCKET_NAME ? 'BUCKET_NAME ' : '',
                            !process.env.AWS_REGION ? 'REGION' : '');
}

// Configure multer for S3 upload (if S3 is configured) or local storage (fallback)
const upload = isS3Configured ? multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        userId: req.user?.id || 'unknown',
        uploadTime: new Date().toISOString()
      });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `complaints/${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}) : multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const fs = require('fs');
      const uploadDir = 'uploads/complaints';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `complaint-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Function to delete file from S3
const deleteFromS3 = async (fileUrl) => {
  try {
    // Extract key from URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return { success: false, message: error.message };
  }
};

// Function to update metadata
const updateS3Metadata = async (fileUrl, metadata) => {
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1);

    const command = new CopyObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Metadata: metadata,
      MetadataDirective: 'REPLACE',
      CopySource: `${process.env.AWS_S3_BUCKET_NAME}/${key}`
    });

    await s3Client.send(command);
    return { success: true, message: 'Metadata updated successfully' };
  } catch (error) {
    console.error('Error updating S3 metadata:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  upload,
  deleteFromS3,
  updateS3Metadata,
  s3Client
};
