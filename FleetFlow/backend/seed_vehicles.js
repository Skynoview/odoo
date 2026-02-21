const { pool } = require('./src/config/database');

async function seed() {
    try {
        console.log('Truncating...');
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
        await pool.execute('TRUNCATE TABLE vehicles');
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Inserting...');
        await pool.execute(`
      INSERT INTO vehicles (name, model, license_plate, max_load_capacity, odometer, status, vehicle_type, region) VALUES
      ('Titan Prime', 'Freightliner Cascadia', 'FL-001', 25000.00, 12500, 'On Trip', 'Truck', 'North'),
      ('Swift Box', 'Ford Transit', 'FT-202', 3500.00, 4500, 'Idle', 'Van', 'South'),
      ('Heavy Hauler', 'Kenworth T680', 'KW-303', 30000.00, 89200, 'In Shop', 'Truck', 'East'),
      ('Metro Bike', 'Electric Cargo', 'EB-404', 150.00, 1200, 'Idle', 'Bike', 'West'),
      ('Long Haul', 'Volvo VNL', 'VV-505', 28000.00, 156000, 'Out of Service', 'Truck', 'North')
    `);
        console.log('✅ Seeded successfully!');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        process.exit();
    }
}

seed();
