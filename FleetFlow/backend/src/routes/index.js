/**
 * FleetFlow — Central API Router
 *
 * All versioned routes are registered here.
 * Add new feature routes by importing and mounting them below.
 *
 * Base path: /api
 */

'use strict';

const express = require('express');

// Route modules
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const vehicleRoutes = require('./vehicle.routes');

const tripRoutes = require('./trip.routes');
const driverRoutes = require('./driver.routes');
const maintenanceRoutes = require('./maintenance.routes');
const fuelRoutes = require('./fuel.routes');
const financeRoutes = require('./finance.routes');

const router = express.Router();

// ── Mount routes ──────────────────────────────────────────────────────────────
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/fuel', fuelRoutes);
router.use('/finance', financeRoutes);

module.exports = router;
