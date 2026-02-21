async function testApi() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'alice@fleetflow.com', password: 'Secret123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.data?.token;
        if (!token) throw new Error('Failed to login, ' + JSON.stringify(loginData));

        const headers = { 'Authorization': `Bearer ${token}` };

        console.log('Fetching vehicles...');
        const vehRes = await fetch('http://localhost:5000/api/vehicles', { headers });
        const vehData = await vehRes.json();
        const vehicles = vehData.data;
        if (!vehicles || vehicles.length === 0) {
            console.log('No vehicles available.');
            return;
        }

        const vId = vehicles[0].id;
        console.log('Testing vehicle cost for ID:', vId);

        const finRes = await fetch(`http://localhost:5000/api/finance/vehicle-cost/${vId}`, { headers });
        console.log('Finance Status:', finRes.status);
        console.log('Finance Data:', await finRes.text());

        const fuelRes = await fetch(`http://localhost:5000/api/fuel/${vId}`, { headers });
        console.log('Fuel Status:', fuelRes.status);
        console.log('Fuel Data:', await fuelRes.text());

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

testApi();
