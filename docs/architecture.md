# System Architecture: Day 4 Full-Stack Student Management

## Overview

The Day 4 Student Management System is structured around a classic **Three-Tier Architecture**:
1. **Presentation Tier (Frontend Client)**: Plain HTML5, CSS3, and vanilla JavaScript running directly in the student's browser.
2. **Application Tier (Backend API Server)**: Node.js runtime with Express.js routing, middleware, and input validation.
3. **Data Tier (Database Server)**: MongoDB Community Server persisting JSON-like BSON documents to disk on port 27017.

```
┌────────────────────────────────────────────────────────┐
│               PRESENTATION TIER (Browser)              │
│   index.html            style.css           script.js  │
│  (UI Structure)      (Responsive CSS)      (DOM/fetch) │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTP / JSON (fetch API)
                            │
┌───────────────────────────▼────────────────────────────┐
│               APPLICATION TIER (Node/Express)          │
│                    server.js (Port 3000)               │
│   • CORS Middleware          • express.json() parser   │
│   • express.static()         • Route Handlers (CRUD)   │
│   • Input Validation         • ObjectId Conversion     │
└───────────────────────────┬────────────────────────────┘
                            │
               MongoDB Wire Protocol (TCP 27017)
                            │
┌───────────────────────────▼────────────────────────────┐
│                 DATA TIER (MongoDB Server)             │
│                  Database: CollegeDB                   │
│                 Collection: students                   │
│   • Persistent BSON Storage  • Unique Index on 'usn'   │
└────────────────────────────────────────────────────────┘
```

---

## 1. Presentation Tier (Client Frontend)

- **Pure Vanilla Stack**: Built without frontend frameworks (React, Angular, Vue) or bundlers (Webpack, Vite) so students understand foundational web concepts.
- **Asynchronous HTTP Calls (`fetch`)**: Uses `async/await` and Promises to communicate with Express endpoints without triggering page reloads.
- **Defensive DOM Rendering**:
  - All user-supplied strings are escaped using HTML entity replacement (`&`, `<`, `>`, `"`, `'`) before template interpolation.
  - Prevents Cross-Site Scripting (XSS) attacks.
- **Live Debounced Search**: A 300ms debounce timer on keyboard input throttles query requests to avoid database bottlenecks while typing.

---

## 2. Application Tier (Node.js & Express)

- **Port & Host**: Runs on `http://127.0.0.1:3000`. Using `127.0.0.1` explicitly prevents Windows IPv6 resolution latency.
- **Single Connection Pooling**:
  - `MongoClient` is instantiated once during server startup (`startServer()`).
  - All incoming HTTP requests share the underlying connection pool.
  - Prevents socket starvation and maximizes throughput.
- **RESTful Routing Convention**:
  - `POST /students` -> `201 Created`
  - `GET /students` -> `200 OK` (supports `?search=` and `?branch=`)
  - `GET /students/:id` -> `200 OK`
  - `PUT /students/:id` -> `200 OK`
  - `DELETE /students/:id` -> `200 OK`
- **Predictable Error Contracts**: All client and server errors return a standard JSON object:
  ```json
  { "error": "Human-readable explanation of what failed" }
  ```

---

## 3. Data Tier (MongoDB `CollegeDB`)

- **Database**: `CollegeDB`
- **Collection**: `students`
- **Document Schema**:
  ```json
  {
    "_id": ObjectId("662b1a8f9c2d1e001f3b4c51"),
    "name": "Rahul",
    "usn": "1CS23CS001",
    "semester": 3,
    "branch": "CSE"
  }
  ```
- **Indexes**:
  - Default index on `_id` (Primary Key).
  - Unique compound index on `usn`: `{ usn: 1 }, { unique: true }`.
  - Guarantees database-level rejection of duplicate student enrollments (Error code `11000`).

---

## 4. End-to-End Data Flow Scenarios

### Scenario A: Adding a New Student (`POST`)

```
1. User types "Rahul" & "1CS23CS001" and clicks "Add Student"
2. Browser: script.js intercepts event (e.preventDefault())
3. Browser: Validates inputs locally
4. Browser: fetch('POST /students', { body: JSON })
5. Express: express.json() parses body into req.body
6. Express: Validates name, usn, semester (1-8), branch
7. Express: studentsCollection.insertOne(newStudent)
8. MongoDB: Checks unique index on 'usn'
9. MongoDB: Generates BSON ObjectId and writes document to disk
10. Express: Returns HTTP 201 Created with full document
11. Browser: Displays green notification banner
12. Browser: Triggers loadStudents() to re-render DOM table
```

### Scenario B: Editing an Existing Student (`PUT`)

```
1. User clicks "Edit" button on a student row
2. Browser: Extracts _id, populates form inputs, switches button to "Update"
3. User modifies semester from 3 to 4 and clicks "Update"
4. Browser: fetch('PUT /students/:id', { body: JSON })
5. Express: Validates ObjectId format with ObjectId.isValid(id)
6. Express: studentsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields })
7. MongoDB: Updates document on disk
8. Express: Returns HTTP 200 OK with updated document
9. Browser: Shows success message, restores form to "Add" mode, refreshes table
```
