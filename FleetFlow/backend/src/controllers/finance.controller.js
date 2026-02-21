/**
 * FleetFlow — Finance Controller
 */

'use strict';

const { pool } = require('../config/database');

/**
 * GET /api/finance/vehicle-cost/:vehicleId
 * Returns totalFuelCost, totalMaintenanceCost, totalOperationalCost, 
 * and computes Net Profit against Trip Revenue.
 */
async function getVehicleCosts(req, res, next) {
    try {
        const { vehicleId } = req.params;

        // Verify vehicle exists
        const [[vehicle]] = await pool.execute('SELECT id, name FROM vehicles WHERE id = ?', [vehicleId]);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: { message: `Vehicle ${vehicleId} not found.` }
            });
        }

        // We can compute these via pure SQL aggregation using LEFT JOINs onto the vehicle or individual queries.
        // Doing individual queries is often safer to avoid cartesian explosions between fuel and maintenance logs.

        // 1. Total Fuel
        const [[fuelData]] = await pool.execute(
            'SELECT SUM(cost) as totalFuelCost FROM fuel_logs WHERE vehicle_id = ?',
            [vehicleId]
        );
        const totalFuelCost = parseFloat(fuelData.totalFuelCost || 0);

        // 2. Total Maintenance
        const [[maintenanceData]] = await pool.execute(
            'SELECT SUM(cost) as totalMaintenanceCost FROM maintenance_logs WHERE vehicle_id = ?',
            [vehicleId]
        );
        const totalMaintenanceCost = parseFloat(maintenanceData.totalMaintenanceCost || 0);

        // 3. Total Trip Revenue
        const [[tripData]] = await pool.execute(
            'SELECT SUM(revenue) as totalRevenue FROM shipments WHERE vehicle_id = ? AND status = "Completed"',
            [vehicleId]
        );
        const totalRevenue = parseFloat(tripData.totalRevenue || 0);

        const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
        const netProfit = totalRevenue - totalOperationalCost;

        return res.status(200).json({
            success: true,
            data: {
                vehicleId: parseInt(vehicleId),
                vehicleName: vehicle.name,
                totalFuelCost,
                totalMaintenanceCost,
                totalOperationalCost,
                totalRevenue,
                netProfit
            }
        });

    } catch (err) {
        next(err);
    }
}

module.exports = {
    getVehicleCosts
};
