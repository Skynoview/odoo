const { pool } = require('./src/config/database');

async function fixDrivers() {
    try {
        await pool.query("ALTER TABLE fleetflow_db.drivers MODIFY COLUMN status ENUM('Available', 'Assigned', 'Off Duty', 'On Leave') NOT NULL DEFAULT 'Available';");
        console.log('Driver status altered');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
fixDrivers();
