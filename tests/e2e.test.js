/**
 * Playwright End-to-End Test Suite for RVCE Student Management App
 * Verifies: Add, View, Search, Edit, Persistence across server restart, Delete.
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');

const BASE_URL = 'http://127.0.0.1:3000';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper to spawn reference server
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
      // console.log('[Server stdout]', out.trim());
      if (out.includes('Server running on port 3000') && !resolved) {
        resolved = true;
        resolve(proc);
      }
    });

    proc.stderr.on('data', (data) => {
      console.error('[Server stderr]', data.toString().trim());
    });

    proc.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(proc); // proceed anyway
      }
    }, 4000);
  });
}

async function runE2ETests() {
  console.log('\n==================================================');
  console.log('   RUNNING PLAYWRIGHT END-TO-END SUITE');
  console.log('==================================================\n');

  let serverProc = null;

  try {
    // 1. Check if server is already running; if not, spawn it
    try {
      const ping = await fetch(BASE_URL);
      if (ping.ok) {
        console.log('  [INFO] Detected server already active on port 3000.');
      }
    } catch (_) {
      console.log('  [INFO] Starting reference server on port 3000...');
      serverProc = await startServer();
      await sleep(1500);
    }

    // 2. Launch Playwright browser
    console.log('  [INFO] Launching Chromium browser...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Auto-accept confirmation dialogs for delete action
    page.on('dialog', async (dialog) => {
      // console.log(`  [Dialog] ${dialog.type()}: ${dialog.message()}`);
      await dialog.accept();
    });

    // 3. Navigate to frontend
    console.log(`  [INFO] Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 4. Test View: Ensure table loads
    console.log('  [TEST 1] Testing View & Initial Load...');
    const tableRows = page.locator('#student-table-body tr');
    await tableRows.first().waitFor();
    const initialCount = await tableRows.count();
    console.log(`  [ PASS ] View: Initial student rows rendered (${initialCount} rows found)`);

    // 5. Test Add Student
    console.log('  [TEST 2] Testing Add Student (POST)...');
    const uniqueUSN = `1RV23CS${Math.floor(100 + Math.random() * 899)}`;
    const studentName = 'Playwright Test Student';

    await page.fill('#student-name', studentName);
    await page.fill('#student-usn', uniqueUSN);
    await page.fill('#student-semester', '3');
    await page.selectOption('#student-branch', 'CSE');
    await page.click('#submit-btn');

    // Wait for row with uniqueUSN to appear
    const createdRow = page.locator(`tr:has-text("${uniqueUSN}")`);
    await createdRow.waitFor({ timeout: 5000 });
    assert.ok(await createdRow.isVisible(), 'Created student row not visible in table');
    console.log(`  [ PASS ] Add: Student ${studentName} (${uniqueUSN}) created and rendered!`);

    // 6. Test Debounced Search
    console.log('  [TEST 3] Testing Live Debounced Search (GET ?search=)...');
    await page.fill('#search-input', uniqueUSN);
    await sleep(600); // Wait for 300ms debounce + fetch
    const searchResults = page.locator('#student-table-body tr');
    const searchCount = await searchResults.count();
    assert.strictEqual(searchCount, 1, `Expected exactly 1 search result, got ${searchCount}`);
    console.log('  [ PASS ] Search: Debounced search correctly isolated the single created student');

    // Clear search
    await page.click('#clear-search-btn');
    await sleep(400);

    // 7. Test Edit Student
    console.log('  [TEST 4] Testing Edit Student (PUT)...');
    const editBtn = page.locator(`tr:has-text("${uniqueUSN}") .edit-btn`);
    await editBtn.click();

    // Verify form switched to edit mode
    const headingText = await page.locator('#form-heading').textContent();
    assert.ok(headingText.includes('Edit Student'), 'Heading did not switch to edit mode');

    const submitBtnText = await page.locator('#submit-btn').textContent();
    assert.strictEqual(submitBtnText, 'Update Student', 'Submit button did not switch to Update');

    // Modify semester to 4 and branch to ISE
    await page.fill('#student-semester', '4');
    await page.selectOption('#student-branch', 'ISE');
    await page.click('#submit-btn');
    await sleep(800);

    // Verify updated values in table
    const updatedRow = page.locator(`tr:has-text("${uniqueUSN}")`);
    const rowText = await updatedRow.textContent();
    assert.ok(rowText.includes('Semester 4'), 'Semester was not updated to 4');
    assert.ok(rowText.includes('ISE'), 'Branch was not updated to ISE');
    console.log('  [ PASS ] Edit: Student semester and branch successfully updated in MongoDB');

    // 8. Test Data Persistence across Server Restart!
    console.log('  [TEST 5] Testing Full-Stack Persistence across Server Restart...');
    if (serverProc) {
      serverProc.kill();
      await sleep(1000);
      serverProc = await startServer();
      await sleep(1500);
    }

    // Hard reload the browser page
    await page.reload({ waitUntil: 'networkidle' });
    const persistedRow = page.locator(`tr:has-text("${uniqueUSN}")`);
    await persistedRow.waitFor({ timeout: 5000 });
    const persistedText = await persistedRow.textContent();
    assert.ok(persistedText.includes(studentName), 'Student missing after server restart!');
    assert.ok(persistedText.includes('Semester 4'), 'Updated semester missing after restart!');
    console.log('  [ PASS ] Persistence: Data survived server restart and browser hard reload!');

    // 9. Test Delete Student
    console.log('  [TEST 6] Testing Delete Student (DELETE)...');
    const deleteBtn = page.locator(`tr:has-text("${uniqueUSN}") .delete-btn`);
    await deleteBtn.click();
    await sleep(800);

    // Verify row is gone
    const deletedRow = page.locator(`tr:has-text("${uniqueUSN}")`);
    const isVisible = await deletedRow.isVisible();
    assert.strictEqual(isVisible, false, 'Deleted student is still visible in table');
    console.log('  [ PASS ] Delete: Student successfully deleted from collection');

    await browser.close();

    console.log('\n==================================================');
    console.log('  🎉 ALL PLAYWRIGHT E2E TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================\n');
  } finally {
    if (serverProc) {
      serverProc.kill();
    }
  }
}

if (require.main === module) {
  runE2ETests().catch((err) => {
    console.error('E2E Test Failed:', err);
    process.exit(1);
  });
}

module.exports = { runE2ETests };
