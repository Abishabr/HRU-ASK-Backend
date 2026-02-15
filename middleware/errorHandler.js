export const errorHandler = (err, req, res, next) => {
    // Extract status code from error object, default to 500
    const statusCode = err.statusCode || err.status || 500;
    
    // Determine error message based on environment and status code
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal server error'
        : err.message;
    
    // Build error response
    const errorResponse = {
        status: 'error',
        statusCode,
        message,
        requestId: req.id || 'unknown'
    };
    
    // Include validation errors if present
    if (err.errors) {
        errorResponse.errors = err.errors;
    }
    
    // Include stack trace only in development
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = err.stack;
    }
    
    // Log error with full context
    console.error('Error occurred:', {
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown',
        method: req.method,
        path: req.path,
        statusCode,
        message: err.message,
        stack: err.stack,
        user: req.user?.id
    });
    
    // Send JSON response
    res.status(statusCode).json(errorResponse);
};

export default errorHandler;
