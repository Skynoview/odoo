/**
 * FleetFlow — Dashboard Routes
 */

'use strict';

const express = require('express');
const authenticate = require('../middleware/authenticate');
const { getSummary } = require('../controllers/dashboard.controller');

const router = express.Router();

// GET /api/dashboard/summary
// Protected: requires valid JWT
router.get('/summary', authenticate, getSummary);

module.exports = router;
