# Step 00: Environment & Setup Verification

## Goal
Verify that your Windows lab machine has all five essential tools installed, running, and accessible before beginning today's hands-on exercises: **Node.js (v22+ or v24+ LTS)**, **npm**, **MongoDB Server (running on 127.0.0.1:27017)**, **mongosh (MongoDB Shell)**, and **Postman**.

---

## Concepts
Before building full-stack applications, your local developer environment requires runtime tools to execute server code (Node.js & npm), a database daemon to persist student records (MongoDB Server), a command-line interface to interact with documents directly (`mongosh`), and an API client to test HTTP endpoints (Postman). If any of these services are missing or stopped, your backend code cannot connect or save records. Running an automated check upfront prevents troubleshooting tool misconfigurations midway through the lab.

---

## Instructor Demo Steps

1. Open your terminal (PowerShell or Command Prompt) and navigate into the `00-setup-check` directory:
   ```powershell
   cd 00-setup-check
   ```
2. Run the automated check script using Node.js:
   ```powershell
   node check-setup.js
   ```
3. Observe each check's `[ PASS ]` or `[ FAIL ]` status and review the final summary.

---

## Your Turn
1. Open PowerShell inside `00-setup-check`.
2. Execute:
   ```powershell
   node check-setup.js
   ```
3. If all 5 checks show `[ PASS ]`, you are ready!
4. **Mini-Experiment**: Test what happens when a service is unreachable:
   - Temporarily stop your local MongoDB service:
     ```powershell
     net stop MongoDB
     ```
     *(Note: If permission denied, open PowerShell as Administrator or skip stopping).*
   - Re-run `node check-setup.js` to see the `[ FAIL ]` message and troubleshooting instruction.
   - Restart the service:
     ```powershell
     net start MongoDB
     ```
   - Re-run `node check-setup.js` and verify it reports `5 of 5 checks passed`.

---

## Checkpoint Checklist
- [ ] Ran `node check-setup.js` in terminal.
- [ ] Node.js Runtime passes (v22.0.0 or v24.0.0+ LTS).
- [ ] npm passes.
- [ ] mongosh passes.
- [ ] Postman is detected.
- [ ] MongoDB Server connects on `127.0.0.1:27017`.
- [ ] Output displays `🎉 SUCCESS: All prerequisites are verified! You are ready to start Step 01.`

---

## Expected Output
```text
====================================================
   Day 4: Full Stack Development Skill Lab (RVCE)   
   Environment & Prerequisite Verification Check    
====================================================

[ PASS ] Node.js Runtime
         ✓ Detected v24.11.1 (Required: v22+ or v24+)

[ PASS ] Node Package Manager (npm)
         ✓ Detected npm v11.6.2

[ PASS ] MongoDB Shell (mongosh)
         ✓ Detected mongosh v2.14.0

[ PASS ] Postman API Client
         ✓ Found Postman executable (C:\Users\...\Postman.exe)

[ PASS ] MongoDB Server (Port 27017)
         ✓ Connected to MongoDB at 127.0.0.1:27017

====================================================
Summary: 5 of 5 checks passed.
🎉 SUCCESS: All prerequisites are verified! You are ready to start Step 01.
```

---

## Stuck?
- **MongoDB Server FAIL (Could not connect to 127.0.0.1:27017)**:
  - Press `Win + R`, type `services.msc`, and press Enter.
  - Locate `MongoDB Server (MongoDB)`.
  - Right-click and select **Start**.
  - Alternatively, open an Administrator PowerShell and run: `net start MongoDB` or start `mongod.exe`.
- **mongosh FAIL (mongosh not found in PATH)**:
  - If installed via winget or MSI, ensure its installation directory is added to your User `PATH` environment variable.
  - Quick install via winget:
    ```powershell
    winget install MongoDB.Shell
    ```
- **Node.js version < 22 (e.g. Node 18 or Node 20 EOL)**:
  - Node 20 reached end-of-life in April 2026, and Node 18 is older. Install current LTS Node.js (v22+ or v24+) from [https://nodejs.org](https://nodejs.org).
- **Postman not found**:
  - Download and install Postman Desktop from [https://www.postman.com/downloads](https://www.postman.com/downloads).
