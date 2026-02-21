/**
 * FleetFlow — Maintenance Validator
 */

'use strict';

const { body } = require('express-validator');

const createMaintenanceValidator = [
    body('vehicle_id')
        .notEmpty()
        .withMessage('Vehicle ID is required.')
        .isInt({ min: 1 })
        .withMessage('Vehicle ID must be a positive integer.'),

    body('service_type')
        .notEmpty()
        .withMessage('Service type is required.')
        .trim(),

    body('description')
        .optional({ nullable: true })
        .trim(),

    body('cost')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('Cost must be a positive number.'),

    body('service_date')
        .notEmpty()
        .withMessage('Service date is required.')
        .isISO8601()
        .withMessage('Service date must be a valid ISO8601 date.'),

    body('status')
        .notEmpty()
        .withMessage('Status is required.')
        .isIn(['Scheduled', 'In Progress', 'Completed'])
        .withMessage('Invalid status. Choose from: Scheduled, In Progress, Completed.'),

    body('next_service_due')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('Next service due must be a valid ISO8601 date.')
];

const updateMaintenanceStatusValidator = [
    body('status')
        .notEmpty()
        .withMessage('Status is required.')
        .isIn(['Scheduled', 'In Progress', 'Completed'])
        .withMessage('Invalid status. Choose from: Scheduled, In Progress, Completed.')
];

module.exports = { createMaintenanceValidator, updateMaintenanceStatusValidator };
