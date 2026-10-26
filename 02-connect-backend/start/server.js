/**
 * Step 02: Connect Express to MongoDB (Start Template)
 * Follow along with the instructor live!
 * 
 * 💡 LAB TIP: Do NOT type long code blocks! 
 * Select the commented sections below and press Ctrl + / (Windows) or Cmd + / (Mac) to uncomment.
 */

const express = require('express');
const cors = require('cors');

// ============================================================================
// STEP 1: Import MongoClient from official 'mongodb' driver
// (UNCOMMENT the line below)
// ============================================================================
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// ============================================================================
// STEP 2: MongoDB Connection Configuration
// NOTE: Always use 127.0.0.1 instead of localhost on Windows to avoid IPv6 resolution delays.
// (UNCOMMENT the lines below)
// ============================================================================
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'CollegeDB';

// Global variables to hold active database and collection instances
let db;
let studentsCollection;

// ============================================================================
// STEP 3: Health Check Route
// Shows connection status when visiting http://127.0.0.1:3000/
// ============================================================================
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Connected to MongoDB',
    database: DB_NAME,
    collection: 'students'
  });
});

// ============================================================================
// STEP 4: Connect to MongoDB once at startup using async startServer()
// (All connection logic is already wired up below!)
// ============================================================================
async function startServer() {
  try {
    // 1. Create client and connect to local MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB at 127.0.0.1:27017');

    // 2. Select database and collection
    db = client.db(DB_NAME);
    studentsCollection = db.collection('students');

    // 3. Start listening for incoming HTTP requests on port 3000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Visit http://127.0.0.1:${PORT} in your browser`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();

// ============================================================================
// YOUR TURN: Live Database Write Verification (/ping-db)
// 
// Simply UNCOMMENT the block below (Select & press Ctrl + /), restart your
// server (`node server.js`), and visit http://127.0.0.1:3000/ping-db in your browser!
// ============================================================================
// app.get('/ping-db', async (req, res) => {
//   try {
//     const result = await db.collection('pings').insertOne({
//       ping: 'pong',
//       author: 'Student',
//       message: 'MongoDB write verified from Express!',
//       timestamp: new Date()
//     });
//     res.json({
//       status: 'ok',
//       message: 'Ping document written to CollegeDB.pings collection!',
//       insertedId: result.insertedId
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
