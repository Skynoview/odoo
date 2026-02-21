/**
 * FleetFlow — Dashboard Controller
 *
 * Handles logic for the operations dashboard, providing summary statistics with filtering support.
 * Updated to match the new 'vehicles' table schema.
 */

'use strict';

const { pool } = require('../config/database');

/**
 * GET /api/dashboard/summary
 *
 * Returns summary metrics for the fleet manager dashboard.
 * Supports filters: vehicleType, status (global), region.
 */
async function getSummary(req, res, next) {
    try {
        const { vehicleType, status, region } = req.query;

        /**
         * Mapping logic:
         * 'Active Fleet' counts vehicles that are available for work (Idle + On Trip).
         * 'Maintenance Alerts' counts vehicles currently 'In Shop'.
         */

        // Helper to build WHERE clauses for vehicles
        const buildVehicleQuery = (targetStatuses) => {
            let sql = 'SELECT COUNT(*) as count FROM vehicles WHERE 1=1';
            const params = [];

            // If a global status filter is provided
            if (status) {
                // If the filter status is not in our bucket, result is 0
                if (!targetStatuses.includes(status)) {
                    return { sql: 'SELECT 0 as count', params: [] };
                }
                // Filter by that specific status
                sql += ' AND status = ?';
                params.push(status);
            } else {
                // Filter by all statuses in this bucket
                sql += ` AND status IN (${targetStatuses.map(() => '?').join(',')})`;
                params.push(...targetStatuses);
            }

            if (vehicleType) {
                sql += ' AND vehicle_type = ?';
                params.push(vehicleType);
            }
            if (region) {
                sql += ' AND region = ?';
                params.push(region);
            }
            return { sql, params };
        };

        // 1. Active Fleet Count (Idle + On Trip)
        const activeQ = buildVehicleQuery(['Idle', 'On Trip']);
        const [[{ count: active_count }]] = await pool.execute(activeQ.sql, activeQ.params);

        // 2. Maintenance Alerts Count (In Shop)
        const maintQ = buildVehicleQuery(['In Shop']);
        const [[{ count: maintenance_count }]] = await pool.execute(maintQ.sql, maintQ.params);

        // 3. Pending Cargo (Trips not yet assigned or started)
        let pendingSql = 'SELECT COUNT(*) as count FROM trips WHERE status = "pending"';
        const pendingParams = [];
        if (region) {
            pendingSql += ' AND region = ?';
            pendingParams.push(region);
        }
        const [[{ count: pending_count }]] = await pool.execute(pendingSql, pendingParams);

        // 4. Utilization Rate Calculation
        // Percentage of 'Active Fleet' that is currently 'On Trip'
        let busySql = 'SELECT COUNT(*) as count FROM vehicles WHERE status = "On Trip"';
        const busyParams = [];

        if (status && status !== 'On Trip') {
            // If we are filtering by a status other than 'On Trip', utilization of this specific slice might be 0 or irrelevant
            // but usually utilization is (Busy / TotalAvailable).
            // If user filters for 'Idle', utilization is 0.
            var finalBusyCount = 0;
        } else {
            if (vehicleType) {
                busySql += ' AND vehicle_type = ?';
                busyParams.push(vehicleType);
            }
            if (region) {
                busySql += ' AND region = ?';
                busyParams.push(region);
            }
            const [[{ count: busy_count }]] = await pool.execute(busySql, busyParams);
            finalBusyCount = busy_count;
        }

        const totalAvailable = active_count || 0;
        const utilizationRate = totalAvailable > 0 ? Math.round((finalBusyCount / totalAvailable) * 100) : 0;

        return res.status(200).json({
            success: true,
            filters: { vehicleType, status, region },
            data: {
                activeFleet: totalAvailable,
                maintenanceAlerts: maintenance_count,
                utilizationRate: utilizationRate,
                pendingCargo: pending_count
            }
        });

    } catch (err) {
        next(err);
    }
}

module.exports = { getSummary };
