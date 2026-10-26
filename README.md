# Day 4: Database Integration & Full-Stack Application
### Full Stack Development Skill Lab — RV College of Engineering (Dept. of CSE)

Welcome to **Day 4** of the Full Stack Development Skill Lab! Today, you will transition from working with temporary in-memory data to building a production-ready, database-backed web application connecting a **Vanilla JavaScript frontend**, an **Express.js REST API**, and a persistent **MongoDB Community Server**.

---

## What You Will Build

You will build the **RVCE Student Management System** — a complete full-stack web application that performs full CRUD (Create, Read, Update, Delete) operations with real-time debounced search, duplicate entry prevention, input validation, and permanent database storage:

- **Frontend:** Pure HTML5, responsive CSS3, and vanilla JavaScript using the browser's native `fetch()` API.
- **Backend:** Node.js (CommonJS) and Express.js REST API running on port `3000`.
- **Database:** Local MongoDB Community Server running on `127.0.0.1:27017`, database `CollegeDB`, collection `students`.

```json
// Target Student Document Schema in MongoDB:
{
  "_id": ObjectId("662b1a8f9c2d1e001f3b4c51"),
  "name": "Rahul",
  "usn": "1CS23CS001",
  "semester": 3,
  "branch": "CSE"
}
```

---

## Learning Outcomes

By the end of this lab, you will be able to:
1. Operate the interactive **MongoDB Shell (`mongosh`)** and graphical **MongoDB Compass** to perform administrative and CRUD tasks.
2. Establish a persistent connection pool from an Express backend to MongoDB using the official `mongodb` native driver.
3. Design and implement a RESTful API following HTTP status conventions (`200`, `201`, `400`, `404`, `409`, `500`).
4. Prevent the #1 MongoDB bug: correctly converting string IDs into binary BSON `ObjectId`s.
5. Create unique database indexes to enforce business rules (preventing duplicate USNs).
6. Connect browser DOM events to backend APIs via asynchronous `fetch()` with `async/await`.
7. Sanitize dynamic user content to eliminate Cross-Site Scripting (XSS) risks.
8. Verify and prove full-stack data durability across browser and server restarts.

---

## Prerequisites & 2-Minute Setup Checklist

Before starting Module 2, ensure your Windows lab computer has the required software:

1. **Node.js (v22+ or v24+ LTS)**: Run `node -v` in terminal (Node 20 reached EOL in April 2026; Node 22 or 24 is required).
2. **MongoDB Community Server**: Local service running on port `27017` (`127.0.0.1`).
3. **MongoDB Shell (`mongosh`)**: Run `mongosh --version` (v2.x).
4. **Postman Desktop**: Installed for API endpoint verification.
5. **Web Browser**: Chrome, Edge, or Firefox.

### Fresh Database Reset:
To ensure previous runs or dry-run experiments don't cause duplicate key errors (`E11000`), reset `CollegeDB` cleanly:
```powershell
mongosh --eval "db.getSiblingDB('CollegeDB').dropDatabase()"
```

### Automated Setup Check:
Run the built-in diagnostic script inside `00-setup-check`:
```powershell
cd 00-setup-check
node check-setup.js
```
*If all 5 checks show `[ PASS ]`, you are ready to begin!*

---

## How to Follow Along During Lab

1. **Clone this repository** (or copy & extract the zip from the instructor's USB drive):
   ```powershell
   git clone https://github.com/Sxmxrth05/4thDayRepo.git day4-student-management
   cd day4-student-management
   ```

2. **One Install at Root (Skip Per-Step Installs):**
   > 💡 **Important Lab Optimization:** Node.js resolves `node_modules` up the directory tree. A single install at the repository root serves **every single step folder** (`02`, `03`, `04`, `05`, and `reference`).
   > - If connected to internet, run once at the root:
   >   ```powershell
   >   npm install --omit=dev
   >   ```
   > - In offline labs: If your instructor provided `node_modules` on a USB drive, extract it into this root directory. **You do not need to run `npm install` inside each step folder!**

3. **Open in VS Code**:
   ```powershell
   code .
   ```

4. **Work Step-by-Step**:
   - Each module corresponds to a numbered folder (e.g., `01-mongodb-shell`, `02-connect-backend`, etc.).
   - Read each folder's `README.md` as your personal lab workbook.
   - The instructor demonstrates live on the projector. Follow along in your `start/` folder.
   - Complete the **"Your turn"** hands-on task in each step.

5. **Fell Behind? Don't Panic!**:
   - Every step includes a `snapshot/` folder containing the **complete, working code** at the end of that step.
   - If you get stuck, compare your code with the snapshot or copy the snapshot files over to your workspace to catch up immediately.
   - **Continuous Progression**: Step $N$'s `start/` is identical to Step $N-1$'s `snapshot/`.
   - **Try Hints First:** The `snapshot/` and `reference/` folders are safety nets. For the best learning experience, try solving tasks using the `hints/` guide before looking at solutions!

---

## Step Index & Schedule

| Step / Module | Topic | Description | Suggested Time |
| :--- | :--- | :--- | :---: |
| **Module 1** | **Database Concepts & Architecture** | SQL vs NoSQL, document model, 3-tier architecture *(instructor slides)* | 40 min |
| **00-setup-check** | **Environment Verification** | Run `check-setup.js` to verify Node, Mongo service, mongosh, Postman | 15 min |
| **01-mongodb-shell** | **Module 2: MongoDB Shell** | `use CollegeDB`, `createCollection`, `insertOne`, `insertMany`, `find`, `$gte`, `$set`, `deleteOne`, Compass GUI | 75 min |
| **02-connect-backend** | **Module 3a: Connect Backend** | `npm init`, `MongoClient`, connection pooling, startup connection, `GET /` health route | 25 min |
| **03-crud-api** | **Module 3b: Five CRUD Routes** | Build & test in Postman: POST, GET, GET by ID, PUT, DELETE, ObjectId conversion, unique index, `?search=` | 60 min |
| **04-frontend-fetch** | **Module 4: Frontend Integration** | `express.static()`, browser `fetch()`, click -> fetch -> Express -> Mongo -> re-render lifecycle, Delete button | 30 min |
| **05-student-management-app** | **Capstone: Guided Hands-on App** | Checklist of 6 features (Add, View, Edit, Delete, Search, Persistence) with guided hints | 90 min |
| **Wrap-up** | **Git Version Control & Lab Viva** | Commit changes, push to personal GitHub, review 20 viva questions | 60 min |

---

## API Reference Table

All endpoints run on base URL: `http://127.0.0.1:3000`

| HTTP Method | Endpoint | Request Body | Success Status | Error Statuses | Description |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `GET` | `/` | None | `200 OK` | `500` | Server health check & status |
| `POST` | `/students` | `{ name, usn, semester, branch }` | `201 Created` | `400`, `409`, `500` | Create new student (unique USN) |
| `GET` | `/students` | None | `200 OK` | `500` | Retrieve all enrolled students |
| `GET` | `/students?search=...`| None | `200 OK` | `500` | Live search by name or USN |
| `GET` | `/students/:id` | None | `200 OK` | `400`, `404`, `500`| Retrieve single student by `_id` |
| `PUT` | `/students/:id` | `{ name?, usn?, semester?, branch? }` | `200 OK` | `400`, `404`, `409`| Update student details with `$set` |
| `DELETE`| `/students/:id` | None | `200 OK` | `400`, `404`, `500`| Remove student by `_id` |

### Standard Error Response Format
```json
{
  "error": "Descriptive message explaining what went wrong"
}
```

---

## Common Errors & Quick Fixes

| Error | Root Cause | Fix |
| :--- | :--- | :--- |
| `'mongosh' is not recognized` | MongoDB shell executable not in Windows PATH | Run `winget install MongoDB.Shell` or add `%LOCALAPPDATA%\Programs\mongosh` to User PATH. |
| `connect ECONNREFUSED 127.0.0.1:27017` | MongoDB background Windows Service is not running | Open Command Prompt as Administrator and run `net start MongoDB`. |
| `EADDRINUSE :::3000` | Port 3000 is still held by an earlier Node process | In PowerShell, run `Get-Process node \| Stop-Process -Force`. |
| Query returns `null` for an existing ID | Queried with a string instead of BSON `ObjectId` | Import `{ ObjectId }` from `'mongodb'` and query with `{ _id: new ObjectId(id) }`. |
| `BSONError: Argument passed in must be a single String...` | Passed an invalid string to `new ObjectId()` | Always check `if (!ObjectId.isValid(id))` before instantiating `new ObjectId(id)`. |
| `req.body` is `undefined` | Express JSON middleware was omitted | Add `app.use(express.json());` at the top of your `server.js`. |
| Response returns `Promise { <pending> }` | Missing `await` keyword before async MongoDB call | Add `await` before asynchronous operations (e.g. `await collection.find().toArray()`). |
| CORS or Network Error in browser | Page opened via `file:///` instead of Express server | Always open `http://127.0.0.1:3000` in your browser. |

*For detailed explanations, check out [docs/troubleshooting.md](docs/troubleshooting.md).*

---

## Repository Structure

```text
day4-student-management/
├── README.md                      # Overview, schedule, API reference & error fixes
├── .gitignore                     # Excludes node_modules and logs
├── 00-setup-check/                # Automated verification script (check-setup.js)
├── 01-mongodb-shell/              # Module 2: mongosh exercises & seed scripts
│   ├── README.md
│   ├── seed.js                    # Restores clean 5-student sample data
│   ├── seed.mongodb.js            # VS Code playground seed script
│   ├── start/                     # Exercise practice skeleton
│   └── snapshot/                  # Complete working mongosh query solution
├── 02-connect-backend/            # Module 3a: Express to MongoDB connection
│   ├── README.md
│   ├── start/                     # Skeleton for instructor live demo
│   └── snapshot/                  # Working MongoClient connection & health route
├── 03-crud-api/                   # Module 3b: Five REST CRUD routes + Postman
│   ├── README.md
│   ├── start/                     # (= Step 02 snapshot)
│   └── snapshot/                  # Full CRUD routes with ObjectId validation & unique USN index
├── 04-frontend-fetch/             # Module 4: Vanilla frontend fetch integration
│   ├── README.md
│   ├── start/                     # (= Step 03 snapshot + starter frontend)
│   └── snapshot/                  # Working frontend with GET, POST, and DELETE
├── 05-student-management-app/     # Capstone hands-on project
│   ├── README.md                  # Checklist of 6 features + stretch goals
│   ├── hints/                     # Step-by-step guidance for features 1 to 6
│   ├── start/                     # (= Step 04 snapshot)
│   └── snapshot/                  # Completed 6-feature application
├── reference/                     # Finished production reference app with stretch goals
│   ├── package.json
│   ├── server.js
│   └── public/ (index.html, style.css, script.js)
├── postman/                       # Automated Postman test collection
│   └── Day4-Student-Management.postman_collection.json
└── docs/                          # Lab documentation & exam prep
    ├── architecture.md            # 3-tier system architecture & data flow diagrams
    ├── troubleshooting.md         # In-depth debugging workflows
    └── viva-questions.md          # 20 official viva questions with model answers
```

---

## Lab Wrap-Up: Local Git Commit (Pushing is Homework/Optional)

At the end of the lab session, save your work by making a **local Git commit**. Because college lab networks often restrict outbound Git SSH/HTTPS connections or experience intermittent connectivity, committing locally ensures your progress is safely recorded on your lab computer without depending on an active internet connection.

1. **Check Git Status**:
   ```powershell
   git status
   ```
2. **Stage your files**:
   ```powershell
   git add .
   ```
3. **Commit your work locally**:
   ```powershell
   git commit -m "feat: complete Day 4 Student Management System with MongoDB"
   ```
   *Your work is now securely saved in your local Git history!*

---

### Optional / Homework: Pushing to Your GitHub Profile
When you are on your personal Wi-Fi or hotspot (or for post-lab homework submission):
```powershell
# Create an empty repository named 'day4-student-management' on github.com, then:
git remote add origin https://github.com/<your-username>/day4-student-management.git
git branch -M main
git push -u origin main
```

---

## Additional Documentation & Viva Preparation
- **Architecture & System Design:** [docs/architecture.md](docs/architecture.md)
- **Troubleshooting Guide:** [docs/troubleshooting.md](docs/troubleshooting.md)
- **20 Official Viva Questions & Model Answers:** [docs/viva-questions.md](docs/viva-questions.md)
