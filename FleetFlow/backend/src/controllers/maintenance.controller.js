/**
 * FleetFlow — Maintenance Controller
 */

'use strict';

const { pool } = require('../config/database');

/**
 * GET /api/maintenance
 * Retrieves all maintenance records, ordered chronologically.
 */
async function getAllMaintenanceRecords(req, res, next) {
    try {
        const query = `
            SELECT 
                m.*,
                v.name as vehicle_name,
                v.license_plate,
                v.status as vehicle_status
            FROM maintenance_logs m
            JOIN vehicles v ON m.vehicle_id = v.id
            ORDER BY m.created_at DESC
        `;
        const [rows] = await pool.execute(query);

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
 * POST /api/maintenance
 * Creates a new maintenance record and optionally updates vehicle status.
 */
async function createMaintenanceRecord(req, res, next) {
    const connection = await pool.getConnection();

    try {
        const {
            vehicle_id,
            service_type,
            description,
            cost,
            service_date,
            status,
            next_service_due
        } = req.body;

        await connection.beginTransaction();

        // 1. Verify that the vehicle exists
        const [rows] = await connection.execute('SELECT id, status FROM vehicles WHERE id = ? FOR UPDATE', [vehicle_id]);
        const vehicle = rows[0];

        if (!vehicle) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                error: { message: `Vehicle ${vehicle_id} not found.` }
            });
        }

        // 2. Insert maintenance record
        const insertQuery = `
            INSERT INTO maintenance_logs (
                vehicle_id, service_type, description, cost, service_date, status, next_service_due
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const safeCost = cost ? parseFloat(cost) : 0;
        const insertParams = [
            vehicle_id,
            service_type,
            description || null,
            safeCost,
            service_date,
            status,
            next_service_due || null
        ];

        const [insertResult] = await connection.execute(insertQuery, insertParams);

        // 3. Update vehicle status if required
        if (status === 'In Progress') {
            if (vehicle.status !== 'In Shop') {
                await connection.execute(
                    'UPDATE vehicles SET status = ? WHERE id = ?',
                    ['In Shop', vehicle_id]
                );
            }
        }

        // 4. Commit changes
        await connection.commit();

        // 5. Fetch and return new record
        const [[newRecord]] = await pool.execute('SELECT * FROM maintenance_logs WHERE id = ?', [insertResult.insertId]);

        return res.status(201).json({
            success: true,
            data: newRecord
        });

    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
}

/**
 * PUT /api/maintenance/:id/status
 * Updates the status of a maintenance record.
 * If status goes to 'Completed', vehicle returns to 'Idle',
 * If status goes to 'In Progress', vehicle changes to 'In Shop'.
 */
async function updateMaintenanceStatus(req, res, next) {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;
        const { status } = req.body;

        await connection.beginTransaction();

        // 1. Fetch maintenance record and lock the vehicle
        const [[record]] = await connection.execute(
            'SELECT m.*, v.status as current_v_status FROM maintenance_logs m JOIN vehicles v ON m.vehicle_id = v.id WHERE m.id = ? FOR UPDATE',
            [id]
        );

        if (!record) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: { message: 'Maintenance record not found.' } });
        }

        if (record.status === status) {
            await connection.rollback();
            return res.status(200).json({ success: true, message: `Status is already ${status}` });
        }

        // 2. Update record status
        await connection.execute('UPDATE maintenance_logs SET status = ? WHERE id = ?', [status, id]);

        // 3. Update vehicle status accordingly
        let newVehicleStatus = null;
        if (status === 'In Progress') {
            newVehicleStatus = 'In Shop';
        } else if (status === 'Completed' || status === 'Scheduled') {
            // If they finish maintenance, or back out of it, set vehicle back to Idle.
            // Assuming it goes to Idle, unless we want Dispatcher logic to manage it. Generally completion frees the vehicle.
            newVehicleStatus = 'Idle';
        }

        if (newVehicleStatus) {
            await connection.execute('UPDATE vehicles SET status = ? WHERE id = ?', [newVehicleStatus, record.vehicle_id]);
        }

        await connection.commit();

        return res.status(200).json({
            success: true,
            data: { id, status }
        });

    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
}

module.exports = {
    getAllMaintenanceRecords,
    createMaintenanceRecord,
    updateMaintenanceStatus
};
