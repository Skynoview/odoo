const { pool } = require('./src/config/database');

async function testFetch() {
    try {
        const [[tripData]] = await pool.execute(
            'SELECT SUM(revenue) as totalRevenue FROM shipments WHERE vehicle_id = ? AND status = "Completed"',
            [13]
        );
        console.log('TripData:', tripData);
    } catch (e) {
        console.error('SQL Error:', e.message);
    } finally {
        process.exit();
    }
}
testFetch();
