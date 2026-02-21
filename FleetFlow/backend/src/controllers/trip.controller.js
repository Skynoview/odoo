/**
 * FleetFlow — Trip Controller
 * 
 * Handles logic for trips/shipments, including complex status transitions.
 */

'use strict';

const { pool } = require('../config/database');

async function getAllTrips(req, res, next) {
    try {
        const query = `
            SELECT 
                s.*,
                v.name as vehicle_name,
                v.license_plate,
                v.max_load_capacity,
                d.name as driver_name
            FROM shipments s
            LEFT JOIN vehicles v ON s.vehicle_id = v.id
            LEFT JOIN drivers d ON s.driver_id = d.id
            ORDER BY s.created_at DESC
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

async function createTrip(req, res, next) {
    try {
        const { origin, destination, cargo_weight, vehicle_id, driver_id, revenue } = req.body;

        // Fetch vehicle capacity if vehicle is assigned
        if (vehicle_id) {
            const [[vehicle]] = await pool.execute('SELECT max_load_capacity FROM vehicles WHERE id = ?', [vehicle_id]);
            if (!vehicle) {
                return res.status(404).json({ success: false, error: { message: 'Vehicle not found.' } });
            }
            if (parseFloat(cargo_weight) > parseFloat(vehicle.max_load_capacity)) {
                return res.status(400).json({
                    success: false,
                    error: { message: `Cargo weight (${cargo_weight} kg) exceeds vehicle max capacity (${vehicle.max_load_capacity} kg).` }
                });
            }
        }

        // Validate Driver
        if (driver_id) {
            const [[driver]] = await pool.execute('SELECT status, license_expiry FROM drivers WHERE id = ?', [driver_id]);
            if (!driver) {
                return res.status(404).json({ success: false, error: { message: 'Driver not found.' } });
            }
            if (driver.status !== 'On Duty') {
                return res.status(400).json({ success: false, error: { message: "Driver is not 'On Duty'." } });
            }
            const today = new Date();
            // Start of today mapping to avoid false negatives on same-day expiry
            today.setHours(0, 0, 0, 0);
            const expiry = new Date(driver.license_expiry);
            if (expiry < today) {
                return res.status(400).json({ success: false, error: { message: "Driver license is expired." } });
            }
        }


        const [result] = await pool.execute(
            `INSERT INTO shipments (origin, destination, cargo_weight, vehicle_id, driver_id, status, revenue) 
            VALUES (?, ?, ?, ?, ?, 'Draft', ?)`,
            [
                origin,
                destination,
                cargo_weight,
                vehicle_id || null,
                driver_id || null,
                revenue || null
            ]
        );

        const newId = result.insertId;
        const [[newTrip]] = await pool.execute('SELECT * FROM shipments WHERE id = ?', [newId]);

        return res.status(201).json({
            success: true,
            data: newTrip
        });

    } catch (err) {
        next(err);
    }
}

/**
 * PUT /api/trips/:id/status
 * Updates the status of a trip (shipment), and handles corresponding
 * vehicle and driver state changes in a controlled transaction.
 */
async function updateTripStatus(req, res, next) {
    // 1. Get a connection for the transaction
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;
        const { status } = req.body;

        // Ensure valid status provided
        const validStatuses = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                    code: 'INVALID_STATUS'
                }
            });
        }

        // 2. Start Transaction
        await connection.beginTransaction();

        // 3. Fetch the target shipment WITH exclusive lock
        // We use FOR UPDATE to prevent race conditions during state transfer
        const [[shipment]] = await connection.execute(
            'SELECT * FROM shipments WHERE id = ? FOR UPDATE',
            [id]
        );

        if (!shipment) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                error: { message: `Trip ${id} not found.`, code: 'NOT_FOUND' }
            });
        }

        const currentStatus = shipment.status;
        const vehicleId = shipment.vehicle_id;
        const driverId = shipment.driver_id;

        // Skip if there's no actual change to prevent unnecessary thrashing
        if (currentStatus === status) {
            await connection.rollback();
            return res.status(200).json({
                success: true,
                message: `Trip is already in '${status}' state.`
            });
        }

        // 4. Update the shipment status
        let updateQuery = 'UPDATE shipments SET status = ?';
        let updateParams = [status];

        // If completing, set end date
        if (status === 'Completed' && currentStatus !== 'Completed') {
            updateQuery += ', end_date = NOW()';
        }

        // If dispatching, set start date
        if (status === 'Dispatched' && currentStatus === 'Draft') {
            updateQuery += ', start_date = NOW()';
        }

        updateQuery += ' WHERE id = ?';
        updateParams.push(id);

        await connection.execute(updateQuery, updateParams);

        // 5. State Machine Logic - Correlated Updates
        // Only trigger side effects if we actually have assets attached
        if (vehicleId || driverId) {
            let vehicleStatus = null;

            if (status === 'Dispatched') {
                vehicleStatus = 'On Trip';
            } else if (status === 'Completed' || status === 'Cancelled') {
                vehicleStatus = 'Idle';     // Reset to available
            }

            if (vehicleStatus && vehicleId) {
                // We MUST check if the vehicle is NOT "In Shop" or "Out of Service" before dispatching
                if (status === 'Dispatched') {
                    const [[veh]] = await connection.execute('SELECT status FROM vehicles WHERE id = ?', [vehicleId]);
                    if (veh && veh.status !== 'Idle') {
                        throw new Error(`Cannot Dispatch: Vehicle ${vehicleId} is currently '${veh.status}', not 'Idle'.`);
                    }
                }
                await connection.execute('UPDATE vehicles SET status = ? WHERE id = ?', [vehicleStatus, vehicleId]);
            }

            if (driverId) {
                if (status === 'Dispatched') {
                    const [[drv]] = await connection.execute('SELECT status FROM drivers WHERE id = ?', [driverId]);
                    if (drv && drv.status !== 'On Duty') {
                        throw new Error(`Cannot Dispatch: Driver ${driverId} is currently '${drv.status}', not 'On Duty'.`);
                    }
                }
                // We no longer update driver status here since it is managed directly via driver profiles now.
            }
        }

        // 6. Commit changes
        await connection.commit();

        return res.status(200).json({
            success: true,
            data: {
                id,
                status
            }
        });

    } catch (err) {
        await connection.rollback();

        // Handle custom dispatch logic errors
        if (err.message && err.message.includes('Cannot Dispatch:')) {
            return res.status(409).json({
                success: false,
                error: { message: err.message, code: 'INVALID_STATE_TRANSITION' }
            });
        }
        next(err);
    } finally {
        connection.release();
    }
}

module.exports = {
    getAllTrips,
    createTrip,
    updateTripStatus
};
