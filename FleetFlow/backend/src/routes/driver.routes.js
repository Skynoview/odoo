/**
 * FleetFlow — Driver Routes
 */

'use strict';

const express = require('express');
const router = express.Router();

const driverController = require('../controllers/driver.controller');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

/**
 * All driver routes are protected.
 */
router.use(authenticate);
router.use(authorize('FleetManager', 'Dispatcher'));

// 1. GET /api/drivers — List all
router.get('/', driverController.getAllDrivers);

// 2. GET /api/drivers/performance/:id
router.get('/performance/:id', driverController.getDriverPerformance);

// 3. PUT /api/drivers/:id/status
router.put('/:id/status', driverController.updateDriverStatus);

module.exports = router;
