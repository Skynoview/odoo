/**
 * FleetFlow — Finance Routes
 */

'use strict';

const express = require('express');
const router = express.Router();

const financeController = require('../controllers/finance.controller');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

/**
 * Protected routes.
 * Allowed: FleetManager, FinancialAnalyst
 */
router.use(authenticate);
router.use(authorize('FleetManager', 'FinancialAnalyst'));

// GET /api/finance/vehicle-cost/:vehicleId
router.get('/vehicle-cost/:vehicleId', financeController.getVehicleCosts);

module.exports = router;
