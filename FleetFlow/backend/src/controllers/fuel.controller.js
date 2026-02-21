/**
 * FleetFlow — Fuel Controller
 */

'use strict';

const { pool } = require('../config/database');

/**
 * POST /api/fuel
 * Logs a new fuel expense for a vehicle.
 */
async function createFuelLog(req, res, next) {
    try {
        const { vehicle_id, liters, cost, fuel_date } = req.body;

        const [[vehicle]] = await pool.execute('SELECT id FROM vehicles WHERE id = ?', [vehicle_id]);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: { message: `Vehicle ${vehicle_id} not found.` }
            });
        }

        const insertQuery = `
            INSERT INTO fuel_logs (vehicle_id, liters, cost, fuel_date) 
            VALUES (?, ?, ?, ?)
        `;
        const params = [vehicle_id, liters, cost, fuel_date];

        const [result] = await pool.execute(insertQuery, params);

        const [[newLog]] = await pool.execute('SELECT * FROM fuel_logs WHERE id = ?', [result.insertId]);

        return res.status(201).json({
            success: true,
            data: newLog
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/fuel/:vehicleId
 * Fetches all fuel logs for a specific vehicle.
 */
async function getFuelLogsByVehicle(req, res, next) {
    try {
        const { vehicleId } = req.params;

        const query = `
            SELECT * FROM fuel_logs 
            WHERE vehicle_id = ? 
            ORDER BY fuel_date DESC
        `;
        const [rows] = await pool.execute(query, [vehicleId]);

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
 * DELETE /api/fuel/:id
 * Removes a specific fuel log.
 */
async function deleteFuelLog(req, res, next) {
    try {
        const { id } = req.params;

        const [result] = await pool.execute('DELETE FROM fuel_logs WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: { message: `Fuel log with ID ${id} not found.` }
            });
        }

        return res.status(200).json({
            success: true,
            message: `Fuel log ${id} deleted successfully.`
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createFuelLog,
    getFuelLogsByVehicle,
    deleteFuelLog
};
