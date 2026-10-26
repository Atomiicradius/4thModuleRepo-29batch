/**
 * Step 03: Complete CRUD REST API with MongoDB Native Driver (Start Template)
 * Follow along with the instructor live!
 * 
 * 💡 LAB TIP: Do NOT spend time typing out massive blocks of code!
 * Select each commented route below and press Ctrl + / (Windows) or Cmd + / (Mac) to uncomment.
 */

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'CollegeDB';

let db;
let studentsCollection;

// Helper: Escape special regex characters to prevent injection
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Helper: Validate student input payload
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

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CollegeDB Student API is running'
  });
});

// ============================================================================
// ROUTE 1: CREATE -> POST /students (201 Created)
// ============================================================================
// app.post('/students', async (req, res) => {
//   try {
//     const validationError = validateStudent(req.body);
//     if (validationError) {
//       return res.status(400).json({ error: validationError });
//     }

//     const newStudent = {
//       name: req.body.name.trim(),
//       usn: req.body.usn.trim().toUpperCase(),
//       semester: parseInt(req.body.semester, 10),
//       branch: req.body.branch.trim().toUpperCase()
//     };

//     const result = await studentsCollection.insertOne(newStudent);

//     res.status(201).json({
//       _id: result.insertedId,
//       ...newStudent
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(409).json({
//         error: `A student with USN '${req.body.usn}' already exists`
//       });
//     }
//     console.error('POST /students error:', error);
//     res.status(500).json({ error: 'Failed to create student' });
//   }
// });

// ============================================================================
// ============================================================================
// ROUTE 2: READ ALL -> GET /students (200 OK)
// ============================================================================
// app.get('/students', async (req, res) => {
//   try {
//     const { search } = req.query;
//     let filter = {};

//     if (search && search.trim() !== '') {
//       const cleanSearch = escapeRegex(search.trim());
//       const regex = new RegExp(cleanSearch, 'i');
//       filter = {
//         $or: [
//           { name: { $regex: regex } },
//           { usn: { $regex: regex } }
//         ]
//       };
//     }

//     const students = await studentsCollection.find(filter).toArray();
//     res.json(students);
//   } catch (error) {
//     console.error('GET /students error:', error);
//     res.status(500).json({ error: 'Failed to fetch students' });
//   }
// });

// ============================================================================
// ROUTE 3: READ ONE -> GET /students/:id (200 OK)
// (UNCOMMENT to enable)
// ============================================================================
// app.get('/students/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!ObjectId.isValid(id)) {
//       return res.status(400).json({ error: 'Invalid student ID format' });
//     }

//     // Critical: new ObjectId(id) converts string to BSON ObjectId
//     const student = await studentsCollection.findOne({ _id: new ObjectId(id) });
//     if (!student) {
//       return res.status(404).json({ error: 'Student not found' });
//     }
//     res.json(student);
//   } catch (error) {
//     console.error(`GET /students/:id error:`, error);
//     res.status(500).json({ error: 'Failed to fetch student' });
//   }
// });

// ============================================================================
// ROUTE 4: UPDATE -> PUT /students/:id (200 OK)
// (UNCOMMENT to enable)
// ============================================================================
// app.put('/students/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!ObjectId.isValid(id)) {
//       return res.status(400).json({ error: 'Invalid student ID format' });
//     }

//     const validationError = validateStudent(req.body, true);
//     if (validationError) {
//       return res.status(400).json({ error: validationError });
//     }

//     const updateFields = {};
//     if (req.body.name !== undefined) updateFields.name = req.body.name.trim();
//     if (req.body.usn !== undefined) updateFields.usn = req.body.usn.trim().toUpperCase();
//     if (req.body.semester !== undefined) updateFields.semester = parseInt(req.body.semester, 10);
//     if (req.body.branch !== undefined) updateFields.branch = req.body.branch.trim().toUpperCase();

//     const result = await studentsCollection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: updateFields }
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     const updatedStudent = await studentsCollection.findOne({ _id: new ObjectId(id) });
//     res.json(updatedStudent);
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(409).json({
//         error: `A student with USN '${req.body.usn}' already exists`
//       });
//     }
//     console.error('PUT /students/:id error:', error);
//     res.status(500).json({ error: 'Failed to update student' });
//   }
// });

// // ============================================================================
// // ROUTE 5: DELETE -> DELETE /students/:id (200 OK)
// // (UNCOMMENT to enable)
// // ============================================================================
// app.delete('/students/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!ObjectId.isValid(id)) {
//       return res.status(400).json({ error: 'Invalid student ID format' });
//     }

//     const result = await studentsCollection.deleteOne({ _id: new ObjectId(id) });
//     if (result.deletedCount === 0) {
//       return res.status(404).json({ error: 'Student not found' });
//     }
//     res.json({ message: 'Student deleted successfully', deletedId: id });
//   } catch (error) {
//     console.error('DELETE /students/:id error:', error);
//     res.status(500).json({ error: 'Failed to delete student' });
//   }
// });

// Startup function
async function startServer() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    db = client.db(DB_NAME);
    studentsCollection = db.collection('students');

    // Create unique index on usn to prevent duplicate students
    await studentsCollection.createIndex({ usn: 1 }, { unique: true });
    console.log("Index verified: unique 'usn'");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
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
