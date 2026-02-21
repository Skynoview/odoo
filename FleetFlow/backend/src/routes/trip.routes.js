/**
 * FleetFlow — Trip Routes
 */

'use strict';

const express = require('express');
const router = express.Router();

const tripController = require('../controllers/trip.controller');
const { updateTripStatusValidator, createTripValidator } = require('../validators/trip.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

/**
 * All trip routes are protected.
 * Allow FleetManager and Dispatcher to interact with trips.
 */
router.use(authenticate);
router.use(authorize('FleetManager', 'Dispatcher'));

// Get all trips
router.get('/', tripController.getAllTrips);

// Create trip
router.post('/', createTripValidator, validate, tripController.createTrip);

// Status transition engine
router.put('/:id/status', updateTripStatusValidator, validate, tripController.updateTripStatus);

module.exports = router;
