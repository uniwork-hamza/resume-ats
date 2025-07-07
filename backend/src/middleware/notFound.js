import { AppError } from './errorHandler.js';
 
export const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
}; 