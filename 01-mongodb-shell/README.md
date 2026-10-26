# Step 01: MongoDB Shell & Basic CRUD (Module 2)

## Goal
Master the interactive MongoDB Shell (`mongosh`) to perform core database operations: selecting a database, creating a collection, inserting documents, querying with conditional operators (`$gte`), updating with `$set`, deleting records, and inspecting the data graphically using MongoDB Compass.

---

## Concepts
A MongoDB server holds multiple **databases**, each database contains **collections** (similar to SQL tables), and each collection stores **documents** formatted as BSON (binary JSON). Unlike traditional relational databases with rigid schemas, documents store data as flexible key-value pairs where each document is automatically assigned a unique `_id`. We communicate with MongoDB using interactive JavaScript commands in `mongosh` or through drivers in Node.js.

---

## Instructor Demo Steps

Follow each step live on the projector. Every command in this step is **JavaScript typed into a MongoDB shell**. You can use either shell, and the commands are identical:

| | **Option A: Compass shell (recommended)** | **Option B: PowerShell + `mongosh`** |
| :--- | :--- | :--- |
| **Needs** | Nothing extra. The shell is built into MongoDB Compass | The separate `mongosh` installer |
| **Open it** | Open Compass, connect to `mongodb://127.0.0.1:27017`, then click **`>_ MONGOSH`** at the bottom of the window | Open PowerShell and run `mongosh "mongodb://127.0.0.1:27017"` |
| **Connected?** | Yes, to the connection you opened | Yes, after the command above |

> ⚠️ **Type only the command itself into the shell.** A shell understands JavaScript such as `db.students.find()`. It does **not** understand PowerShell lines that start with `mongosh ...`, or a bare address like `mongodb://127.0.0.1:27017`. If you see `SyntaxError: Missing semicolon` or `SyntaxError: Unexpected token`, you pasted one of those. The address belongs in Compass's **New Connection** box (or after `mongosh` in PowerShell), not in the shell.

> 💡 The commands below use `use("CollegeDB")` and `db.getCollectionNames()`, which work in **both** shells. In PowerShell `mongosh` you may also type the shortcuts `use CollegeDB` and `show collections`.

### 0. Reset / Clean Database (Start from Scratch)
Before starting this module, ensure `CollegeDB` is completely clean so duplicate key errors (`E11000`) do not occur from previous runs. In your open shell, type:
```javascript
db.getSiblingDB('CollegeDB').dropDatabase()
```
*Output:* `{ ok: 1, dropped: 'CollegeDB' }`

*(Standalone `mongosh` users can instead run this one-liner from a normal PowerShell window, **not** inside a shell:* `mongosh --eval "db.getSiblingDB('CollegeDB').dropDatabase()"` *)*

### 1. Select the Database
Switch to `CollegeDB`. In MongoDB, if a database does not exist yet, MongoDB creates it as soon as data is inserted:
```javascript
use("CollegeDB")
```
*Output: `switched to db CollegeDB`*

### 2. Create the Collection
Explicitly create the `students` collection:
```javascript
db.createCollection("students")
```
*Output: `{ ok: 1 }`*

Confirm your collection exists:
```javascript
db.getCollectionNames()
```
*Output: `[ 'students' ]`*

### 3. Insert a Single Document (`insertOne`)
Insert Rahul's record:
```javascript
db.students.insertOne({
  name: "Rahul",
  usn: "1CS23CS001",
  semester: 3,
  branch: "CSE"
})
```
*Output:*
```javascript
{
  acknowledged: true,
  insertedId: ObjectId('661a...')
}
```

### 4. Insert Multiple Documents (`insertMany`)
Insert 4 more students at once:
```javascript
db.students.insertMany([
  { name: "Priya", usn: "1CS23CS002", semester: 3, branch: "CSE" },
  { name: "Amit", usn: "1CS23CS003", semester: 5, branch: "ISE" },
  { name: "Sneha", usn: "1CS23CS004", semester: 4, branch: "ECE" },
  { name: "Vikram", usn: "1CS23CS005", semester: 6, branch: "AIML" }
])
```
*Output:*
```javascript
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId('...'),
    '1': ObjectId('...'),
    '2': ObjectId('...'),
    '3': ObjectId('...')
  }
}
```

### 5. Query Documents (`find`)
- **View all students:**
  ```javascript
  db.students.find()
  ```
- **Filter by branch (CSE only):**
  ```javascript
  db.students.find({ branch: "CSE" })
  ```
- **Filter by semester using `$gte` (Greater Than or Equal to 4):**
  ```javascript
  db.students.find({ semester: { $gte: 4 } })
  ```

### 6. Update a Document (`updateOne` with `$set`)
Promote Rahul from semester 3 to semester 4:
```javascript
db.students.updateOne(
  { usn: "1CS23CS001" },
  { $set: { semester: 4 } }
)
```
*Output:*
```javascript
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
```

> **Why `$set`?** If you omit `$set` in older MongoDB versions or raw updates, the document would be completely replaced. `$set` modifies only the specified field while leaving the rest unchanged.

### 7. Delete a Document (`deleteOne`)
Remove Vikram from the collection:
```javascript
db.students.deleteOne({ usn: "1CS23CS005" })
```
*Output:*
```javascript
{ acknowledged: true, deletedCount: 1 }
```

### 8. Verify in MongoDB Compass (GUI)
1. Launch **MongoDB Compass** from the Windows Start Menu. (If you are already using the Compass shell, you are connected: skip to step 3 and click the refresh icon next to the connection.)
2. In the "New Connection" screen, enter URI: `mongodb://127.0.0.1:27017` and click **Connect**.
3. In the left database list, click **CollegeDB**.
4. Click the **students** collection.
5. See your 4 remaining student documents visually displayed as interactive cards/tables!

---

## Your Turn: Student Task

Now try it yourself!
1. In `mongosh`, add **3 of your own students** using `db.students.insertMany()`:
   - Provide realistic names, USNs (e.g., `1CS23CS006`, `1CS23CS007`, `1CS23CS008`), branches, and semesters (between 1 and 8).
2. Write a query to find only students in the `ISE` branch:
   ```javascript
   db.students.find({ branch: "ISE" })
   ```
3. Write a query using `$gte` to find all students in semester 5 or higher:
   ```javascript
   db.students.find({ semester: { $gte: 5 } })
   ```
4. Update one of your new students' semester using `updateOne` and `$set`.
5. Check your new students in MongoDB Compass by clicking the Refresh button (circular arrow).

> **Note:** Amit from the demo is in the `ISE` branch (semester 5), so he will also appear in your ISE and `$gte` results. That is expected.

---

## Restoring Sample Data
If your collection gets messy or you accidentally delete students, reset everything back to the clean 5 sample students at any time. Pick **one** option.

**Option A: Paste into the shell (works in the Compass shell and in `mongosh`).** Copy this whole line, paste it, and press Enter:
```javascript
use("CollegeDB"); db.students.drop(); db.createCollection("students"); db.students.createIndex({ usn: 1 }, { unique: true }); db.students.insertMany([{ name: "Rahul", usn: "1CS23CS001", semester: 3, branch: "CSE" }, { name: "Priya", usn: "1CS23CS002", semester: 3, branch: "CSE" }, { name: "Amit", usn: "1CS23CS003", semester: 5, branch: "ISE" }, { name: "Sneha", usn: "1CS23CS004", semester: 4, branch: "ECE" }, { name: "Vikram", usn: "1CS23CS005", semester: 6, branch: "AIML" }])
```

**Option B: Import the sample file in Compass (no typing).** Open `students` → **ADD DATA** → **Import JSON or CSV file** → choose `01-mongodb-shell/sample-students.json`. Delete the existing documents first if the collection is not empty.

**Option C: PowerShell script (needs standalone `mongosh`):**
```powershell
mongosh mongodb://127.0.0.1:27017/CollegeDB seed.js
```
*(Or inside `mongosh`: `load("seed.js")`. `load()` may not be available in the Compass shell, so use Option A there.)*

**Start completely fresh** (removes the whole `CollegeDB` database):
```javascript
db.getSiblingDB('CollegeDB').dropDatabase()
```

---

## Checkpoint Checklist
- [ ] Connected to `mongodb://127.0.0.1:27017` using `mongosh`.
- [ ] Switched to `CollegeDB`.
- [ ] Successfully inserted 1 document with `insertOne`.
- [ ] Successfully inserted multiple documents with `insertMany`.
- [ ] Queried documents with `{ branch: "CSE" }` and `{ semester: { $gte: 4 } }`.
- [ ] Updated a record with `updateOne` and `$set`.
- [ ] Deleted a record with `deleteOne`.
- [ ] Added your own 3 students and queried them.
- [ ] Verified the data inside MongoDB Compass.

---

## Expected Output
Checkpoints from a clean start (your `ObjectId` values will differ):
```text
CollegeDB> use("CollegeDB")
switched to db CollegeDB

CollegeDB> db.createCollection("students")
{ ok: 1 }

CollegeDB> db.students.insertOne({ name: "Rahul", usn: "1CS23CS001", semester: 3, branch: "CSE" })
{
  acknowledged: true,
  insertedId: ObjectId('662b1a8f9c2d1e001f3b4c51')
}

CollegeDB> db.students.countDocuments()   // after insertOne
1
CollegeDB> db.students.countDocuments()   // after insertMany (4 more)
5
CollegeDB> db.students.countDocuments()   // after deleting Vikram
4
CollegeDB> db.students.countDocuments()   // after adding your own 3 students
7
```

---

## Stuck?
- **Error: `connect ECONNREFUSED 127.0.0.1:27017`**:
  - The MongoDB background service is stopped. Open Command Prompt as Administrator and run `net start MongoDB`.
- **Error: `SyntaxError: Missing semicolon` (after pasting `mongosh --eval "..."`)**:
  - That line is a PowerShell command, not shell JavaScript. Paste only the part inside the quotes, for example `db.getSiblingDB('CollegeDB').dropDatabase()`.
- **Error: `SyntaxError: Unexpected token` (after pasting `mongodb://127.0.0.1:27017`)**:
  - That is a connection address, not a command. It goes in Compass's **New Connection** box, not in the shell.
- **Error: `E11000 duplicate key` when re-running the inserts**:
  - The students already exist. Reset with one of the options under **Restoring Sample Data**.
- **Error: `ReferenceError: db is not defined`**:
  - Make sure you are inside a MongoDB shell (the **`>_ MONGOSH`** panel in Compass, or the `mongosh` prompt) and not plain PowerShell.
- **Lost or corrupted student data?**:
  - Use one of the options under **Restoring Sample Data** to restore the original 5 documents.
