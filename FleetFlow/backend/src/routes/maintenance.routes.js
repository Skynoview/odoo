/**
 * FleetFlow — Maintenance Routes
 */

'use strict';

const express = require('express');
const router = express.Router();

const maintenanceController = require('../controllers/maintenance.controller');
const { createMaintenanceValidator, updateMaintenanceStatusValidator } = require('../validators/maintenance.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

/**
 * All maintenance routes are protected.
 * Allow 'FleetManager'. Wait, typically mechanics or managers do this. Let's allow FleetManager for now.
 */
router.use(authenticate);
router.use(authorize('FleetManager'));

// GET /api/maintenance
router.get('/', maintenanceController.getAllMaintenanceRecords);

// POST /api/maintenance
router.post('/', createMaintenanceValidator, validate, maintenanceController.createMaintenanceRecord);

// PUT /api/maintenance/:id/status
router.put('/:id/status', updateMaintenanceStatusValidator, validate, maintenanceController.updateMaintenanceStatus);

module.exports = router;
