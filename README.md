# Day 4 Lab: Build a Student Management App with MongoDB

You will build a complete web app: a page in the browser, a server in Node.js, and a MongoDB database that **keeps your data**. By the end you can add, edit, search and delete students, and the data is still there after you restart everything.

```
 Browser (HTML + JavaScript)  →  Express server (Node.js)  →  MongoDB database
```

---

## How to read the instructions

Every command says **where** to type it. Use the icons:

| Icon | Where | Examples |
| :--- | :--- | :--- |
| 🖥️ | **VS Code terminal** (press `` Ctrl + ` `` or **Terminal → New Terminal**) | `cd 03-crud-api/start`, `node server.js` |
| 🍃 | **Compass shell**: in MongoDB Compass, click **`>_ MONGOSH`** at the bottom | `use("CollegeDB")`, `db.students.find()` |
| 📮 | **Postman** | Send "1. Create Student" |
| 🌐 | **Browser** | `http://127.0.0.1:3000/` |

> ⚠️ **Never paste a line that starts with `mongosh` or `mongodb://` into the Compass shell.** The shell only understands database commands like `db.students.find()`. If you see `SyntaxError: Missing semicolon` or `SyntaxError: Unexpected token`, that is what happened.

Copy each command exactly. Each step shows **✅ You should see** so you can check yourself.

---

## The five steps

| Step | Folder | You will | Time |
| :--- | :--- | :--- | :---: |
| 1 | [`01-mongodb-shell`](01-mongodb-shell/README.md) | Type MongoDB commands: insert, find, update, delete | 70 min |
| 2 | [`02-connect-backend`](02-connect-backend/README.md) | Connect a Node.js server to MongoDB | 20 min |
| 3 | [`03-crud-api`](03-crud-api/README.md) | Switch on 5 API routes and test them in Postman | 70 min |
| 4 | [`04-frontend-fetch`](04-frontend-fetch/README.md) | Make the web page talk to your server | 30 min |
| 5 | [`05-student-management-app`](05-student-management-app/README.md) | Finish the app: Edit and live Search | 75 min |

In every step you work inside the **`start`** folder. The **`snapshot`** folder holds the finished code for that step, to use only if you fall behind (see "Fell behind?" below).

---

## One-time setup (do this first)

**1. Software you need.** Your instructor gives you the installers (USB drive):

- Node.js (version 22 or 24)
- MongoDB Community Server, installed **as a service**
- MongoDB Compass (it contains the shell we use)
- Postman
- VS Code and Git

**2. Open the project in VS Code.** Unzip the lab folder, then in VS Code choose **File → Open Folder** and pick it.

**3. Install the packages, once.** 🖥️ In the VS Code terminal:

```powershell
npm install --omit=dev
```

> If your instructor gave you a ready-made `node_modules` folder, copy it into the lab folder and skip this command. One install at the top folder covers **every** step.

**4. Check your computer.** 🖥️

```powershell
node 00-setup-check/check-setup.js
```

✅ You should see `[ PASS ]` for Node, npm, Postman and MongoDB Server (port 27017). A line saying **mongosh is optional** is fine. Details: [`00-setup-check`](00-setup-check/README.md).

**5. Connect Compass.** Open **MongoDB Compass**, paste `mongodb://127.0.0.1:27017` into the connection box, and click **Connect**. Then click **`>_ MONGOSH`** at the bottom to open the shell.

---

## Four rules that fix most problems

1. **After you change `server.js`, restart the server:** click in the terminal, press `Ctrl + C`, then run `node server.js` again.
2. **Only one server at a time.** Stop the old one (`Ctrl + C`) before starting the next step's server, or you get `EADDRINUSE`.
3. **After you change a file in `public/`** (the web page), you do not restart the server. Just reload the page with `Ctrl + F5`.
4. **Run commands from the right folder.** Each step starts with a `cd` command. Your terminal prompt must end with that folder.

---

## Reset to clean sample data

Use this any time your students collection gets messy. It restores the 5 sample students (Rahul, Priya, Amit, Sneha, Vikram).

🍃 **Compass shell**, paste this one line:

```javascript
use("CollegeDB"); db.students.drop(); db.createCollection("students"); db.students.createIndex({ usn: 1 }, { unique: true }); db.students.insertMany([{ name: "Rahul", usn: "1CS23CS001", semester: 3, branch: "CSE" }, { name: "Priya", usn: "1CS23CS002", semester: 3, branch: "CSE" }, { name: "Amit", usn: "1CS23CS003", semester: 5, branch: "ISE" }, { name: "Sneha", usn: "1CS23CS004", semester: 4, branch: "ECE" }, { name: "Vikram", usn: "1CS23CS005", semester: 6, branch: "AIML" }])
```

Or 🖥️ from the **top folder** of the lab (not from inside a step folder):

```powershell
npm run seed
```

✅ You should see `Seeded CollegeDB.students with 5 students.`

To wipe the whole database instead, 🍃 run: `db.getSiblingDB('CollegeDB').dropDatabase()`

---

## Stop a server that is still running

Normally `Ctrl + C` in its terminal is enough. If you lost the terminal, or you get `EADDRINUSE`:

| Computer | 🖥️ Command |
| :--- | :--- |
| Windows (PowerShell) | `Get-Process -Name node \| Stop-Process -Force` |
| Mac | `pkill node` |

---

## Fell behind? Copy the finished code

Run this from the step's **`start`** folder. It **replaces your files** with the finished version for that step.

| Steps | Windows (PowerShell) | Mac |
| :--- | :--- | :--- |
| 02, 03 | `Copy-Item ../snapshot/server.js . -Force` | `cp ../snapshot/server.js .` |
| 04, 05 | `Copy-Item ../snapshot/* . -Recurse -Force` | `cp -R ../snapshot/* .` |

---

## API reference (what your server offers)

Base address: `http://127.0.0.1:3000`

| Method | Path | Body | Success | Errors |
| :--- | :--- | :--- | :---: | :---: |
| GET | `/` | none | 200 | |
| POST | `/students` | `{ name, usn, semester, branch }` | 201 | 400, 409 |
| GET | `/students` | none | 200 | |
| GET | `/students?search=priya` | none | 200 | |
| GET | `/students/:id` | none | 200 | 400, 404 |
| PUT | `/students/:id` | any of the four fields | 200 | 400, 404, 409 |
| DELETE | `/students/:id` | none | 200 | 400, 404 |

Status codes: **200** OK · **201** Created · **400** bad data or bad id · **404** not found · **409** USN already exists.

---

## Save your work (end of the day)

🖥️ From the top folder of the lab:

```powershell
git add .
git commit -m "Day 4 done"
```

If Git asks who you are, run these two commands once (use your own name and email), then commit again:

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Pushing to GitHub is optional and can be done later when you have internet.

---

## Folder map

```
00-setup-check/              check that your computer is ready
01-mongodb-shell/            Step 1   (start/ and snapshot/ inside every step)
02-connect-backend/          Step 2
03-crud-api/                 Step 3
04-frontend-fetch/           Step 4
05-student-management-app/   Step 5   (+ hints/ for each feature)
postman/                     Postman collection used in Step 3
docs/                        troubleshooting, architecture, 20 viva questions
reference/  tests/           finished app and automatic checks (for instructors)
```

---

## For instructors: quick checks

| Check | Command (top folder) | ✅ Expected |
| :--- | :--- | :--- |
| Finished app passes the API tests | `node tests/api.test.js` | `API Suite Summary: 15 Passed, 0 Failed.` |
| Postman collection | Reset data, start any step-03+ server, then run the collection in Postman (or `npx newman run postman/Day4-Student-Management.postman_collection.json`) | 14 requests, 0 failed tests |
| Student starters | Switch each task on as described in the step README, then run the same checks | same as above |

The API test needs a server on port 3000 (it starts the `reference` server by itself if the port is free). Reset the data before running the Postman collection: its "Duplicate USN" request needs Priya to exist.
