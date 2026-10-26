# Step 3: Build the student API (5 routes)

⏱ About 70 minutes · 🖥️ VS Code terminal · 📮 Postman · 🍃 Compass shell

**You will:** switch on five routes (create, read all, read one, update, delete), test each one in Postman, then add search yourself.

**Two ideas to remember**

- **CRUD** = **C**reate (POST), **R**ead (GET), **U**pdate (PUT), **D**elete (DELETE).
- **The #1 MongoDB bug:** an id in a web address is plain *text*, but MongoDB stores ids as special `ObjectId` values. The code turns text into an `ObjectId` with `new ObjectId(id)`. If the text is not a valid id, the server answers **400** instead of crashing.

---

## Part 1: Get ready

**1. Reset the data to the 5 sample students.** 🍃 Compass shell, paste this one line:

```javascript
use("CollegeDB"); db.students.drop(); db.createCollection("students"); db.students.createIndex({ usn: 1 }, { unique: true }); db.students.insertMany([{ name: "Rahul", usn: "1CS23CS001", semester: 3, branch: "CSE" }, { name: "Priya", usn: "1CS23CS002", semester: 3, branch: "CSE" }, { name: "Amit", usn: "1CS23CS003", semester: 5, branch: "ISE" }, { name: "Sneha", usn: "1CS23CS004", semester: 4, branch: "ECE" }, { name: "Vikram", usn: "1CS23CS005", semester: 6, branch: "AIML" }])
```

**2. Stop any old server.** If a server from an earlier step is still running, click in its terminal and press `Ctrl + C`.

**3. Go to the Step 3 folder.** 🖥️ From the top folder of the lab:

```powershell
cd 03-crud-api/start
```

> It must be the **`start`** folder. Your prompt should end with `03-crud-api\start`.

**4. Start the server.** 🖥️

```powershell
node server.js
```

✅ You should see three lines:

```
Connected to MongoDB
Index verified: unique 'usn'
Server running on port 3000
```

(The middle line means MongoDB now refuses two students with the same USN.)

**5. Set up Postman.** 📮 **File → Import**, then choose `postman/Day4-Student-Management.postman_collection.json` from the lab folder. You get a collection called *Day 4: Student Management API* with 14 ready-made requests. It already knows the server address.

**6. Test the server.** 📮 Open **0. Health Check** and click **Send**.

✅ You should see `200 OK` and `{"status":"ok","message":"CollegeDB Student API is running"}`. No student routes exist yet. That is next.

---

## Part 2: Switch on the routes, one at a time

**The same 4 moves for every route:**

1. In `server.js`, find the route's heading (`ROUTE 1`, `ROUTE 2`, ...). Use `Ctrl + F`.
2. Select the commented lines under it: click on the first line (`// app.post(...`), hold `Shift`, click on the last line (`// });`).
3. Press `Ctrl + /` (Mac: `Cmd + /`) to remove the `//`.
4. Save (`Ctrl + S`), then restart: click in the terminal, press `Ctrl + C`, run `node server.js`.

> 📮 **Postman rule:** send **"1. Create Student" only once**. Sending it again gives `409`, and then the ids for the later requests are lost. If that happens, 🍃 run `db.students.deleteOne({ usn: "1CS23CS010" })` and send Create once more.

### Route 1: Create a student (POST)

Switch on **ROUTE 1**. Then 📮 send **"1. Create Student"**.

✅ `201 Created` and a new student with an `_id`:

```json
{"_id":"6adfc2dcd4f66901e6922a83","name":"Kavya","usn":"1CS23CS010","semester":3,"branch":"CSE"}
```

Try to break it:

- Send **"2. Error Cases & Validation → Duplicate USN"** → ✅ `409 Conflict`: `A student with USN '1CS23CS002' already exists`
- Send **"Missing Required Fields"** → ✅ `400 Bad Request`
- Send **"Invalid Semester"** → ✅ `400`: `Semester must be an integer between 1 and 8`

### Route 2: Read all students (GET)

Switch on **ROUTE 2**. 📮 Send **"2. Get All Students"**.

✅ `200 OK` and a list of **6 students** (the 5 sample ones plus Kavya).

### Route 3: Read one student (GET by id)

Switch on **ROUTE 3**. 📮 Send **"4. Get Student by ID"**. (It uses the id saved by Create.)

✅ `200 OK` and Kavya's document.

Try to break it:

- **"Invalid ObjectId Format"** → ✅ `400`: `Invalid student ID format`
- **"Non-Existent ID"** → ✅ `404`: `Student not found`

### Route 4: Update a student (PUT)

Switch on **ROUTE 4**. 📮 Send **"5. Update Student"**.

✅ `200 OK`. Kavya now has `semester: 4` and `branch: "ISE"`.

### Route 5: Delete a student (DELETE)

Switch on **ROUTE 5**. (Its heading has a double `// //`. Select only the code lines, from `// app.delete(` to the last `// });`.) 📮 Send **"6. Delete Student"**.

✅ `200 OK`: `{"message":"Student deleted successfully","deletedId":"..."}`

Send it a second time → ✅ `404`: `Student not found`.

Now try the rest of the **Error Cases & Validation** folder. ✅ Expected: Invalid ObjectId `400` · Non-Existent ID (GET, PUT, DELETE) `404`.

---

## Your turn: add search

Right now `GET /students` returns everyone, even if you ask for `?search=priya`. Let's fix that.

**1.** 🌐 Open this address. You currently get **all 5 students**, which is wrong:

```
http://127.0.0.1:3000/students?search=priya
```

**2.** In `server.js`, inside **ROUTE 2**, find this line (`Ctrl + F` and search `find({})`):

```javascript
    const students = await studentsCollection.find({}).toArray();
```

**3.** **Replace that one line** with all of this:

```javascript
    const { search } = req.query;
    let filter = {};
    if (search && search.trim() !== '') {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter = { $or: [{ name: { $regex: regex } }, { usn: { $regex: regex } }] };
    }
    const students = await studentsCollection.find(filter).toArray();
```

What it does, in plain words:

- Reads the word after `?search=`.
- Builds a filter: the **name OR the usn** must contain that word (`$or`), ignoring capital letters (`'i'`).
- `escapeRegex` makes symbols like `.` count as ordinary characters.
- Gives the filter to `find`, so only matching students come back.

**4.** Save, restart the server (`Ctrl + C`, `node server.js`), and test in 🌐 the browser:

| Address | ✅ You should see |
| :--- | :--- |
| `http://127.0.0.1:3000/students?search=priya` | Only Priya |
| `http://127.0.0.1:3000/students?search=1cs` | Every student (all USNs contain `1CS`) |
| `http://127.0.0.1:3000/students?search=.` | `[]` (the dot is just a dot, so nothing matches) |

---

## Final checks

**1. Let Postman test everything.** 📮 Hover over the collection, click **⋯ → Run collection → Run**. ✅ All tests are green, none failed. (Reset the data first with the line in Part 1, step 1.)

**2. Run the automatic test.** 🖥️ Open a **second terminal**, go to the **top folder** of the lab, and run:

```powershell
node tests/api.test.js
```

✅ You should see: `API Suite Summary: 15 Passed, 0 Failed.`

(If search is missing, one test fails: `search=<no match> -> empty array`.)

**3. Check the unique-USN rule in the database.** 🍃

```javascript
db.students.getIndexes()
```

✅ One of the entries is `usn_1` with `unique: true`.

---

## Done when

- [ ] All five routes are switched on and each gave the ✅ status in Postman
- [ ] You added search and `?search=priya` returns only Priya
- [ ] `node tests/api.test.js` shows `15 Passed, 0 Failed`

---

## Stuck?

| What you see | Why | Fix |
| :--- | :--- | :--- |
| `Cannot POST /students` (or another `Cannot ...`) | That route is still commented out, **or** an old server answered | Switch the route on, save, restart. Check the terminal shows the 3 lines |
| `Cannot find module '...\\03-crud-api\\server.js'` | You are one folder too high | `cd start` |
| `SyntaxError` when the server starts | A line of the route was missed when you uncommented it | Select the whole block again and check every line lost its `//` |
| Get by ID gives `400 Invalid student ID format` | The saved `studentId` is empty or `null` | In Compass: `db.students.deleteOne({ usn: "1CS23CS010" })`, then send **Create** once, then try again |
| Create gives `409` | Kavya already exists | Same fix as above |
| Search returns everyone | The search code is missing | Do "Your turn" step 3, save, **restart** |
| `EADDRINUSE` | An old server is still running | `Ctrl + C` in its terminal |
| Duplicate USN request does not give `409` | Priya is missing from the database | Reset the data (Part 1, step 1) |
| Need the finished file | | See **Fell behind?** in the top README |
