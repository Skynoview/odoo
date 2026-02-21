/**
 * FleetFlow — Error Handler Middleware
 *
 * Centralized error handling:
 *  - Knows about operational vs programming errors
 *  - Returns consistent JSON error shape
 *  - Hides stack traces in production
 */

'use strict';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const isProduction = process.env.NODE_ENV === 'production';

    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    const response = {
        success: false,
        error: {
            message,
            code: err.code || 'SERVER_ERROR',
            ...(isProduction ? {} : { stack: err.stack }),
        },
    };

    // Log server-side errors
    if (statusCode >= 500) {
        console.error('[ErrorHandler]', err);
    }

    res.status(statusCode).json(response);
}

module.exports = errorHandler;
