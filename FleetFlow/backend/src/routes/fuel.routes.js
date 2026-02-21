/**
 * FleetFlow — Fuel Routes
 */

'use strict';

const express = require('express');
const router = express.Router();

const fuelController = require('../controllers/fuel.controller');
const { createFuelValidator, getFuelValidator, deleteFuelValidator } = require('../validators/fuel.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

/**
 * Protected routes.
 * Allowed: FleetManager, FinancialAnalyst
 */
router.use(authenticate);
router.use(authorize('FleetManager', 'FinancialAnalyst'));

// POST /api/fuel
router.post('/', createFuelValidator, validate, fuelController.createFuelLog);

// GET /api/fuel/:vehicleId
router.get('/:vehicleId', getFuelValidator, validate, fuelController.getFuelLogsByVehicle);

// DELETE /api/fuel/:id
router.delete('/:id', deleteFuelValidator, validate, fuelController.deleteFuelLog);

module.exports = router;
