import { toast } from 'react-toastify';

// Error severity levels
export const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

// Custom error class for application-specific errors
export class AppError extends Error {
  constructor(message, severity = ErrorSeverity.ERROR, metadata = {}) {
    super(message);
    this.name = 'AppError';
    this.severity = severity;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }
}

// Main error handler function
export const handleError = (error, context = '') => {
  const errorObj = {
    message: error.message || 'An unexpected error occurred',
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack,
  };

  // Log errors differently based on environment
  if (process.env.NODE_ENV === 'development') {
    // In development, log to console with full details
    console.group(`🚨 Error in ${context}`);
    console.error('Error details:', errorObj);
    console.error('Original error:', error);
    console.groupEnd();
  } else {
    // In production, we would send this to a logging service
    // TODO: Implement production logging service
    // Example: LoggingService.logError(errorObj);
  }

  // Show user-friendly notification
  showErrorNotification(error);

  return errorObj;
};

// User-friendly error notifications
export const showErrorNotification = (error) => {
  const message = getUserFriendlyMessage(error);
  
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Convert technical errors to user-friendly messages
const getUserFriendlyMessage = (error) => {
  if (error instanceof AppError) {
    return error.message;
  }

  // Handle common error types
  if (error.response) {
    switch (error.response.status) {
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return 'The submitted data was invalid.';
      case 500:
        return 'An unexpected server error occurred. Please try again later.';
      default:
        return 'An error occurred while processing your request.';
    }
  }

  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  return 'An unexpected error occurred. Please try again later.';
};

// Async error wrapper
export const asyncErrorHandler = (asyncFn) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, asyncFn.name);
      throw error;
    }
  };
}; 