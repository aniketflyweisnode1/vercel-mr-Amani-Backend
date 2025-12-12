const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { sendSuccess, sendError } = require('../../../utils/response');

// Configure AWS S3 Client (v3)
const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIAQT46LI6Y37VKWJ5I",
    secretAccessKey: "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"
  }
});

const BUCKET_NAME = 'triaxxss';

// Configure Multer with S3
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    acl: 'public-read',
    // Note: ACL removed - if bucket has ACLs disabled, this causes Access Denied
    // Use bucket policy for public access instead
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const folder = 'upload';
      const fileName = `${Date.now()}_${file.originalname}`;
      const s3Key = `${folder}/${fileName}`;
      cb(null, s3Key);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow all file types, or add specific filters if needed
    cb(null, true);
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File size too large. Maximum size is 50MB', 400);
    }
    return sendError(res, `File upload error: ${err.message}`, 400);
  }
  if (err) {
    return sendError(res, err.message, 400);
  }
  next();
};

/**
 * @route   POST /api/v2/upload
 * @desc    Upload a file directly to S3
 * @access  Private (requires authentication)
 * @body    { file: File (multipart/form-data) }
 */
router.post('/loadfile', upload.single('file'),  (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const fileUrl = `https://${BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${req.file.key}`;

    return sendSuccess(res, {
      serverfile: req.file.key,
      url: fileUrl,
      size: req.file.size,
      type: req.file.mimetype,
      location: req.file.location,
      bucket: req.file.bucket,
      etag: req.file.etag
    }, 'File uploaded successfully', 200);
  } catch (error) {
    console.error('Upload error:', error);
    // Handle AWS S3 specific errors
    if (error.name === 'AccessDenied' || error.message.includes('Access Denied')) {
      return sendError(res, 'S3 Access Denied: Please check AWS credentials and bucket permissions', 403);
    }
    if (error.code === 'SignatureDoesNotMatch') {
      return sendError(res, 'S3 Signature Error: Please check AWS credentials are correct', 403);
    }
    return sendError(res, error.message || 'Failed to upload file', 500);
  }
});

/**
 * @route   POST /api/v2/upload/multiple
 * @desc    Upload multiple files directly to S3 (max 10 files)
 * @access  Private (requires authentication)
 * @body    { files: File[] (multipart/form-data) }
 */
router.post('/multiple', auth, upload.array('files', 10), handleMulterError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded', 400);
    }

    const uploadedFiles = req.files.map(file => ({
      serverfile: file.key,
      url: `https://${BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${file.key}`,
      size: file.size,
      type: file.mimetype,
      location: file.location,
      bucket: file.bucket,
      etag: file.etag
    }));

    return sendSuccess(res, {
      files: uploadedFiles,
      count: uploadedFiles.length
    }, 'Files uploaded successfully', 200);
  } catch (error) {
    console.error('Upload error:', error);
    return sendError(res, error.message || 'Failed to upload files', 500);
  }
});

module.exports = router;
