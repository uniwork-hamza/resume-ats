import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new AppError('Failed to extract text from PDF', 500);
  }
};

/**
 * Extract text from Word document (.doc or .docx)
 * @param {string} filePath - Path to the Word document
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromWord = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
  } catch (error) {
    console.error('Word document text extraction error:', error);
    throw new AppError('Failed to extract text from Word document', 500);
  }
};

/**
 * Extract text from any supported file type
 * @param {string} filePath - Path to the file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromFile = async (filePath, mimeType) => {
  try {
    switch (mimeType) {
      case 'application/pdf':
        return await extractTextFromPDF(filePath);
      
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await extractTextFromWord(filePath);
      
      case 'text/plain':
        return fs.readFileSync(filePath, 'utf8');
      
      default:
        throw new AppError(`Unsupported file type: ${mimeType}`, 400);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('File text extraction error:', error);
    throw new AppError('Failed to extract text from file', 500);
  }
};

/**
 * Validate if file type is supported for text extraction
 * @param {string} mimeType - MIME type of the file
 * @returns {boolean} - Whether the file type is supported
 */
export const isSupportedFileType = (mimeType) => {
  const supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  return supportedTypes.includes(mimeType);
};

/**
 * Get file extension from MIME type
 * @param {string} mimeType - MIME type of the file
 * @returns {string} - File extension
 */
export const getFileExtensionFromMimeType = (mimeType) => {
  const mimeToExt = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt'
  };
  return mimeToExt[mimeType] || '';
}; 