/**
 * Comprehensive API Test Suite
 * Tests all CRUD routes and error cases across snapshots and reference server.
 * Automatically spins up the server if not already running on port 3000.
 */

const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:3000';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function startServer() {
  const serverPath = path.join(__dirname, '..', 'reference', 'server.js');
  const proc = spawn('node', [serverPath], {
    cwd: path.join(__dirname, '..', 'reference'),
    stdio: 'pipe'
  });

  return new Promise((resolve, reject) => {
    let resolved = false;

    proc.stdout.on('data', (data) => {
      const out = data.toString();
      if (out.includes('Server running on port 3000') && !resolved) {
        resolved = true;
        resolve(proc);
      }
    });

    proc.stderr.on('data', (data) => {
      console.error('  [SERVER STDERR]:', data.toString());
    });

    proc.on('error', (err) => {
      console.error('  [SERVER ERROR]:', err);
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(proc);
      }
    }, 6000);
  });
}

async function runApiTests() {
  console.log('\n==================================================');
  console.log('   RUNNING API VERIFICATION SUITE');
  console.log('==================================================\n');

  let serverProc = null;

  try {
    try {
      const ping = await fetch(BASE_URL);
      if (ping.ok) {
        console.log('  [INFO] Connected to active server on port 3000.\n');
      }
    } catch (_) {
      console.log('  [INFO] Starting reference server on port 3000...');
      serverProc = await startServer();
      await sleep(1500);
    }

    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
      try {
        await fn();
        console.log(`  [ PASS ] ${name}`);
        passed++;
      } catch (err) {
        console.error(`  [ FAIL ] ${name}`);
        console.error(`         Error: ${err.message}`);
        failed++;
      }
    }

    // 1. Health check
    await test('GET / -> 200 OK with status ok', async () => {
      const res = await fetch(`${BASE_URL}/`);
      assert.strictEqual(res.status, 200);
    });

    // 2. Create student
    let createdId = null;
    const testUSN = `1RV23CS${Math.floor(100 + Math.random() * 899)}`;

    await test('POST /students -> 201 Created with _id', async () => {
      const res = await fetch(`${BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Arjun Verma',
          usn: testUSN,
          semester: 3,
          branch: 'CSE'
        })
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.ok(data._id, 'Missing _id');
      assert.strictEqual(data.name, 'Arjun Verma');
      assert.strictEqual(data.usn, testUSN);
      assert.strictEqual(data.semester, 3);
      assert.strictEqual(data.branch, 'CSE');
      createdId = data._id;
    });

    // 3. Error: Duplicate USN
    await test('POST /students (duplicate USN) -> 409 Conflict', async () => {
      const res = await fetch(`${BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Another Student',
          usn: testUSN,
          semester: 4,
          branch: 'ISE'
        })
      });
      assert.strictEqual(res.status, 409);
      const data = await res.json();
      assert.ok(data.error && data.error.includes('already exists'));
    });

    // 4. Error: Missing Fields
    await test('POST /students (missing fields) -> 400 Bad Request', async () => {
      const res = await fetch(`${BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Incomplete' })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error);
    });

    // 5. Error: Invalid Semester (must be 1-8)
    await test('POST /students (semester: 10) -> 400 Bad Request', async () => {
      const res = await fetch(`${BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test',
          usn: '1RV23CS888',
          semester: 10,
          branch: 'CSE'
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('between 1 and 8'));
    });

    // 6. Read All
    await test('GET /students -> 200 OK array containing created student', async () => {
      const res = await fetch(`${BASE_URL}/students`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      const found = data.find((s) => s.usn === testUSN);
      assert.ok(found, 'Created student not in list');
    });

    // 7. Search query
    await test('GET /students?search=Arjun -> 200 OK matching results', async () => {
      const res = await fetch(`${BASE_URL}/students?search=Arjun`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.length > 0);
      assert.ok(data.some((s) => s.name.includes('Arjun')));
    });

    // 8. Read by ID
    await test(`GET /students/:id (${createdId}) -> 200 OK`, async () => {
      const res = await fetch(`${BASE_URL}/students/${createdId}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data._id, createdId);
    });

    // 9. Error: Invalid ObjectId format
    await test('GET /students/invalid-id-xyz -> 400 Bad Request', async () => {
      const res = await fetch(`${BASE_URL}/students/invalid-id-xyz`);
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Invalid student ID format'));
    });

    // 10. Error: Nonexistent ObjectId
    await test('GET /students/507f1f77bcf86cd799439011 -> 404 Not Found', async () => {
      const res = await fetch(`${BASE_URL}/students/507f1f77bcf86cd799439011`);
      assert.strictEqual(res.status, 404);
      const data = await res.json();
      assert.strictEqual(data.error, 'Student not found');
    });

    // 11. Update Student
    await test(`PUT /students/:id (${createdId}) -> 200 OK`, async () => {
      const res = await fetch(`${BASE_URL}/students/${createdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester: 4,
          branch: 'ISE'
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.semester, 4);
      assert.strictEqual(data.branch, 'ISE');
    });

    // 12. Update Nonexistent
    await test('PUT /students/507f1f77bcf86cd799439011 -> 404 Not Found', async () => {
      const res = await fetch(`${BASE_URL}/students/507f1f77bcf86cd799439011`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester: 5 })
      });
      assert.strictEqual(res.status, 404);
    });

    // 13. Delete Student
    await test(`DELETE /students/:id (${createdId}) -> 200 OK`, async () => {
      const res = await fetch(`${BASE_URL}/students/${createdId}`, {
        method: 'DELETE'
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.message.includes('deleted successfully'));
    });

    // 14. Delete Nonexistent (Second time)
    await test(`DELETE /students/:id (${createdId}) second time -> 404 Not Found`, async () => {
      const res = await fetch(`${BASE_URL}/students/${createdId}`, {
        method: 'DELETE'
      });
      assert.strictEqual(res.status, 404);
    });

    console.log('\n==================================================');
    console.log(`API Suite Summary: ${passed} Passed, ${failed} Failed.`);
    console.log('==================================================\n');

    if (failed > 0) process.exit(1);
  } finally {
    if (serverProc) {
      serverProc.kill();
    }
  }
}

if (require.main === module) {
  runApiTests();
}

module.exports = { runApiTests };
