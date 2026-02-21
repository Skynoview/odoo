/**
 * FleetFlow — Vehicle Controller
 *
 * Handles CRUD operations for fleet vehicles.
 */

'use strict';

const { pool } = require('../config/database');

/**
 * GET /api/vehicles
 * Returns a list of all vehicles.
 */
async function getAllVehicles(req, res, next) {
    try {
        const [rows] = await pool.execute('SELECT * FROM vehicles ORDER BY created_at DESC');

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
 * POST /api/vehicles
 * Creates a new vehicle.
 */
async function createVehicle(req, res, next) {
    try {
        const {
            name,
            model,
            license_plate,
            max_load_capacity,
            odometer,
            status,
            vehicle_type,
            region
        } = req.body;

        // 1. Check uniqueness of license_plate
        const [[existing]] = await pool.execute(
            'SELECT id FROM vehicles WHERE license_plate = ?',
            [license_plate]
        );

        if (existing) {
            return res.status(409).json({
                success: false,
                error: {
                    message: `A vehicle with license plate '${license_plate}' already exists.`,
                    code: 'DUPLICATE_PLATE',
                    field: 'license_plate'
                }
            });
        }

        // 2. Insert
        const [result] = await pool.execute(
            `INSERT INTO vehicles 
            (name, model, license_plate, max_load_capacity, odometer, status, vehicle_type, region) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                model,
                license_plate,
                max_load_capacity || 0,
                odometer || 0,
                status || 'Idle',
                vehicle_type,
                region
            ]
        );

        const newId = result.insertId;

        // 3. Return created object
        const [[newVehicle]] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [newId]);

        return res.status(201).json({
            success: true,
            data: newVehicle
        });

    } catch (err) {
        next(err);
    }
}

/**
 * PUT /api/vehicles/:id
 * Updates an existing vehicle.
 */
async function updateVehicle(req, res, next) {
    try {
        const { id } = req.params;
        const {
            name,
            model,
            license_plate,
            max_load_capacity,
            odometer,
            status,
            vehicle_type,
            region
        } = req.body;

        // 1. Check if vehicle exists
        const [[vehicle]] = await pool.execute('SELECT id FROM vehicles WHERE id = ?', [id]);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: {
                    message: `Vehicle with ID ${id} not found.`,
                    code: 'NOT_FOUND'
                }
            });
        }

        // 2. Check license_plate uniqueness (excluding itself)
        if (license_plate) {
            const [[existing]] = await pool.execute(
                'SELECT id FROM vehicles WHERE license_plate = ? AND id != ?',
                [license_plate, id]
            );

            if (existing) {
                return res.status(409).json({
                    success: false,
                    error: {
                        message: `Another vehicle with license plate '${license_plate}' already exists.`,
                        code: 'DUPLICATE_PLATE',
                        field: 'license_plate'
                    }
                });
            }
        }

        // 3. Update
        await pool.execute(
            `UPDATE vehicles SET 
                name = COALESCE(?, name),
                model = COALESCE(?, model),
                license_plate = COALESCE(?, license_plate),
                max_load_capacity = COALESCE(?, max_load_capacity),
                odometer = COALESCE(?, odometer),
                status = COALESCE(?, status),
                vehicle_type = COALESCE(?, vehicle_type),
                region = COALESCE(?, region)
            WHERE id = ?`,
            [
                name || null,
                model || null,
                license_plate || null,
                max_load_capacity || null,
                odometer || null,
                status || null,
                vehicle_type || null,
                region || null,
                id
            ]
        );

        // 4. Return updated object
        const [[updatedVehicle]] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [id]);

        return res.status(200).json({
            success: true,
            data: updatedVehicle
        });

    } catch (err) {
        next(err);
    }
}

/**
 * DELETE /api/vehicles/:id
 * Soft delete: sets status to 'Out of Service'.
 */
async function deleteVehicle(req, res, next) {
    try {
        const { id } = req.params;

        // 1. Check if vehicle exists
        const [[vehicle]] = await pool.execute('SELECT id FROM vehicles WHERE id = ?', [id]);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: {
                    message: `Vehicle with ID ${id} not found.`,
                    code: 'NOT_FOUND'
                }
            });
        }

        // 2. Perform soft delete
        await pool.execute(
            "UPDATE vehicles SET status = 'Out of Service' WHERE id = ?",
            [id]
        );

        return res.status(200).json({
            success: true,
            message: `Vehicle ${id} has been set to 'Out of Service'.`
        });

    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle
};
