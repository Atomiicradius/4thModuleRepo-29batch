# Day 4: Full-Stack Troubleshooting Guide

This guide covers every common bug, error message, and stumbling block encountered during the Day 4 lab, complete with root causes and verified fixes.

---

## Quick Diagnostic Matrix

| Error Message / Symptom | Root Cause | Quick Fix |
| :--- | :--- | :--- |
| `'mongosh' is not recognized` | `mongosh.exe` directory not in Windows User `PATH` | Run `winget install MongoDB.Shell` or add `%LOCALAPPDATA%\Programs\mongosh` to PATH |
| `connect ECONNREFUSED 127.0.0.1:27017` | Local MongoDB Windows Service is stopped | Open Admin PowerShell and run: `net start MongoDB` |
| `EADDRINUSE :::3000` | Another Node process is already using port 3000 | Kill previous node process with `Get-Process node \| Stop-Process -Force` |
| Query returns `null` for known ID | Queried with string ID instead of `new ObjectId(id)` | Wrap ID: `{ _id: new ObjectId(id) }` from `require('mongodb')` |
| `BSONError: Argument passed in must be a single String...` | Passed malformed ID string directly to `new ObjectId()` | Check `ObjectId.isValid(id)` before instantiating |
| `Cannot read properties of undefined (reading 'name')` | Missing JSON body parser middleware in Express | Add `app.use(express.json());` above route handlers |
| `Promise { <pending> }` in response | Missing `await` keyword before MongoDB call | Add `await` before asynchronous calls (`await collection.find().toArray()`) |
| Duplicate USN causes server crash (Error 11000) | Uncaught duplicate key error from unique index | Wrap in `try/catch` and return `409 Conflict` on `error.code === 11000` |
| Browser page reloads on form submit | Missing `event.preventDefault()` in submit listener | Add `e.preventDefault();` as first line of submit handler |
| CORS Error / Network Error in browser | Frontend accessed via `file:///` or server is offline | Start server and navigate to `http://127.0.0.1:3000` |

---

## In-Depth Fix Workflows

### 1. `mongosh` Is Not Recognized
- **Symptom:** In PowerShell, running `mongosh` outputs:
  ```text
  The term 'mongosh' is not recognized as the name of a cmdlet...
  ```
- **Cause:** MongoDB Community Server 6+ does not bundle the shell by default. If installed separately, its folder may not be in your Windows PATH.
- **Resolution:**
  1. Quick install via Windows Package Manager:
     ```powershell
     winget install MongoDB.Shell
     ```
  2. Add mongosh to your User PATH:
     - Press `Win + S`, type "environment variables", and open **Edit environment variables for your account**.
     - Double-click `Path`.
     - Click **New** and paste:
       `C:\Users\<YourUsername>\AppData\Local\Programs\mongosh`
     - Click **OK** and restart PowerShell.

---

### 2. `ECONNREFUSED 127.0.0.1:27017` (MongoDB Service Stopped)
- **Symptom:** Node server crashes on startup with:
  ```text
  MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
  ```
- **Cause:** The background MongoDB Windows Service (`MongoDB Server`) is stopped or disabled.
- **Resolution:**
  1. Open PowerShell as Administrator.
  2. Execute:
     ```powershell
     net start MongoDB
     ```
  3. Alternatively, press `Win + R`, type `services.msc`, locate `MongoDB Server (MongoDB)`, right-click, and choose **Start**.

---

### 3. Port 3000 in Use (`EADDRINUSE: address already in use :::3000`)
- **Symptom:** Starting your server prints:
  ```text
  Error: listen EADDRINUSE: address already in use :::3000
  ```
- **Cause:** A previous Node.js process did not terminate completely and continues listening on port 3000.
- **Resolution:**
  - In PowerShell, run:
    ```powershell
    Get-Process -Name node | Stop-Process -Force
    ```
  - Re-run `node server.js`.

---

### 4. ObjectId Not Converted (#1 Student Bug)
- **Symptom:**
  - `GET /students/<VALID_ID>` returns `404 Not Found` or `null`, even though the ID appears in `db.students.find()`.
  - Alternatively, the server throws an unhandled `BSONError`.
- **Cause:**
  - MongoDB stores primary keys as binary `ObjectId` objects, NOT plain JavaScript strings.
  - Passing a plain string to `{ _id: req.params.id }` will **never match** any document.
- **Resolution:**
  ```javascript
  const { ObjectId } = require('mongodb');

  // Validate format before converting (prevents crash on invalid strings):
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid student ID format' });
  }

  // Cast string to BSON ObjectId:
  const student = await studentsCollection.findOne({ _id: new ObjectId(req.params.id) });
  ```

---

### 5. Missing `await` Keyword
- **Symptom:** Route returns an empty object `{}` or `undefined`, or Express hangs without responding.
- **Cause:** MongoDB driver methods (`find().toArray()`, `findOne()`, `insertOne()`, `updateOne()`, `deleteOne()`) return **Promises**. Without `await`, your variable holds an unfulfilled Promise rather than the data.
- **Resolution:**
  ```javascript
  // ❌ WRONG:
  const students = studentsCollection.find({}).toArray();
  res.json(students); // Sends pending promise!

  // ✅ CORRECT:
  const students = await studentsCollection.find({}).toArray();
  res.json(students);
  ```

---

### 6. Missing `express.json()` Middleware
- **Symptom:** `req.body` is `undefined` inside `POST /students` or `PUT /students/:id`.
- **Cause:** Express does not parse incoming JSON request bodies by default.
- **Resolution:**
  Ensure this line is present at the top of `server.js` before any route definitions:
  ```javascript
  app.use(express.json());
  ```

---

### 7. Duplicate Key Error (`E11000`)
- **Symptom:** Server crashes with `MongoServerError: E11000 duplicate key error collection: CollegeDB.students index: usn_1 dup key...`
- **Cause:** A student with that USN is already stored, violating the unique index constraint.
- **Resolution:** Catch the error in `try/catch` and return an HTTP `409 Conflict`:
  ```javascript
  try {
    const result = await studentsCollection.insertOne(newStudent);
    res.status(201).json(result);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: `Student with USN '${req.body.usn}' already exists` });
    }
    res.status(500).json({ error: 'Database error' });
  }
  ```

---

### 8. Opening `index.html` via `file:///` Instead of `http://127.0.0.1:3000`
- **Symptom:** Browser console shows `Access to fetch at 'http://127.0.0.1:3000/students' has been blocked by CORS policy` or `Failed to fetch`.
- **Cause:** Double-clicking `index.html` in Windows Explorer opens it using the `file:///` protocol. Browsers restrict API requests from `file:///` origin due to security sandboxing.
- **Resolution:**
  - Let Express serve your frontend with `app.use(express.static('public'))`.
  - Always view your app in the browser at: `http://127.0.0.1:3000`.
