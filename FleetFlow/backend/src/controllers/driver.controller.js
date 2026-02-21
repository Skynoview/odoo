/**
 * FleetFlow — Driver Controller
 */

'use strict';

const { pool } = require('../config/database');

/**
 * GET /api/drivers
 * Returns a list of all drivers.
 */
async function getAllDrivers(req, res, next) {
    try {
        const [rows] = await pool.execute('SELECT * FROM drivers ORDER BY created_at DESC');

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/drivers/performance/:id
 * Fetches driver profile, key performance indicators, and historical logs.
 */
async function getDriverPerformance(req, res, next) {
    try {
        const { id } = req.params;

        // Fetch core driver profile
        const [[driver]] = await pool.execute(
            'SELECT id, name, license_number, license_expiry, safety_score, region, status FROM drivers WHERE id = ?',
            [id]
        );

        if (!driver) {
            return res.status(404).json({ success: false, error: { message: `Driver ${id} not found.` } });
        }

        // Aggregate trip metrics
        const [[tripsData]] = await pool.execute(
            `SELECT 
                COUNT(*) as totalTrips, 
                SUM(CASE WHEN status = "Completed" THEN 1 ELSE 0 END) as completedTrips 
             FROM shipments WHERE driver_id = ?`,
            [id]
        );

        // Aggregate incident metrics
        const [[incidentsData]] = await pool.execute(
            'SELECT COUNT(*) as incidentCount FROM driver_incidents WHERE driver_id = ?',
            [id]
        );

        // Fetch history logs
        const [tripHistory] = await pool.execute('SELECT * FROM shipments WHERE driver_id = ? ORDER BY created_at DESC', [id]);
        const [incidentHistory] = await pool.execute('SELECT * FROM driver_incidents WHERE driver_id = ? ORDER BY incident_date DESC', [id]);

        const totalTrips = parseInt(tripsData.totalTrips || 0);
        const completedTrips = parseInt(tripsData.completedTrips || 0);
        const completionRate = totalTrips > 0 ? parseFloat(((completedTrips / totalTrips) * 100).toFixed(1)) : 0;

        return res.status(200).json({
            success: true,
            data: {
                id: driver.id,
                name: driver.name,
                license_number: driver.license_number,
                license_expiry: driver.license_expiry,
                status: driver.status,
                region: driver.region,
                safetyScore: driver.safety_score,
                totalTrips,
                completedTrips,
                completionRate,
                incidentCount: parseInt(incidentsData.incidentCount || 0),
                tripHistory,
                incidentHistory
            }
        });

    } catch (err) {
        next(err);
    }
}

/**
 * PUT /api/drivers/:id/status
 * Updates driver duty status.
 */
async function updateDriverStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['On Duty', 'Off Duty', 'Suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: { message: `Invalid status.` } });
        }

        await pool.execute('UPDATE drivers SET status = ? WHERE id = ?', [status, id]);

        return res.status(200).json({
            success: true,
            message: `Driver status updated to ${status}`
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllDrivers,
    getDriverPerformance,
    updateDriverStatus
};
