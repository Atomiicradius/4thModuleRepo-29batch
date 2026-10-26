# Step 1: MongoDB commands in the shell

⏱ About 70 minutes · 🍃 You work in the **Compass shell** (no code files in this step)

**You will:** create a database, add students, search them, change one, and delete one, all by typing commands.

**Words to know**

| Word | Meaning | In our lab |
| :--- | :--- | :--- |
| Database | A container for your data | `CollegeDB` |
| Collection | A group of similar records (like a table) | `students` |
| Document | One record (like a row), written like JSON | one student |

---

## Before you start

1. Open **MongoDB Compass** and connect to `mongodb://127.0.0.1:27017`.
2. Click **`>_ MONGOSH`** at the bottom. This is the shell: every command in this step goes here.

> ⚠️ Paste **only the command itself**. Never paste a line starting with `mongosh` or `mongodb://`. That gives `SyntaxError`.

> Prefer PowerShell? Run `mongosh "mongodb://127.0.0.1:27017"` in a normal terminal. All commands below work the same way there.

---

## Part 1: Create the database and collection

**0. Start clean.** (This removes anything left from earlier practice.) 🍃

```javascript
db.getSiblingDB('CollegeDB').dropDatabase()
```

✅ You should see: `{ ok: 1, dropped: 'CollegeDB' }`

**1. Switch to our database.** 🍃

```javascript
use("CollegeDB")
```

✅ You should see: `switched to db CollegeDB`

**2. Create the students collection.** 🍃

```javascript
db.createCollection("students")
```

✅ You should see: `{ ok: 1 }`

**3. Check that it exists.** 🍃

```javascript
db.getCollectionNames()
```

✅ You should see: `[ 'students' ]`

---

## Part 2: Add students

**4. Add one student.** 🍃

```javascript
db.students.insertOne({ name: "Rahul", usn: "1CS23CS001", semester: 3, branch: "CSE" })
```

✅ You should see `acknowledged: true` and an `insertedId: ObjectId('...')`. The `_id` is a unique id MongoDB creates for every document. Yours will be different from your neighbour's.

**5. Add four more at once.** 🍃

```javascript
db.students.insertMany([{ name: "Priya", usn: "1CS23CS002", semester: 3, branch: "CSE" }, { name: "Amit", usn: "1CS23CS003", semester: 5, branch: "ISE" }, { name: "Sneha", usn: "1CS23CS004", semester: 4, branch: "ECE" }, { name: "Vikram", usn: "1CS23CS005", semester: 6, branch: "AIML" }])
```

✅ You should see `acknowledged: true` and four ids (`'0'` to `'3'`).

---

## Part 3: Find students

**6. Show everyone.** 🍃

```javascript
db.students.find()
```

✅ You should see all **5** students.

**7. Only the CSE students.** 🍃

```javascript
db.students.find({ branch: "CSE" })
```

✅ You should see **2**: Rahul and Priya.

**8. Semester 4 or higher.** (`$gte` means "greater than or equal to") 🍃

```javascript
db.students.find({ semester: { $gte: 4 } })
```

✅ You should see **3**: Amit, Sneha and Vikram.

---

## Part 4: Change and delete

**9. Move Rahul to semester 4.** (`$set` changes only the fields you name) 🍃

```javascript
db.students.updateOne({ usn: "1CS23CS001" }, { $set: { semester: 4 } })
```

✅ You should see `matchedCount: 1` and `modifiedCount: 1`.

Check it worked: 🍃

```javascript
db.students.find({ usn: "1CS23CS001" })
```

✅ Rahul now shows `semester: 4`.

**10. Delete Vikram.** 🍃

```javascript
db.students.deleteOne({ usn: "1CS23CS005" })
```

✅ You should see `{ acknowledged: true, deletedCount: 1 }`

Count what is left: 🍃

```javascript
db.students.countDocuments()
```

✅ You should see: `4`

---

## Part 5: See it in Compass

In Compass, click the **refresh** icon next to your connection. In the left list open **CollegeDB → students**. You see the same 4 students as cards you can click. The shell and the window show the same data.

---

## Your turn

**1. Add 3 students of your own.** Change the names and branches if you like, but every `usn` must be different. 🍃

```javascript
db.students.insertMany([{ name: "Ananya", usn: "1CS23CS006", semester: 5, branch: "ISE" }, { name: "Karthik", usn: "1CS23CS007", semester: 6, branch: "ISE" }, { name: "Meera", usn: "1CS23CS008", semester: 2, branch: "AIML" }])
```

**2. Find the ISE students.** 🍃

```javascript
db.students.find({ branch: "ISE" })
```

✅ You should see **Amit** (from the demo) **plus your ISE students**. If you kept the example, that is Amit, Ananya and Karthik.

**3. Find semester 5 and above.** 🍃

```javascript
db.students.find({ semester: { $gte: 5 } })
```

✅ With the example students: Amit, Ananya and Karthik.

**4. Change one of your students' semester.** 🍃

```javascript
db.students.updateOne({ usn: "1CS23CS006" }, { $set: { semester: 6 } })
```

✅ `modifiedCount: 1`

**5. Count everyone.** 🍃

```javascript
db.students.countDocuments()
```

✅ You should see: `7`

---

## Done when

- [ ] You ran the commands in the 🍃 Compass shell and each one gave the ✅ result
- [ ] `db.students.countDocuments()` shows `7`
- [ ] You can see your students in Compass

---

## Reset to the 5 sample students

If you deleted the wrong thing or got errors, paste this one line (🍃 Compass shell). It rebuilds the collection with the 5 sample students:

```javascript
use("CollegeDB"); db.students.drop(); db.createCollection("students"); db.students.createIndex({ usn: 1 }, { unique: true }); db.students.insertMany([{ name: "Rahul", usn: "1CS23CS001", semester: 3, branch: "CSE" }, { name: "Priya", usn: "1CS23CS002", semester: 3, branch: "CSE" }, { name: "Amit", usn: "1CS23CS003", semester: 5, branch: "ISE" }, { name: "Sneha", usn: "1CS23CS004", semester: 4, branch: "ECE" }, { name: "Vikram", usn: "1CS23CS005", semester: 6, branch: "AIML" }])
```

Other ways: 🖥️ `npm run seed` from the top folder of the lab, or in Compass open **students → ADD DATA → Import JSON or CSV file** and choose `01-mongodb-shell/sample-students.json` (empty the collection first).

---

## Stuck?

| What you see | Why | Fix |
| :--- | :--- | :--- |
| `SyntaxError: Missing semicolon` | You pasted a line that starts with `mongosh ...` | Paste only the part inside the quotes |
| `SyntaxError: Unexpected token` after pasting `mongodb://...` | That is an address, not a command | The address goes in Compass's connection box |
| `E11000 duplicate key error` | That USN already exists | Use a new `usn`, or reset (see above) |
| `ReferenceError: db is not defined` | You are not in a MongoDB shell (for example plain PowerShell) | Open the **`>_ MONGOSH`** bar in Compass |
| Compass says `ECONNREFUSED` | The database service is stopped | Open **PowerShell as Administrator** and run `net start MongoDB` |
| Counts do not match | An earlier run left data behind | Run command 0, then start again |
