/**
 * Day 4: Full Stack Development Skill Lab (RVCE CSE)
 * Setup Verification Script
 * 
 * Verifies:
 * 1. Node.js (version 22+ or 24+ LTS)
 * 2. npm (Node Package Manager)
 * 3. MongoDB Server (service running & accepting connections on 127.0.0.1:27017)
 * 4. mongosh (optional: MongoDB Compass has a built-in shell)
 * 5. Postman (API testing client installed)
 * 
 * Usage:
 *   node check-setup.js
 */

const { execSync } = require('child_process');
const net = require('net');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Terminal ANSI colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`${BOLD}${CYAN}====================================================${RESET}`);
console.log(`${BOLD}${CYAN}    Day 4: Full Stack Development Skill Lab         ${RESET}`);
console.log(`${BOLD}${CYAN}   Environment & Prerequisite Verification Check    ${RESET}`);
console.log(`${BOLD}${CYAN}====================================================${RESET}\n`);

let passCount = 0;
let totalChecks = 5;

// Helper to print pass/fail
function reportResult(name, passed, details, fixHint) {
  if (passed) {
    passCount++;
    console.log(`[ ${GREEN}PASS${RESET} ] ${BOLD}${name}${RESET}`);
    if (details) console.log(`         ${GREEN}✓${RESET} ${details}`);
  } else {
    console.log(`[ ${RED}FAIL${RESET} ] ${BOLD}${name}${RESET}`);
    if (details) console.log(`         ${RED}✗${RESET} ${details}`);
    if (fixHint) {
      console.log(`         ${YELLOW}→ Fix:${RESET} ${fixHint}`);
    }
  }
  console.log('');
}

// 1. Check Node.js Version (Node 22 or 24 LTS required)
function checkNode() {
  try {
    const versionStr = process.version; // e.g. "v22.14.0" or "v24.11.1"
    const major = parseInt(versionStr.replace('v', '').split('.')[0], 10);
    if (major >= 22) {
      reportResult('Node.js Runtime', true, `Detected ${versionStr} (Required: v22+ or v24+)`);
    } else {
      reportResult(
        'Node.js Runtime',
        false,
        `Detected ${versionStr} (Node 22 or 24 required; older versions such as v18/v20 are deprecated/EOL)`,
        'Download and install Node.js 22+ LTS or 24 from https://nodejs.org'
      );
    }
  } catch (err) {
    reportResult('Node.js Runtime', false, err.message, 'Install Node.js 22+ or 24 from https://nodejs.org');
  }
}

// 2. Check npm
function checkNpm() {
  try {
    const npmVersion = execSync('npm -v', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    reportResult('Node Package Manager (npm)', true, `Detected npm v${npmVersion}`);
  } catch (err) {
    reportResult('Node Package Manager (npm)', false, 'npm command failed or not found in PATH', 'Reinstall Node.js with the "Add to PATH" option checked.');
  }
}

// 3. Check MongoDB Server Connectivity (Port 27017 on 127.0.0.1)
function checkMongoDB(callback) {
  const socket = new net.Socket();
  socket.setTimeout(2500);

  socket.connect(27017, '127.0.0.1', () => {
    socket.destroy();
    reportResult('MongoDB Server (Port 27017)', true, 'Connected to MongoDB at 127.0.0.1:27017');
    callback();
  });

  socket.on('error', (err) => {
    socket.destroy();
    let fix = 'Start MongoDB service in Windows: Press Win+R, type "services.msc", find "MongoDB Server" and click Start. Or run cmd as Admin: "net start MongoDB"';
    reportResult('MongoDB Server (Port 27017)', false, `Could not connect to 127.0.0.1:27017 (${err.code || err.message})`, fix);
    callback();
  });

  socket.on('timeout', () => {
    socket.destroy();
    reportResult('MongoDB Server (Port 27017)', false, 'Connection to 127.0.0.1:27017 timed out', 'Ensure MongoDB Server service is running.');
    callback();
  });
}

// 4. Check mongosh CLI
function checkMongosh() {
  let inPath = false;
  let version = '';

  try {
    version = execSync('mongosh --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    inPath = true;
  } catch (e) {
    // Check standard installation paths if not directly in PATH
    const userProfile = process.env.USERPROFILE || os.homedir();
    const possiblePaths = [
      path.join(userProfile, 'AppData', 'Local', 'Programs', 'mongosh', 'mongosh.exe'),
      'C:\\Program Files\\MongoDB\\mongosh\\mongosh.exe',
      'C:\\Program Files\\mongosh\\bin\\mongosh.exe',
      path.join(userProfile, 'AppData', 'Local', 'Programs', 'mongosh', 'bin', 'mongosh.exe')
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          version = execSync(`"${p}" --version`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
          inPath = true;
          break;
        } catch (_) { }
      }
    }
  }

  if (inPath) {
    reportResult('MongoDB Shell (mongosh)', true, `Detected mongosh v${version}`);
  } else {
    // mongosh is optional: MongoDB Compass has a built-in shell (the MONGOSH panel).
    reportResult(
      'MongoDB Shell (mongosh) - optional',
      true,
      'Standalone mongosh not installed. That is fine: use the MONGOSH panel inside MongoDB Compass.'
    );
  }
}

// 5. Check Postman
function checkPostman() {
  let found = false;
  let postmanPath = '';

  const userProfile = process.env.USERPROFILE || os.homedir();
  const candidates = [
    path.join(userProfile, 'AppData', 'Local', 'Postman', 'Postman.exe'),
    path.join(userProfile, 'AppData', 'Local', 'Postman', 'app-*', 'Postman.exe'),
    'C:\\Program Files\\Postman\\Postman.exe',
    'C:\\Program Files (x86)\\Postman\\Postman.exe'
  ];

  for (const candidate of candidates) {
    if (candidate.includes('*')) {
      const baseDir = path.dirname(candidate);
      if (fs.existsSync(baseDir)) {
        const subdirs = fs.readdirSync(baseDir);
        for (const sub of subdirs) {
          const full = path.join(baseDir, sub, 'Postman.exe');
          if (fs.existsSync(full)) {
            found = true;
            postmanPath = full;
            break;
          }
        }
      }
    } else if (fs.existsSync(candidate)) {
      found = true;
      postmanPath = candidate;
      break;
    }
  }

  // Also check PATH
  if (!found) {
    try {
      execSync('where.exe postman', { stdio: ['pipe', 'pipe', 'ignore'] });
      found = true;
      postmanPath = 'Found in system PATH';
    } catch (_) { }
  }

  if (found) {
    reportResult('Postman API Client', true, `Found Postman executable (${postmanPath})`);
  } else {
    reportResult(
      'Postman API Client',
      false,
      'Postman executable not found in default locations',
      'Download and install Postman Desktop Agent/Client from https://www.postman.com/downloads'
    );
  }
}

// Run checks sequentially
checkNode();
checkNpm();
checkMongosh();
checkPostman();
checkMongoDB(() => {
  console.log(`${BOLD}====================================================${RESET}`);
  console.log(`Summary: ${passCount} of ${totalChecks} checks passed.`);
  if (passCount === totalChecks) {
    console.log(`${GREEN}${BOLD} SUCCESS: All prerequisites are verified! You are ready to start Step 01.${RESET}`);
    process.exit(0);
  } else {
    console.log(`${YELLOW}${BOLD}  ATTENTION: Please address the failed checks above before continuing.${RESET}`);
    process.exit(1);
  }
});
