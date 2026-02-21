/**
 * FleetFlow — API Health Route
 *
 * GET /api/health  — basic liveness check
 * GET /api/health/db — database connectivity check
 */

'use strict';

const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// ── GET /api/health ───────────────────────────────────────────────────────────
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FleetFlow API is running 🚀',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
    });
});

// ── GET /api/health/db ────────────────────────────────────────────────────────
router.get('/db', async (req, res, next) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.ping();

        res.status(200).json({
            success: true,
            message: 'Database connection is healthy ✅',
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        next(err);
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
