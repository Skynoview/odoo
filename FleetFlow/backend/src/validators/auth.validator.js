/**
 * FleetFlow — Auth Validators
 *
 * Centralised express-validator rule chains for auth endpoints.
 * Import the array directly and spread it into the route definition.
 */

'use strict';

const { body } = require('express-validator');

// Valid role enum values — kept in sync with the DB ENUM definition
const VALID_ROLES = [
    'FleetManager',
    'Dispatcher',
    'SafetyOfficer',
    'FinancialAnalyst',
];

// ── Register ──────────────────────────────────────────────────────────────────
const registerValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required.')
        .isLength({ min: 2, max: 120 })
        .withMessage('Name must be between 2 and 120 characters.'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required.')
        .isEmail()
        .withMessage('Please provide a valid email address.')
        .normalizeEmail()            // lowercase + strip dots in Gmail, etc.
        .isLength({ max: 255 })
        .withMessage('Email must not exceed 255 characters.'),

    body('password')
        .notEmpty()
        .withMessage('Password is required.')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters.')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter.')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number.'),

    body('role')
        .optional()                  // defaults to 'Dispatcher' in the DB if omitted
        .trim()
        .isIn(VALID_ROLES)
        .withMessage(
            `Role must be one of: ${VALID_ROLES.join(', ')}.`
        ),
];

// ── Login ─────────────────────────────────────────────────────────────────────
// Intentionally lighter than register — no password-strength rules here.
// We only need to know that the fields are present and email looks valid.
const loginValidator = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required.')
        .isEmail()
        .withMessage('Please provide a valid email address.')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required.'),
];

module.exports = { registerValidator, loginValidator, VALID_ROLES };
