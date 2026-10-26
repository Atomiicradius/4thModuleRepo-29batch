# Step 02: Connect Express to MongoDB (Module 3a)

## Goal
Initialize a Node.js Express backend project, install the official `mongodb` native driver and `cors`, establish a single persistent connection to local MongoDB Community Server at startup, and create a `GET /` health-check route.

---

## Concepts
A Node.js backend acts as the middle tier between client browsers and the database server. Rather than creating a new database connection for each incoming HTTP request (which is computationally expensive and quickly exhausts database connections), modern backends use **connection pooling** through `MongoClient`: we connect once when the server boots and reuse that active connection across all routes. Using `async/await` ensures our server waits for MongoDB to acknowledge the connection before accepting HTTP requests.

---

## Instructor Demo Steps

Follow along step-by-step in your terminal:

### 1. Initialize the Node.js Project & Install Dependencies
Navigate into your project folder:
```powershell
cd 02-connect-backend/start
```

Install the required packages:
```powershell
npm install express mongodb cors
```
- `express`: Fast, minimalist web framework for Node.js.
- `mongodb`: The official MongoDB native driver for Node.js.
- `cors`: Express middleware to enable Cross-Origin Resource Sharing.

### 2. Inspect Connection String & Configuration
In `server.js`, specify:
```javascript
const { MongoClient } = require('mongodb');

// Always use 127.0.0.1 on Windows to bypass IPv6 resolution delays
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'CollegeDB';
```

> **Why `127.0.0.1` instead of `localhost`?**
> On Windows 10/11, `localhost` often resolves to the IPv6 address `::1` first. If MongoDB is only listening on IPv4, Node.js waits 2-3 seconds before falling back, or fails with `ECONNREFUSED`. Using `127.0.0.1` connects instantly.

### 3. Implement Single Persistent Connection at Startup
Wrap the startup sequence in an `async` function:
```javascript
async function startServer() {
  try {
    // Connect to the MongoDB server
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    // Access the database and collection
    db = client.db(DB_NAME);
    studentsCollection = db.collection('students');

    // Start Express listener only AFTER MongoDB is connected
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
```

### 4. Add the Health Route
```javascript
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Connected to MongoDB',
    database: DB_NAME,
    collection: 'students'
  });
});
```

### 5. Run and Test
Start the server:
```powershell
node server.js
```
Open your browser or Postman and visit `http://127.0.0.1:3000/`.

---

## Your Turn: Student Task

1. **Task 1 — Personalize Health Route:** In `server.js`, modify `GET /` to include your name and the current server time:
   ```javascript
   app.get('/', (req, res) => {
     res.json({
       status: 'ok',
       message: 'Hello from Rahul\'s server connected to CollegeDB',
       time: new Date().toLocaleTimeString(),
       database: DB_NAME
     });
   });
   ```
2. **Task 2 — Write Data Live to MongoDB (`/ping-db`):** Add a test route below `GET /` that writes a real document to a `pings` collection:
   ```javascript
   app.get('/ping-db', async (req, res) => {
     try {
       const result = await db.collection('pings').insertOne({
         ping: 'pong',
         author: 'Rahul',
         timestamp: new Date()
       });
       res.json({
         status: 'ok',
         message: 'Ping document written to CollegeDB.pings collection!',
         insertedId: result.insertedId
       });
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
   });
   ```
3. Restart your server (`node server.js`) and visit `http://127.0.0.1:3000/ping-db` in your browser. Refresh 2 or 3 times!
4. Verify your writes physically hit the database. Use the **`>_ MONGOSH`** panel in MongoDB Compass (or a second PowerShell window running `mongosh`):
   ```javascript
   use("CollegeDB")
   db.getCollectionNames()
   db.pings.find()
   ```
   *Notice:* The `pings` collection was dynamically created by your Express code, and each visit inserted a new document with an `_id` and timestamp!

---

## Checkpoint Checklist
- [ ] Installed `express`, `mongodb`, and `cors`.
- [ ] Executed `node server.js`.
- [ ] Terminal displays exact messages:
  - `Connected to MongoDB`
  - `Server running on port 3000`
- [ ] Navigated to `http://127.0.0.1:3000/` in browser or Postman and received `200 OK` JSON.
- [ ] Completed "Your Turn" by temporarily modifying and verifying `DB_NAME`.

---

## Expected Output
**Terminal:**
```text
Connected to MongoDB
Server running on port 3000
```

**Browser / Postman (`GET http://127.0.0.1:3000/`):**
```json
{
  "status": "ok",
  "message": "Connected to MongoDB",
  "database": "CollegeDB",
  "collection": "students"
}
```

---

## Stuck?
- **Terminal shows `connect ECONNREFUSED 127.0.0.1:27017`**:
  - The local MongoDB service is not running. Run `net start MongoDB` in an Administrator prompt.
- **Port 3000 in use (`EADDRINUSE: address already in use :::3000`)**:
  - A previous Node process is still running. In PowerShell, find and terminate it:
    ```powershell
    Get-Process -Name node | Stop-Process -Force
    ```
- **Behind or code has errors?**:
  - Compare your code against `02-connect-backend/snapshot/server.js` or copy the snapshot files over to your `start` folder.
