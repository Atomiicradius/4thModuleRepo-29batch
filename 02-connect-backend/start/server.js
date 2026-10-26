/**
 * Step 02: Connect Express to MongoDB (Start Template)
 * Follow along with the instructor live!
 */

const express = require('express');
const cors = require('cors');
// DEMO 1: Import MongoClient from the official 'mongodb' native driver
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// DEMO 2: Define MongoDB Connection URI and Database Name
// NOTE: Always use 127.0.0.1 instead of localhost on Windows to avoid IPv6 resolution delays.
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'CollegeDB';

// Declare in outer scope so all route handlers can access db and studentsCollection!
let db;
let studentsCollection;

// Health check route (Task 1)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: "Hello from Samarth's server connected to CollegeDB",
    time: new Date().toLocaleTimeString(),
    database: DB_NAME
  });
});

// DEMO 3: Connect to MongoDB once at startup using an async function
async function startServer() {
  try {
    // 1. Create client and connect
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    // 2. Select database and collection (assign to outer variables, NO const!)
    db = client.db(DB_NAME);
    studentsCollection = db.collection('students');

    // 3. Start listening for incoming HTTP requests on port 3000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();

// ==========================================
// YOUR TURN:
// Task 1: Personalize the health route GET / to return your name and current timestamp.
// Task 2: Create a test insert route to visibly write data to MongoDB:
app.get('/ping-db', async (req, res) => {
  try {
    const result = await db.collection('pings').insertOne({
      ping: 'pong',
      author: 'Samarth',
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
// ==========================================
