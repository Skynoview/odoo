/**
 * authorizeRole() integration test script
 * Run with: node test-authorize.js (from backend/)
 */

const http = require('http');

function request(path, method = 'GET', body = null, token = null) {
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: 'localhost', port: 5000, path, method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (token) opts.headers['Authorization'] = `Bearer ${token}`;
        const req = http.request(opts, (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    console.log('\n==== authorizeRole() Tests ====\n');

    // --- Login both users
    const aliceLogin = await request('/api/auth/login', 'POST', { email: 'alice@fleetflow.com', password: 'Secret123' });
    const bobLogin = await request('/api/auth/login', 'POST', { email: 'bob@fleetflow.com', password: 'Secret123' });
    const ALICE = aliceLogin.body.data.token;
    const BOB = bobLogin.body.data.token;

    // TEST 1 — FleetManager accesses fleet-manager-only → 200 ✅
    const t1 = await request('/api/auth/me/fleet-manager-only', 'GET', null, ALICE);
    console.log(`T1 FleetManager → /fleet-manager-only : ${t1.status === 200 ? '✅ 200' : '❌ ' + t1.status} | "${t1.body.message}"`);

    // TEST 2 — Dispatcher blocked from fleet-manager-only → 403 ✅
    const t2 = await request('/api/auth/me/fleet-manager-only', 'GET', null, BOB);
    console.log(`T2 Dispatcher   → /fleet-manager-only : ${t2.status === 403 ? '✅ 403' : '❌ ' + t2.status} | code=${t2.body.error.code} | yourRole=${t2.body.error.yourRole}`);

    // TEST 3 — Dispatcher accesses dispatcher-only → 200 ✅
    const t3 = await request('/api/auth/me/dispatcher-only', 'GET', null, BOB);
    console.log(`T3 Dispatcher   → /dispatcher-only   : ${t3.status === 200 ? '✅ 200' : '❌ ' + t3.status} | "${t3.body.message}"`);

    // TEST 4 — FleetManager blocked from dispatcher-only → 403 ✅
    const t4 = await request('/api/auth/me/dispatcher-only', 'GET', null, ALICE);
    console.log(`T4 FleetManager → /dispatcher-only   : ${t4.status === 403 ? '✅ 403' : '❌ ' + t4.status} | code=${t4.body.error.code} | yourRole=${t4.body.error.yourRole}`);

    // TEST 5 — No token → 401 ✅
    const t5 = await request('/api/auth/me/fleet-manager-only', 'GET');
    console.log(`T5 No token     → /fleet-manager-only : ${t5.status === 401 ? '✅ 401' : '❌ ' + t5.status} | code=${t5.body.error.code}`);

    console.log('\n==== All tests complete ====\n');
}

run().catch(console.error);
