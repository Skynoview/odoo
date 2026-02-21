const { pool } = require('./src/config/database');

async function testFetch() {
    try {
        const [vehicles] = await pool.query('SELECT id, name FROM vehicles');
        console.log('Vehicles:', vehicles);

        const [trips] = await pool.query('SELECT * FROM shipments');
        console.log('Trips:', trips);

        if (vehicles.length > 0) {
            const vId = vehicles[0].id;
            const [[fuel]] = await pool.query('SELECT SUM(cost) as totalFuelCost FROM fuel_logs WHERE vehicle_id = ?', [vId]);
            console.log('Fuel Cost for vehicle', vId, ':', fuel);

            const [[maint]] = await pool.query('SELECT SUM(cost) as totalMaintenanceCost FROM maintenance_logs WHERE vehicle_id = ?', [vId]);
            console.log('Maint Cost for vehicle', vId, ':', maint);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

testFetch();
