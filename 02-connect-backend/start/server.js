/**
 * Step 02: Connect Express to MongoDB (Starter)
 * Folder: 02-connect-backend/start        Run with: node server.js
 */

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb'); // the official MongoDB driver

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Connection settings ----------------------------------------------------
// Use 127.0.0.1 (not "localhost") on Windows: it avoids a slow IPv6 lookup.
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'CollegeDB';

// Declared HERE, outside every function, so every route can use them.
// Inside startServer() we fill them in WITHOUT const or let.
let db;
let studentsCollection;

// --- TASK 1: put your own name between the quotes ---------------------------
const YOUR_NAME = 'YOUR NAME';

// --- Health check route -------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: `Hello from ${YOUR_NAME}'s server connected to ${DB_NAME}`,
    time: new Date().toLocaleTimeString(),
    database: DB_NAME
  });
});

// --- TASK 2: switch this route on ---------------------------------------------
// Select the commented lines between the two TASK 2 markers, then press Ctrl + /
// (Cmd + / on Mac) to uncomment them. Save the file and restart the server.
// ───── TASK 2 ─────
// app.get('/ping-db', async (req, res) => {
//   try {
//     const result = await db.collection('pings').insertOne({
//       ping: 'pong',
//       author: YOUR_NAME,
//       timestamp: new Date()
//     });
//     res.json({
//       status: 'ok',
//       message: 'Ping document written to CollegeDB.pings collection!',
//       insertedId: result.insertedId
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// ───── END TASK 2 ─────

// --- Connect to MongoDB ONCE, when the server starts --------------------------
async function startServer() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    // No const/let here: we are filling the variables declared at the top.
    db = client.db(DB_NAME);
    studentsCollection = db.collection('students');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
