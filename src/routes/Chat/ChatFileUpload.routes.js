const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadChatFile, uploadMultipleChatFiles } = require('../../controllers/SocketChat.controller');
const { auth } = require('../../../middleware/auth');
const { sendError } = require('../../../utils/response');

// Configure multer for memory storage (to get buffer for S3 upload)
const storage = multer.memoryStorage();

// File filter - only allow images and common file types
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'video/mp4',
    'audio/mpeg',
    'application/zip'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, videos, and audio files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File size too large. Maximum size is 10MB', 400);
    }
    return sendError(res, `File upload error: ${err.message}`, 400);
  }
  if (err) {
    return sendError(res, err.message, 400);
  }
  next();
};

/**
 * @route   POST /api/v2/chat/upload-file
 * @desc    Upload a file for chat (image, document, video, audio)
 * @access  Private (requires authentication)
 * @body    { file: File (multipart/form-data), User_id?: number, UserName?: string, TextMessage?: string, emozi?: string }
 */
router.post('/upload-file', auth, upload.single('file'), handleMulterError, uploadChatFile);

/**
 * @route   POST /api/v2/chat/upload-multiple-files
 * @desc    Upload multiple files for chat (max 5 files)
 * @access  Private (requires authentication)
 * @body    { files: File[] (multipart/form-data), User_id?: number, UserName?: string, TextMessage?: string, emozi?: string }
 */
router.post('/upload-multiple-files', auth, upload.array('files', 5), handleMulterError, uploadMultipleChatFiles);

module.exports = router;
