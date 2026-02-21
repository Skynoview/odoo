/**
 * FleetFlow — Vehicle Routes
 */

'use strict';

const express = require('express');
const router = express.Router();

const vehicleController = require('../controllers/vehicle.controller');
const { vehicleValidator, updateVehicleValidator } = require('../validators/vehicle.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

/**
 * All vehicle routes are protected.
 * Only 'FleetManager' can perform CRUD operations on vehicles.
 * 'Dispatcher' can also view vehicles.
 */
router.use(authenticate);

// 1. GET /api/vehicles — List all (Allowed for both FleetManager and Dispatcher)
router.get('/', authorize('FleetManager', 'Dispatcher'), vehicleController.getAllVehicles);

// Apply strict FleetManager role guard for all subsequent write operations
router.use(authorize('FleetManager'));

// 2. POST /api/vehicles — Create
router.post('/', vehicleValidator, validate, vehicleController.createVehicle);

// 3. PUT /api/vehicles/:id — Update
router.put('/:id', updateVehicleValidator, validate, vehicleController.updateVehicle);

// 4. DELETE /api/vehicles/:id — Soft Delete
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
