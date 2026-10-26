/**
 * Day 4 Reference App: Full Stack Student Management System
 * RV College of Engineering - Department of Computer Science & Engineering
 * 
 * Stack: Node.js (CommonJS), Express, MongoDB Native Driver, CORS, Vanilla Frontend.
 * Database: CollegeDB | Collection: students | Port: 3000
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'CollegeDB';

let db;
let studentsCollection;

// Helper: Escape special regex characters
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Helper: Validation
function validateStudent(body, isUpdate = false) {
  const { name, usn, semester, branch } = body;

  if (!isUpdate) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return 'Student name is required and must be text';
    }
    if (!usn || typeof usn !== 'string' || usn.trim() === '') {
      return 'Student USN is required and must be text';
    }
    if (semester === undefined || semester === null) {
      return 'Semester is required';
    }
    if (!branch || typeof branch !== 'string' || branch.trim() === '') {
      return 'Branch is required and must be text';
    }
  }

  if (semester !== undefined) {
    const semNum = Number(semester);
    if (!Number.isInteger(semNum) || semNum < 1 || semNum > 8) {
      return 'Semester must be an integer between 1 and 8';
    }
  }

  return null;
}

// ============================================================================
// CRUD Routes
// ============================================================================

// 1. POST /students - Create Student
app.post('/students', async (req, res) => {
  try {
    const validationError = validateStudent(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const newStudent = {
      name: req.body.name.trim(),
      usn: req.body.usn.trim().toUpperCase(),
      semester: parseInt(req.body.semester, 10),
      branch: req.body.branch.trim().toUpperCase()
    };

    const result = await studentsCollection.insertOne(newStudent);
    res.status(201).json({
      _id: result.insertedId,
      ...newStudent
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: `A student with USN '${req.body.usn}' already exists`
      });
    }
    console.error('POST /students error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// 2. GET /students - Read All (with optional ?search= and ?branch= filters)
app.get('/students', async (req, res) => {
  try {
    const { search, branch } = req.query;
    let filter = {};

    // Branch filter
    if (branch && branch.trim() !== '' && branch.toUpperCase() !== 'ALL') {
      filter.branch = branch.trim().toUpperCase();
    }

    // Search query filter (name or usn)
    if (search && search.trim() !== '') {
      const cleanSearch = escapeRegex(search.trim());
      const regex = new RegExp(cleanSearch, 'i');
      filter.$or = [
        { name: { $regex: regex } },
        { usn: { $regex: regex } }
      ];
    }

    const students = await studentsCollection.find(filter).toArray();
    res.json(students);
  } catch (error) {
    console.error('GET /students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// 3. GET /students/:id - Read One
app.get('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID format' });
    }

    const student = await studentsCollection.findOne({ _id: new ObjectId(id) });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error(`GET /students/${req.params.id} error:`, error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// 4. PUT /students/:id - Update Student
app.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID format' });
    }

    const validationError = validateStudent(req.body, true);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const updateFields = {};
    if (req.body.name !== undefined) updateFields.name = req.body.name.trim();
    if (req.body.usn !== undefined) updateFields.usn = req.body.usn.trim().toUpperCase();
    if (req.body.semester !== undefined) updateFields.semester = parseInt(req.body.semester, 10);
    if (req.body.branch !== undefined) updateFields.branch = req.body.branch.trim().toUpperCase();

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const result = await studentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updatedStudent = await studentsCollection.findOne({ _id: new ObjectId(id) });
    res.json(updatedStudent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: `A student with USN '${req.body.usn}' already exists`
      });
    }
    console.error(`PUT /students/${req.params.id} error:`, error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// 5. DELETE /students/:id - Delete Student
app.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID format' });
    }

    const result = await studentsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully', id });
  } catch (error) {
    console.error(`DELETE /students/${req.params.id} error:`, error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: DB_NAME,
    message: 'Server is healthy and connected to MongoDB'
  });
});

// Startup function
async function startServer() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    db = client.db(DB_NAME);
    studentsCollection = db.collection('students');

    // Create unique index on USN
    await studentsCollection.createIndex({ usn: 1 }, { unique: true });
    console.log("Index verified: unique 'usn'");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    process.on('SIGINT', async () => {
      console.log('\nShutting down gracefully...');
      await client.close();
      server.close(() => {
        console.log('Database connection closed.');
        process.exit(0);
      });
    });

    return { app, client, db, studentsCollection };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
