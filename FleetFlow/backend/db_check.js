const { pool } = require('./src/config/database');

async function check() {
    try {
        const [rows] = await pool.execute('SELECT * FROM vehicles');
        console.log('Vehicles in DB:', rows.length);
        console.log('Sample vehicle status:', rows[0] ? rows[0].status : 'N/A');
        console.log('Sample vehicle type:', rows[0] ? rows[0].vehicle_type : 'N/A');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit();
    }
}

check();
