const { pool } = require('./src/config/database');

async function run() {
    try {
        const [vehicles] = await pool.query('SELECT id FROM vehicles LIMIT 1');
        if (vehicles.length > 0) {
            const vid = vehicles[0].id;
            await pool.query('INSERT INTO fuel_logs (vehicle_id, liters, cost, fuel_date) VALUES (?, 100, 150.50, NOW())', [vid]);
            const [logs] = await pool.query('SELECT * FROM fuel_logs WHERE vehicle_id = ?', [vid]);
            console.log('Fuel Logs:', logs);
        } else {
            console.log('No vehicles.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
