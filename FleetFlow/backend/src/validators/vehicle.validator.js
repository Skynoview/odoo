/**
 * FleetFlow — Vehicle Validation Rules
 */

'use strict';

const { body } = require('express-validator');

const vehicleValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required.')
        .isLength({ max: 100 })
        .withMessage('Name cannot exceed 100 characters.'),

    body('model')
        .trim()
        .notEmpty()
        .withMessage('Model is required.')
        .isLength({ max: 100 })
        .withMessage('Model cannot exceed 100 characters.'),

    body('license_plate')
        .trim()
        .notEmpty()
        .withMessage('License plate is required.')
        .isLength({ max: 20 })
        .withMessage('License plate cannot exceed 20 characters.'),

    body('max_load_capacity')
        .optional()
        .isDecimal()
        .withMessage('Max load capacity must be a decimal number.')
        .isFloat({ min: 0 })
        .withMessage('Max load capacity cannot be negative.'),

    body('odometer')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Odometer must be a non-negative integer.'),

    body('status')
        .optional()
        .isIn(['Idle', 'On Trip', 'In Shop', 'Out of Service'])
        .withMessage('Invalid status. Choose from: Idle, On Trip, In Shop, Out of Service.'),

    body('vehicle_type')
        .trim()
        .notEmpty()
        .withMessage('Vehicle type is required.')
        .isIn(['Truck', 'Van', 'Bike'])
        .withMessage('Invalid vehicle type. Choose from: Truck, Van, Bike.'),

    body('region')
        .trim()
        .notEmpty()
        .withMessage('Region is required.')
        .isLength({ max: 50 })
        .withMessage('Region cannot exceed 50 characters.'),
];

const updateVehicleValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Name cannot exceed 100 characters.'),

    body('model')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Model cannot exceed 100 characters.'),

    body('license_plate')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('License plate cannot exceed 20 characters.'),

    body('max_load_capacity')
        .optional()
        .isDecimal()
        .withMessage('Max load capacity must be a decimal number.')
        .isFloat({ min: 0 })
        .withMessage('Max load capacity cannot be negative.'),

    body('odometer')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Odometer must be a non-negative integer.'),

    body('status')
        .optional()
        .isIn(['Idle', 'On Trip', 'In Shop', 'Out of Service'])
        .withMessage('Invalid status. Choose from: Idle, On Trip, In Shop, Out of Service.'),

    body('vehicle_type')
        .optional()
        .trim()
        .isIn(['Truck', 'Van', 'Bike'])
        .withMessage('Invalid vehicle type. Choose from: Truck, Van, Bike.'),

    body('region')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Region cannot exceed 50 characters.'),
];

module.exports = { vehicleValidator, updateVehicleValidator };
