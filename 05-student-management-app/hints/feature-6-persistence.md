# Hints for Feature 6: Full-Stack Persistence Verification

### Goal
Prove that data entered via the web interface is truly persisted on disk in MongoDB and not just kept in memory.

### Guided Steps to Verify

1. **Add a Distinct Student Record:**
   In your browser, add a new student with easily recognizable details (e.g. Name: `"Persistence Test"`, USN: `"1RV23CS999"`, Semester: `4`, Branch: `CSE`).

2. **Test 1: Browser Refresh:**
   Press `Ctrl + F5` (Hard Reload) in your browser.
   - *Observation:* The page reloads, the table calls `GET /students`, and your student is still there!

3. **Test 2: Stop and Restart the Server Process:**
   - In your PowerShell terminal running `node server.js`, press `Ctrl + C` to terminate the process.
   - Now in your browser, try refreshing. The page UI loads from cache or displays a network error because Node is down.
   - In terminal, start the server again:
     ```powershell
     node server.js
     ```
   - Refresh your browser tab.
   - *Observation:* All student records reappear immediately! Because the data lives on disk in MongoDB `CollegeDB.students`, shutting down Node has zero impact on stored data.

4. **Test 3: Cross-Verification in MongoDB Compass:**
   - Open MongoDB Compass.
   - Connect to `mongodb://127.0.0.1:27017`.
   - Open `CollegeDB` -> `students`.
   - Click the Refresh button in Compass and find `"Persistence Test"`.
