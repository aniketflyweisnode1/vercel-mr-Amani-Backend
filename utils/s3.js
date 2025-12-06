/**
 * AWS S3 file upload utility
 * Handles file uploads to AWS S3 bucket
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

/**
 * Upload file to S3
 * @param {Object} options - Upload options
 * @param {string|Buffer} options.file - File path or buffer
 * @param {string} options.filename - File name in S3
 * @param {string} options.folder - Folder path in S3 (optional)
 * @param {string} options.contentType - MIME type (optional)
 * @param {boolean} options.isBuffer - Whether file is a buffer (default: false)
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadToS3 = async (options) => {
  try {
    const { file, filename, folder = '', contentType, isBuffer = false } = options;

    if (!BUCKET_NAME) {
      throw new Error('AWS S3 bucket name is not configured');
    }

    // Read file if it's a path
    let fileContent;
    if (isBuffer) {
      fileContent = file;
    } else {
      fileContent = fs.readFileSync(file);
    }

    // Determine content type
    const mimeType = contentType || getContentType(filename);

    // Create S3 key (path)
    const key = folder ? `${folder}/${filename}` : filename;

    // Upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: mimeType,
      ACL: 'public-read' // Make file publicly accessible (adjust based on your needs)
    };

    const result = await s3.upload(params).promise();

    logger.info('File uploaded to S3 successfully', {
      key: result.Key,
      location: result.Location,
      bucket: result.Bucket
    });

    return {
      success: true,
      url: result.Location,
      key: result.Key,
      bucket: result.Bucket,
      etag: result.ETag
    };
  } catch (error) {
    logger.error('Error uploading file to S3', {
      error: error.message,
      stack: error.stack,
      filename: options.filename
    });
    
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

/**
 * Upload file from buffer
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - File name
 * @param {string} folder - Folder path (optional)
 * @param {string} contentType - MIME type (optional)
 * @returns {Promise<Object>} Upload result
 */
const uploadBufferToS3 = async (buffer, filename, folder = '', contentType = null) => {
  return uploadToS3({
    file: buffer,
    filename,
    folder,
    contentType,
    isBuffer: true
  });
};

/**
 * Upload file from path
 * @param {string} filePath - Local file path
 * @param {string} filename - File name in S3 (optional, uses original if not provided)
 * @param {string} folder - Folder path (optional)
 * @returns {Promise<Object>} Upload result
 */
const uploadFileToS3 = async (filePath, filename = null, folder = '') => {
  const fileToUpload = filename || path.basename(filePath);
  return uploadToS3({
    file: filePath,
    filename: fileToUpload,
    folder,
    isBuffer: false
  });
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key (path)
 * @returns {Promise<Object>} Delete result
 */
const deleteFromS3 = async (key) => {
  try {
    if (!BUCKET_NAME) {
      throw new Error('AWS S3 bucket name is not configured');
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();

    logger.info('File deleted from S3 successfully', { key });

    return {
      success: true,
      key
    };
  } catch (error) {
    logger.error('Error deleting file from S3', {
      error: error.message,
      stack: error.stack,
      key
    });
    
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

/**
 * Get file URL from S3
 * @param {string} key - S3 object key
 * @returns {string} File URL
 */
const getS3FileURL = (key) => {
  if (!BUCKET_NAME) {
    throw new Error('AWS S3 bucket name is not configured');
  }
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
};

/**
 * Get content type from filename
 * @param {string} filename - File name
 * @returns {string} MIME type
 */
const getContentType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.zip': 'application/zip'
  };
  return contentTypes[ext] || 'application/octet-stream';
};

/**
 * Generate unique filename
 * @param {string} originalFilename - Original file name
 * @returns {string} Unique filename with timestamp
 */
const generateUniqueFilename = (originalFilename) => {
  const ext = path.extname(originalFilename);
  const name = path.basename(originalFilename, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${name}_${timestamp}_${random}${ext}`;
};

module.exports = {
  uploadToS3,
  uploadBufferToS3,
  uploadFileToS3,
  deleteFromS3,
  getS3FileURL,
  getContentType,
  generateUniqueFilename
};

