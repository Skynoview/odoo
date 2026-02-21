/**
 * FleetFlow — Trip Validator
 */

'use strict';

const { body } = require('express-validator');

const updateTripStatusValidator = [
    body('status')
        .notEmpty()
        .withMessage('Status is required.')
        .isIn(['Draft', 'Dispatched', 'Completed', 'Cancelled'])
        .withMessage('Invalid status. Choose from: Draft, Dispatched, Completed, Cancelled.')
];

const createTripValidator = [
    body('origin')
        .trim()
        .notEmpty()
        .withMessage('Origin is required.'),

    body('destination')
        .trim()
        .notEmpty()
        .withMessage('Destination is required.'),

    body('cargo_weight')
        .notEmpty()
        .withMessage('Cargo weight is required.')
        .isDecimal()
        .withMessage('Cargo weight must be a valid number.')
        .isFloat({ min: 0 })
        .withMessage('Cargo weight cannot be negative.'),

    body('vehicle_id')
        .optional({ nullable: true }),

    body('driver_id')
        .optional({ nullable: true }),

    body('revenue')
        .optional({ nullable: true })
        .isDecimal()
];

module.exports = { updateTripStatusValidator, createTripValidator };
