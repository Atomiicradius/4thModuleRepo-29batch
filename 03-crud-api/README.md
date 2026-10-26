# Step 03: Build 5 CRUD Routes & Test in Postman (Module 3b)

## Goal
Implement the five standard RESTful API endpoints for the `students` collection using Express and the MongoDB native driver. Enforce input validation, handle MongoDB `ObjectId` conversion, configure a unique database index on `usn` with `409 Conflict` error handling, and test each route systematically in Postman.

---

## Concepts
A RESTful API maps client HTTP methods directly to database operations: **POST** creates records, **GET** reads records, **PUT** updates records, and **DELETE** removes records. Unlike in-memory JavaScript arrays where items have simple numeric indices, MongoDB documents have an `_id` field stored as a binary BSON **ObjectId**, requiring explicit type conversion before querying. APIs must communicate outcomes using standard HTTP status codes (`200`, `201`, `400`, `404`, `409`, `500`) and a predictable JSON error structure.

---

## The #1 Student Bug: MongoDB ObjectId Conversion

> [!CAUTION]
> In MongoDB, `_id` is **NOT** a JavaScript string. It is a 12-byte BSON `ObjectId`.
> If you write:
> ```javascript
> // ❌ WRONG: Will NEVER match any document!
> db.collection('students').findOne({ _id: req.params.id })
> ```
> You **MUST** import `ObjectId` from `mongodb` and cast the string:
> ```javascript
> // ✅ CORRECT:
> const { ObjectId } = require('mongodb');
> db.collection('students').findOne({ _id: new ObjectId(req.params.id) })
> ```
> Also always check `ObjectId.isValid(id)` first; passing an invalid 24-character string to `new ObjectId()` throws an unhandled error and crashes your server!

---

## Instructor Demo Steps

Build and test the routes one-by-one in this exact order:

### 1. Unique Index on `usn`
In `startServer()`, ensure the database enforces unique student USNs:
```javascript
await studentsCollection.createIndex({ usn: 1 }, { unique: true });
```

---

### Route 1: `POST /students` (Create Student)
**Purpose:** Accept student details, validate fields, insert into MongoDB, and return `201 Created`.

```javascript
app.post('/students', async (req, res) => {
  try {
    const { name, usn, semester, branch } = req.body;
    
    // Validation
    if (!name || !usn || semester === undefined || !branch) {
      return res.status(400).json({ error: 'All fields (name, usn, semester, branch) are required' });
    }
    const semNum = Number(semester);
    if (!Number.isInteger(semNum) || semNum < 1 || semNum > 8) {
      return res.status(400).json({ error: 'Semester must be an integer between 1 and 8' });
    }

    const newStudent = {
      name: name.trim(),
      usn: usn.trim().toUpperCase(),
      semester: semNum,
      branch: branch.trim().toUpperCase()
    };

    const result = await studentsCollection.insertOne(newStudent);
    res.status(201).json({ _id: result.insertedId, ...newStudent });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: `A student with USN '${req.body.usn}' already exists` });
    }
    res.status(500).json({ error: 'Failed to create student' });
  }
});
```

**Postman Test:**
- Method: `POST`
- URL: `http://127.0.0.1:3000/students`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "name": "Kavya",
    "usn": "1CS23CS010",
    "semester": 3,
    "branch": "CSE"
  }
  ```
- **Expected Status:** `201 Created`
- Copy the returned `_id` for following tests!

---

### Route 2: `GET /students` (Read All Students)
**Purpose:** Fetch all students from MongoDB as an array.

```javascript
app.get('/students', async (req, res) => {
  try {
    const students = await studentsCollection.find({}).toArray();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});
```

**Postman Test:**
- Method: `GET`
- URL: `http://127.0.0.1:3000/students`
- **Expected Status:** `200 OK` (returns array of student objects)

---

### Route 3: `GET /students/:id` (Read Single Student)
**Purpose:** Fetch a single student document using its unique MongoDB `_id`.

```javascript
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
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});
```

**Postman Test:**
- Method: `GET`
- URL: `http://127.0.0.1:3000/students/<PASTE_STUDENT_ID>`
- **Expected Status:** `200 OK`

---

### Route 4: `PUT /students/:id` (Update Student)
**Purpose:** Update an existing student's properties using MongoDB `$set`.

```javascript
app.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID format' });
    }

    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name.trim();
    if (req.body.usn) updateFields.usn = req.body.usn.trim().toUpperCase();
    if (req.body.semester !== undefined) {
      const semNum = Number(req.body.semester);
      if (!Number.isInteger(semNum) || semNum < 1 || semNum > 8) {
        return res.status(400).json({ error: 'Semester must be between 1 and 8' });
      }
      updateFields.semester = semNum;
    }
    if (req.body.branch) updateFields.branch = req.body.branch.trim().toUpperCase();

    const result = await studentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updated = await studentsCollection.findOne({ _id: new ObjectId(id) });
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: `A student with USN '${req.body.usn}' already exists` });
    }
    res.status(500).json({ error: 'Failed to update student' });
  }
});
```

**Postman Test:**
- Method: `PUT`
- URL: `http://127.0.0.1:3000/students/<PASTE_STUDENT_ID>`
- Body:
  ```json
  { "semester": 4 }
  ```
- **Expected Status:** `200 OK`

---

### Route 5: `DELETE /students/:id` (Delete Student)
**Purpose:** Delete a student document by `_id`.

```javascript
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
    res.status(500).json({ error: 'Failed to delete student' });
  }
});
```

**Postman Test:**
- Method: `DELETE`
- URL: `http://127.0.0.1:3000/students/<PASTE_STUDENT_ID>`
- **Expected Status:** `200 OK`
- If you call it a second time with the same ID, expect `404 Not Found`.

---

## Your Turn: Add Search Functionality

Enhance the `GET /students` route to support an optional `?search=` query parameter:
1. When a user requests `GET /students?search=rahul` or `GET /students?search=1CS23`, the API should search case-insensitively across **both** `name` and `usn`.
2. Escape special regex characters so students searching for `.` or `(` do not cause errors.
3. Use MongoDB's `$or` with `$regex`:
   ```javascript
   function escapeRegex(text) {
     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
   }

   // Inside GET /students:
   const { search } = req.query;
   let filter = {};
   if (search && search.trim() !== '') {
     const safeRegex = new RegExp(escapeRegex(search.trim()), 'i');
     filter = {
       $or: [
         { name: { $regex: safeRegex } },
         { usn: { $regex: safeRegex } }
       ]
     };
   }
   const students = await studentsCollection.find(filter).toArray();
   ```
4. Test in Postman:
   - `GET http://127.0.0.1:3000/students?search=priya`
   - `GET http://127.0.0.1:3000/students?search=1cs`

---

## Checkpoint Checklist
- [ ] Added `POST /students` and verified `201 Created` in Postman.
- [ ] Attempted inserting duplicate USN and verified `409 Conflict`.
- [ ] Added `GET /students` and retrieved array of students (`200 OK`).
- [ ] Added `GET /students/:id` with `ObjectId` conversion (`200 OK` & `404 Not Found`).
- [ ] Tested invalid ID format (`GET /students/12345`) and verified `400 Bad Request`.
- [ ] Added `PUT /students/:id` and verified updated document is returned (`200 OK`).
- [ ] Added `DELETE /students/:id` and confirmed deletion (`200 OK`).
- [ ] Completed "Your Turn": Added `?search=` query parameter and verified in Postman.

---

## Expected Status Codes Reference Table

| Route | Success | Missing / Invalid Fields | Invalid ID Format | Not Found | Duplicate USN |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `POST /students` | `201` | `400` | — | — | `409` |
| `GET /students` | `200` | — | — | — | — |
| `GET /students/:id` | `200` | — | `400` | `404` | — |
| `PUT /students/:id` | `200` | `400` | `400` | `404` | `409` |
| `DELETE /students/:id`| `200` | — | `400` | `404` | — |

---

## Stuck?
- **Server crashes with `BSONError: Argument passed in must be a single String of 12 bytes or 24 hex characters`**:
  - You passed an invalid ID without checking `ObjectId.isValid(id)`. Ensure you check validity before calling `new ObjectId(id)`.
- **Query returns `null` even though student exists**:
  - Did you query with `{ _id: id }` (string) instead of `{ _id: new ObjectId(id) }`? Remember to cast!
- **`POST` says `Cannot read properties of undefined (reading 'name')`**:
  - You forgot `app.use(express.json());` middleware at the top of your server!
- **Behind?**:
  - Check `03-crud-api/snapshot/server.js` for the complete working reference.
