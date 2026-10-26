# Day 4 Instructor Teaching Guide & Lecture Script
**Course:** Full Stack Development Skill Lab (First Year / Second Year Odd Semester)  
**Institution:** Department of Computer Science & Engineering, RV College of Engineering  
**Module Topic:** Database Integration & Full-Stack System (MongoDB + Express + Vanilla JS)

---

## 📋 Welcome, Instructor!

This guide is your complete, battle-tested playbook for teaching **Day 4**. It is written so you can review it tonight, walk into the lab tomorrow morning with confidence, project your screen, and deliver an engaging, smooth, and stress-free session for 60+ engineering students.

### The Pedagogical Strategy: "I Demo $\rightarrow$ You Type $\rightarrow$ Your Turn $\rightarrow$ Checkpoint"
1. **Explain the "Why" (3–5 min):** Plain language analogy with zero jargon.
2. **Instructor Live Demo (10–15 min):** Type slowly on the projector, explaining each line as you write it.
3. **Student Follow-Along (10 min):** Students type the same code on their lab machines.
4. **"Your Turn" Challenge (10–15 min):** Students solve a guided mini-task applying the concept.
5. **Continuous Progression Rule:** If a student gets stuck, they can copy `snapshot/` to catch up instantly. **No student is ever left behind.**

---

## ⏰ Suggested Lab Timetable (5–6 Hour Session)

| Period | Time | Module / Step | Activity |
| :---: | :---: | :--- | :--- |
| **09:00 – 09:30** | 30m | **Module 1: Theory Briefing** | Slides: SQL vs NoSQL, 3-tier architecture, why databases? |
| **09:30 – 09:45** | 15m | **00-setup-check** | Run automated `check-setup.js` across all lab machines |
| **09:45 – 11:00** | 75m | **01-mongodb-shell** | `mongosh`, `use CollegeDB`, `insertMany`, `$gte`, `$set`, Compass |
| **11:00 – 11:15** | 15m | ☕ **Tea / Lab Break** | Rest & answer student questions |
| **11:15 – 11:45** | 30m | **02-connect-backend** | Node project init, `MongoClient` connection pool, health route |
| **11:45 – 12:45** | 60m | **03-crud-api** | Build 5 REST routes, ObjectId casting, unique index, Postman |
| **12:45 – 01:45** | 60m | 🍱 **Lunch Break** | — |
| **01:45 – 02:15** | 30m | **04-frontend-fetch** | `express.static()`, browser `fetch()`, click-to-render loop |
| **02:15 – 03:45** | 90m | **05-student-management-app** | Capstone: Build Edit (3), Search (5), Persistence test (6) |
| **03:45 – 04:30** | 45m | **Wrap-Up, Git & Viva** | Local Git commit (pushing is homework), viva voce evaluation |

---

## 🛠️ 15-Minute Pre-Lab Setup (Before Students Arrive)

1. **Verify your Instructor PC:**
   - Open PowerShell and run:
     ```powershell
     cd "00-setup-check"
     node check-setup.js
     ```
   - Ensure all 5 checks show `[ PASS ]` (requires **Node v22+ or v24+ LTS**; Node 20 reached EOL in April 2026).
2. **Clean Database Reset (Critical for Zero Glitches):**
   - Drop leftover records or dry-run artifacts to prevent duplicate key errors (`E11000`):
     ```powershell
     mongosh --eval "db.getSiblingDB('CollegeDB').dropDatabase()"
     ```
3. **Offline USB Distribution Setup (Saves Lab Network Bandwidth):**
   - Node.js resolves `node_modules` up parent directories. One single install at the repo root serves every single step folder!
   - On your master machine, run:
     ```powershell
     npm install --omit=dev
     ```
   - Zip the entire repository folder (including `node_modules`, skipping `.git` or `tests/`) onto a USB thumb drive.
   - Tell students to copy and extract this zip—they will **not** need internet or per-step `npm install` runs!
4. **Projector Display Settings:**
   - In VS Code: Zoom font size using `Ctrl + =` (set font to at least **18px** so back-benchers can see clearly).
   - Use a high-contrast theme (e.g. *Dark+* or *GitHub Dark Default*).
   - Enable word wrap (`Alt + Z`).
5. **Compass & Postman:**
   - Have MongoDB Compass and Postman running in the background.

---

## 🎙️ Step-by-Step Teaching Script

---

### Step 00: Environment Verification (15 min)

#### What to Tell Students:
> *"Good morning everyone! On Days 1 and 2, we built HTML/CSS pages and manipulated the DOM with JavaScript. On Day 3, we built an Express API that stored data inside a temporary JavaScript array. What happened every time you restarted the server? The array was wiped clean!*  
> *Today, we give our application a permanent memory using MongoDB. Before writing code, let's ensure our tools are connected."*

#### Live Demo Actions:
1. Tell students to open PowerShell and navigate to `00-setup-check`:
   ```powershell
   cd 00-setup-check
   node check-setup.js
   ```
2. Walk the lab floor to spot red `[ FAIL ]` marks:
   - If **MongoDB Service** fails: Run `net start MongoDB` as Administrator.
   - If **mongosh** fails: Run `winget install MongoDB.Shell`.

---

### Step 01: MongoDB Shell & Basic CRUD (75 min)

#### What to Tell Students (Concepts):
> *"Think of SQL databases like Excel workbooks with rigid columns. If you add a student with a missing column, SQL complains. MongoDB is different: it's a **document database**. A collection is like a folder, and each student is an individual JSON-like document (called BSON) inside that folder."*

#### Live Demo Commands (Type slowly in `mongosh`):
1. **Launch Shell:**
   ```powershell
   mongosh "mongodb://127.0.0.1:27017"
   ```
   *Explain:* Always use `127.0.0.1` instead of `localhost` on Windows to avoid IPv6 delays.
2. **Switch Database:**
   ```javascript
   use CollegeDB
   ```
   *Explain:* MongoDB is lazy—it won't create `CollegeDB` on disk until we write our first document.
3. **Create Collection & Unique Index:**
   ```javascript
   db.createCollection("students")
   db.students.createIndex({ usn: 1 }, { unique: true })
   ```
4. **Insert One (`insertOne`):**
   ```javascript
   db.students.insertOne({ name: "Rahul", usn: "1CS23CS001", semester: 3, branch: "CSE" })
   ```
   *Point out:* The returned `insertedId: ObjectId('...')`. Mention that MongoDB created this automatically!
5. **Insert Many (`insertMany`):**
   ```javascript
   db.students.insertMany([
     { name: "Priya", usn: "1CS23CS002", semester: 3, branch: "CSE" },
     { name: "Amit", usn: "1CS23CS003", semester: 5, branch: "ISE" },
     { name: "Sneha", usn: "1CS23CS004", semester: 4, branch: "ECE" },
     { name: "Vikram", usn: "1CS23CS005", semester: 6, branch: "AIML" }
   ])
   ```
6. **Query & Filters:**
   ```javascript
   db.students.find()                             // All
   db.students.find({ branch: "CSE" })            // Filter
   db.students.find({ semester: { $gte: 4 } })    // Greater than or equal to 4
   ```
7. **Update (`updateOne` with `$set`):**
   ```javascript
   db.students.updateOne({ usn: "1CS23CS001" }, { $set: { semester: 4 } })
   ```
   *Crucial Warning:* Explain why `$set` is mandatory. Without `$set`, MongoDB would replace the entire document!
8. **Delete (`deleteOne`):**
   ```javascript
   db.students.deleteOne({ usn: "1CS23CS005" })
   ```
9. **Show Compass GUI:**
   Open MongoDB Compass $\rightarrow$ Connect to `127.0.0.1:27017` $\rightarrow$ Show `CollegeDB.students` visually! Students love seeing GUI representation of their CLI commands.

#### Student "Your Turn" Task (15 min):
- Ask students to insert **3 of their own classmates** with unique USNs and query only students with `semester >= 3`.
- **Accidental Deletions?** Tell them: `mongosh mongodb://127.0.0.1:27017/CollegeDB seed.js` restores the clean 5 students.

---

### Step 02: Connect Express to MongoDB (30 min)

#### What to Tell Students (Concepts):
> *"In Day 3, you built Express routes. But how does Express talk to MongoDB? Through an official translator called `MongoClient`. Creating a database connection is heavy—it takes TCP handshakes and memory. So we **connect once** when our server starts up and reuse that connection pool for every incoming request."*

#### Live Demo Steps (`02-connect-backend`):
1. Navigate to `02-connect-backend/start`:
   ```powershell
   npm install express mongodb cors
   ```
2. Code `server.js` live:
   - Import `MongoClient`:
     ```javascript
     const { MongoClient } = require('mongodb');
     ```
   - Set up URI and DB name:
     ```javascript
     const MONGO_URI = 'mongodb://127.0.0.1:27017';
     const DB_NAME = 'CollegeDB';
     let db, studentsCollection;
     ```
   - Write `startServer()` async function:
     ```javascript
     async function startServer() {
       const client = new MongoClient(MONGO_URI);
       await client.connect();
       console.log('Connected to MongoDB');

       db = client.db(DB_NAME);
       studentsCollection = db.collection('students');

       app.listen(3000, () => {
         console.log('Server running on port 3000');
       });
     }
     startServer();
     ```
3. Run `node server.js` and visit `http://127.0.0.1:3000` in the browser to show `{ status: "ok" }`.

#### Student "Your Turn" Task (10 min):
- Give students a **visible, tangible verification** task:
  1. Personalize `GET /` to return their own name and timestamp:
     ```javascript
     res.json({ status: 'ok', author: 'Your Name', timestamp: new Date().toISOString() });
     ```
  2. Implement a `/ping-db` route that writes a test document to `db.collection('pings')`:
     ```javascript
     app.get('/ping-db', async (req, res) => {
       const result = await db.collection('pings').insertOne({ pingedAt: new Date() });
       res.json({ status: 'ok', insertedId: result.insertedId });
     });
     ```
  3. Verify visibility in `mongosh`: run `show collections` and `db.pings.find()`. Students see their document immediately!

---

### Step 03: Build 5 CRUD Routes & Test in Postman (60 min)

#### What to Tell Students (The #1 Student Bug Alert!):
> [!IMPORTANT]
> Write this on the whiteboard in big letters:  
> **`_id` is an `ObjectId("...")`, NOT a string!**  
> If you query `{ _id: req.params.id }`, MongoDB will return `null` every time. You **must** write `{ _id: new ObjectId(req.params.id) }`.

#### Live Demo Flow: Build one route $\rightarrow$ Test immediately in Postman:
1. **Route 1: `POST /students` (201 Created):**
   - Explain validation: check missing fields, ensure semester is integer between 1 and 8.
   - Catch `error.code === 11000` and return `409 Conflict` (Explain why 409 represents duplicate resource).
   - *Postman Demo:* Send valid JSON $\rightarrow$ receive `201`. Send duplicate USN $\rightarrow$ receive `409`.
2. **Route 2: `GET /students` (200 OK):**
   - Use `await studentsCollection.find({}).toArray()`.
   - *Postman Demo:* View all students in JSON array.
3. **Route 3: `GET /students/:id` (200 OK):**
   - Demonstrate `ObjectId.isValid(id)` $\rightarrow$ returns `400` if bad format.
   - Query with `new ObjectId(id)` $\rightarrow$ returns `404` if not found, `200` if found.
4. **Route 4: `PUT /students/:id` (200 OK):**
   - Use `$set` with `updateOne`.
   - Return updated document.
5. **Route 5: `DELETE /students/:id` (200 OK):**
   - Use `deleteOne`. If `deletedCount === 0`, return `404`.

#### Student "Your Turn" Task (15 min):
- Add `?search=` query parameter to `GET /students` using `$regex` and `$or` across `name` and `usn`.

---

### Step 04: Frontend Integration with Fetch (30 min)

#### What to Tell Students (Concepts):
> *"Up until now, you've used Postman as a mock user. Now, we replace Postman with our own web page! Express will serve our HTML/CSS using `express.static('public')`. When a user clicks a button, JavaScript fires an asynchronous `fetch()` request behind the scenes."*

#### Live Demo:
1. Add `app.use(express.static(path.join(__dirname, 'public')));` to `server.js`.
2. Open `http://127.0.0.1:3000` in Chrome.
3. Walk through `script.js`:
   - `e.preventDefault()` on form submit (Explain: stops full page refresh).
   - Calling `fetch('/students', { method: 'POST', body: JSON.stringify(...) })`.
   - Re-rendering table rows dynamically.
4. **Show XSS Vulnerability:** Explain why we sanitize text with `escapeHtml()` instead of raw `innerHTML`.

#### Student "Your Turn" Task (10 min):
- Complete the `deleteStudent(id, name)` function: prompt with `window.confirm()`, call `fetch(..., { method: 'DELETE' })`, and reload table.

---

### Step 05: Capstone Major Hands-on (90 min)

This is the students' major practical activity of the day.

#### Crucial Slide & Teaching Point: Don't Panic!
> ⚠️ **Tell students clearly so they don't panic:**  
> The starter code in `05-student-management-app/start/` **already has Features 1, 2, and 4 completed** (carried over from Step 04)!  
> Students do NOT need to rewrite the app from scratch. They are adding **three specific capabilities**:
> 1. **Feature 3:** Edit Student (`PUT /students/:id`, loading form with existing data, updating table).
> 2. **Feature 5:** Live Search with 300ms debounce (filtering table by name or USN).
> 3. **Feature 6:** The Full-Stack Persistence Test across server/browser restarts.

#### How to Facilitate:
1. Present the **Feature Breakdown** on the projector:
   | Feature | Status in Starter Code | Student Task |
   | :--- | :--- | :--- |
   | **1. Add Student** | ✅ Already working from Step 04 | Test with valid & duplicate USN |
   | **2. View Directory** | ✅ Already working from Step 04 | Check count badge updates |
   | **3. Edit Student** | ⏳ **STUDENTS BUILD THIS** | Add edit button, prefill form, send PUT |
   | **4. Delete Student** | ✅ Already working from Step 04 | Verify confirmation modal |
   | **5. Live Search** | ⏳ **STUDENTS BUILD THIS** | Implement debounced search input |
   | **6. Persistence Test** | ⏳ **STUDENTS EXECUTE THIS** | Restart Node server, verify data intact |
2. **Pedagogical Note on Solutions:**
   - Both `snapshot/` and `reference/` are provided in the repo as emergency catch-up safety nets so no student gets stuck.
   - Instruct students to **consult `hints/` first** before peeking at solutions.
   - *Instructor Tip:* If you prefer a stricter assessment or live competition, you can temporarily withhold the `reference/` folder from student zip files until the wrap-up period.
3. **The Big "Aha!" Moment — Feature 6 (Persistence Test):**
   - Have all students add a student named `"Persistence Hero"`.
   - Instruct everyone: *"Now, press `Ctrl + C` in your terminal to shut down Node.js completely!"*
   - *"Is the data lost? Let's check! Start the server again (`node server.js`) and reload the browser."*
   - Watch their excitement when their data reappears intact from MongoDB!

---

## 🔍 Emergency Troubleshooting Cheat Sheet (For Lab Assistants & Instructors)

| Problem | Instant Command / Fix |
| :--- | :--- |
| **Port 3000 already in use** | `Get-Process node \| Stop-Process -Force` |
| **MongoDB connection refused** | `net start MongoDB` (in Administrator PowerShell) |
| **mongosh command not recognized** | `& "$env:LOCALAPPDATA\Programs\mongosh\mongosh.exe"` |
| **Student's DB data corrupted / empty** | `mongosh mongodb://127.0.0.1:27017/CollegeDB 01-mongodb-shell/seed.js` |
| **CORS / Failed to Fetch error** | Verify they opened `http://127.0.0.1:3000` and NOT double-clicked `index.html` as `file:///` |
| **Duplicate USN crashes server** | Check that `try/catch` wraps `insertOne` and catches `error.code === 11000` |
| **Student fell 2 steps behind** | Tell them to copy `0X-step/snapshot/` into their folder and continue from there! |

---

## 🎓 Viva Voce Examiner Cheatsheet

During the last 45 minutes, walk around and ask each student 2–3 questions from [docs/viva-questions.md](docs/viva-questions.md).

### Quick Rating Rubric:
- **Outstanding (5/5):** Clearly explains 3-tier flow (Browser $\rightarrow$ fetch $\rightarrow$ Express $\rightarrow$ Mongo $\rightarrow$ JSON $\rightarrow$ DOM) and why `ObjectId` conversion is required.
- **Competent (3/5 - 4/5):** Understands difference between GET and POST, and can demonstrate records inside MongoDB Compass.
- **Needs Review (1/5 - 2/5):** Confuses in-memory arrays with MongoDB persistence; doesn't know why `node_modules` is gitignored.

### Top 5 Viva Questions to Ask:
1. *"What is the difference between SQL tables and MongoDB collections?"*
2. *"Why can't we query `{ _id: req.params.id }` as a plain string?"*
3. *"Why did we connect `MongoClient` once at startup rather than inside every route?"*
4. *"What HTTP status code is returned when a student is created? When a duplicate USN is submitted?"*
5. *"How do you prove that student records are permanently stored and not just kept in memory?"*

---

## 🏆 Wrap-up & Student Deliverables Checklist

Before dismissing the lab, ensure every student has:
- [ ] Staged and committed their completed work to their **local Git history**:
  ```powershell
  git add .
  git commit -m "feat: complete Day 4 Student Management System with MongoDB"
  ```
  *(Pushing to GitHub is optional homework or for students working on personal hotspots, avoiding lab network timeouts).*
- [ ] Demonstrated Feature 3 (Edit) and Feature 5 (Search) working in their browser.
- [ ] Demonstrated their documents inside MongoDB Compass or `mongosh`.
- [ ] Answered 1–2 viva questions satisfactorily.
