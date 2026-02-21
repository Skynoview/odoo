/**
 * FleetFlow — Validation Result Handler Middleware
 *
 * Place this middleware AFTER an express-validator rule array in a route.
 * It reads any validation errors and, if present, responds with 422 immediately
 * so the controller never runs with invalid input.
 *
 * Usage:
 *   router.post('/register', registerValidator, validate, authController.register);
 */

'use strict';

const { validationResult } = require('express-validator');

function validate(req, res, next) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();                 // no errors — continue to controller
    }

    // Map errors to a clean { field, message } array
    const formatted = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
    }));

    return res.status(422).json({
        success: false,
        error: {
            message: 'Validation failed. Please fix the errors below.',
            code: 'VALIDATION_ERROR',
            details: formatted,
        },
    });
}

module.exports = validate;
