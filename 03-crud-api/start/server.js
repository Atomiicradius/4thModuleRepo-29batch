/**
 * Step 02: Connect Express to MongoDB (Finished Snapshot)
 * 
 * Key Concepts:
 * - MongoClient: Manages the TCP connection pool to MongoDB.
 * - Single Connection at Startup: Opening a connection for every incoming HTTP request
 *   is slow and exhausts database sockets. Instead, we connect once when the server boots
 *   and reuse the connection for all requests.
 * - 127.0.0.1 vs localhost: On Windows, "localhost" can attempt IPv6 (::1) first, causing
 *   a 2-3 second connection delay or ECONNREFUSED. Using explicit IPv4 127.0.0.1 avoids this.
 */

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB configuration
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'CollegeDB';

let db;
let studentsCollection;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Connected to MongoDB',
    database: DB_NAME,
    collection: 'students'
  });
});

// Test insert route (Your Turn: inserts a document to verify live writing)
app.get('/ping-db', async (req, res) => {
  try {
    const result = await db.collection('pings').insertOne({
      ping: 'pong',
      message: 'MongoDB write verified from Express!',
      timestamp: new Date()
    });
    res.json({
      status: 'ok',
      message: 'Ping document written to CollegeDB.pings collection!',
      insertedId: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Startup function: Connect once, then start Express
async function startServer() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    db = client.db(DB_NAME);
    studentsCollection = db.collection('students');

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      console.log('\nShutting down gracefully...');
      await client.close();
      server.close(() => {
        console.log('Server stopped and database connection closed.');
        process.exit(0);
      });
    });

    return { app, client, db, studentsCollection };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

// Only start directly if run from CLI
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
