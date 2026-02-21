/**
 * FleetFlow — Fuel Validator
 */

'use strict';

const { body, param } = require('express-validator');

const createFuelValidator = [
    body('vehicle_id')
        .notEmpty()
        .withMessage('Vehicle ID is required.')
        .isInt({ min: 1 })
        .withMessage('Vehicle ID must be a positive integer.'),

    body('liters')
        .notEmpty()
        .withMessage('Liters are required.')
        .isFloat({ min: 0.01 })
        .withMessage('Liters must be a number greater than 0.'),

    body('cost')
        .notEmpty()
        .withMessage('Cost is required.')
        .isFloat({ min: 0.01 })
        .withMessage('Cost must be a number greater than 0.'),

    body('fuel_date')
        .notEmpty()
        .withMessage('Fuel date is required.')
        .isISO8601()
        .withMessage('Fuel date must be a valid ISO8601 date.')
];

const getFuelValidator = [
    param('vehicleId')
        .isInt({ min: 1 })
        .withMessage('Invalid Vehicle ID.')
];

const deleteFuelValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid Fuel Record ID.')
];

module.exports = { createFuelValidator, getFuelValidator, deleteFuelValidator };
