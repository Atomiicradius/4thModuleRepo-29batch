# Step 5: Finish the Student Management App

⏱ About 75 minutes · 🖥️ VS Code terminal · 🌐 Browser · 🍃 Compass shell

**You will:** switch on **Edit** and **live Search**, then prove your data survives a server restart.

**What already works:** adding students, showing them in a table, and deleting them. **What you switch on:** Edit (three small blocks, `TASK 1A`, `1B`, `1C`) and Search (`TASK 2`).

---

## Part 1: Run the app

**1. Stop any old server** (`Ctrl + C` in its terminal).

**2. Reset the data.** 🍃 Compass shell, paste this one line:

```javascript
use("CollegeDB"); db.students.drop(); db.createCollection("students"); db.students.createIndex({ usn: 1 }, { unique: true }); db.students.insertMany([{ name: "Rahul", usn: "1CS23CS001", semester: 3, branch: "CSE" }, { name: "Priya", usn: "1CS23CS002", semester: 3, branch: "CSE" }, { name: "Amit", usn: "1CS23CS003", semester: 5, branch: "ISE" }, { name: "Sneha", usn: "1CS23CS004", semester: 4, branch: "ECE" }, { name: "Vikram", usn: "1CS23CS005", semester: 6, branch: "AIML" }])
```

**3. Start the server.** 🖥️ From the top folder of the lab:

```powershell
cd 05-student-management-app/start
node server.js
```

✅ Three lines, ending with `Server running on port 3000`.

**4. Open the app.** 🌐 `http://127.0.0.1:3000/`

✅ You see the form, a **Search** box, and a table with **5 students**.

**5. See what is missing.** Click **Edit** next to Rahul: nothing happens. Type `ami` in the search box and wait a second: the table does not change. These are your two tasks.

---

## Task 1: Switch on Edit (3 blocks)

All the code is already in `public/script.js`, switched off with `//`. Switch on the three blocks:

| Block | Search for | What it does |
| :--- | :--- | :--- |
| **1A** | `TASK 1A` | Makes the **Edit** buttons do something |
| **1B** | `TASK 1B` | A function that fills the form with the student you clicked |
| **1C** | `TASK 1C` | When you press **Update**, send a `PUT` request instead of creating a new student |

**For each block** (open `05-student-management-app/start/public/script.js`):

1. Press `Ctrl + F` and search for the block's name, for example `TASK 1A`.
2. Select every line **between** `// ───── TASK 1A ─────` and `// ───── END TASK 1A ─────`: click the first commented line, hold `Shift`, click the last one.
3. Press `Ctrl + /` (Mac: `Cmd + /`).

When all three are done, **save** (`Ctrl + S`) and reload the page with **`Ctrl + F5`**. You do not need to restart the server.

**Test it.** 🌐

1. Click **Edit** next to **Rahul**.

   ✅ The heading says `Edit Student: Rahul`, the button says **Update Student**, a **Cancel Edit** button appears, the form is filled in, and his row turns yellow.

2. Change **Semester** to `4` and click **Update Student**.

   ✅ A banner says `Student Rahul updated successfully!` His row shows Semester 4, and the form goes back to "Add New Student".

3. Click **Edit** next to **Priya**, then click **Cancel Edit**.

   ✅ The form empties and goes back to Add mode. Nothing changed in the table.

---

## Task 2: Switch on live Search

**1.** Search for `TASK 2` in `script.js`. Select the lines between `// ───── TASK 2 ─────` and `// ───── END TASK 2 ─────`, press `Ctrl + /`, save, and reload with `Ctrl + F5`.

**2. Test it.** 🌐 Click in the search box and type `ami`.

✅ The table does **not** change while you type. About a third of a second after you **stop** typing, it shrinks to **1 row: Amit**. (This wait is called *debouncing*: it avoids asking the server after every single key.)

**3.** Click **Clear**.

✅ All **5 students** come back.

Try also: `1cs` shows everyone (every USN contains 1CS), and `xyz` shows an empty table.

---

## Task 3: Prove your data is really saved

**1.** Reload the page with `Ctrl + F5`.

✅ Rahul still shows **Semester 4**.

**2.** Stop the server: 🖥️ click in the terminal and press `Ctrl + C`. Start it again:

```powershell
node server.js
```

**3.** Reload the page. 🌐

✅ Rahul still shows **Semester 4**. The data lives in MongoDB, not in the server, so it survived the restart.

**4.** Look at it in the database. 🍃

```javascript
use("CollegeDB")
```

```javascript
db.students.findOne({ usn: "1CS23CS001" })
```

✅ You see Rahul with `semester: 4`.

**5.** Add a student and delete one, to check the other two buttons still work.

✅ Add: `Student ... added successfully!` Delete: a confirm box, then `Student ... deleted successfully.`

---

## Done when

- [ ] **Edit** fills the form, **Update Student** saves, and **Cancel Edit** works
- [ ] Typing in **Search** filters the table, and **Clear** restores it
- [ ] After stopping and restarting the server, your changes are still there
- [ ] The Console (`F12 → Console`) shows no red errors

---

## Stretch goals (if you finish early)

1. **Branch filter:** add a drop-down that shows only one branch (CSE, ISE, AIML...) without reloading.
2. **Sorting:** click the **Name** or **Semester** column heading to sort the table.
3. **Toast messages:** replace the banner with small pop-ups in the top-right corner that disappear by themselves.

Explanations of how Edit, Search and persistence work are in the [`hints`](hints) folder. Read them after you try, not before.

---

## Stuck?

| What you see | Why | Fix |
| :--- | :--- | :--- |
| Clicking **Edit** does nothing | `TASK 1A` or `TASK 1B` is not switched on, or the page was not reloaded | Switch both on, save, `Ctrl + F5` |
| Console says `startEditingStudent is not defined` | `TASK 1A` is on but `TASK 1B` is off | Switch on `TASK 1B` |
| **Update Student** shows the error `A student with USN ... already exists` | `TASK 1C` is off, so the page tries to **create** a copy | Switch on `TASK 1C`, save, `Ctrl + F5` |
| Search box does nothing | `TASK 2` is off | Switch it on, save, `Ctrl + F5` |
| You changed the file but the page looks the same | The browser kept the old script | `Ctrl + F5` |
| `SyntaxError` in the Console | A line lost its `//` only halfway | Select the whole block again and check every line |
| Page cannot connect | The server is not running | `node server.js` in `05-student-management-app/start` |
| `EADDRINUSE` | An old server is running | `Ctrl + C` in its terminal |
| Need the finished code | | See **Fell behind?** in the top README |
