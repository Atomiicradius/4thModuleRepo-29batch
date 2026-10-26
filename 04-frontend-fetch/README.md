# Step 4: Connect the web page to your server

⏱ About 30 minutes · 🖥️ VS Code terminal · 🌐 Browser · 🍃 Compass shell

**You will:** open a real web page that shows your students, add one from the page, and switch on the Delete button.

**How a click becomes data:**

```
You click a button → the page's JavaScript calls fetch() → Express receives the request
→ MongoDB does the work → Express replies → the page redraws the table
```

The server already has all 5 routes and also serves the page itself (`express.static`), so there is nothing to change on the server in this step.

---

## Part 1: Run it

**1. Stop any old server** (`Ctrl + C` in its terminal).

**2. Reset the data.** 🍃 Compass shell, paste this one line:

```javascript
use("CollegeDB"); db.students.drop(); db.createCollection("students"); db.students.createIndex({ usn: 1 }, { unique: true }); db.students.insertMany([{ name: "Rahul", usn: "1CS23CS001", semester: 3, branch: "CSE" }, { name: "Priya", usn: "1CS23CS002", semester: 3, branch: "CSE" }, { name: "Amit", usn: "1CS23CS003", semester: 5, branch: "ISE" }, { name: "Sneha", usn: "1CS23CS004", semester: 4, branch: "ECE" }, { name: "Vikram", usn: "1CS23CS005", semester: 6, branch: "AIML" }])
```

**3. Start the server.** 🖥️ From the top folder of the lab:

```powershell
cd 04-frontend-fetch/start
node server.js
```

✅ You should see three lines ending with `Server running on port 3000`.

**4. Open the web page.** 🌐

```
http://127.0.0.1:3000/
```

> Use this address. Do **not** double-click `index.html`: a page opened as a file cannot talk to the server.

✅ You should see **RVCE Student Management System**, a form, and a table with **5 students** (the number badge says 5).

---

## Part 2: Add a student from the page

1. Fill the form: Name `Kavya`, USN `1CS23CS010`, Semester `3`, any Branch.
2. Click **Add Student**.

✅ A green banner says `Student Kavya (1CS23CS010) added successfully!` and the table now has **6 rows**, with no page reload.

3. Fill the **same form again** and click **Add Student**.

✅ A red error banner appears, and the table stays at 6. The server refused the duplicate USN.

---

## Part 3: Watch the page talk to the server (optional, 2 minutes)

Press `F12`, open the **Network** tab, then add another student (a new USN). You see a `POST` request to `students`. Click it: its status is `201`. Every button on the page works this way.

---

## Your turn: switch on the Delete button

**1. See the problem first.** With the **Console** tab open (`F12 → Console`), click the red **Delete** button next to Kavya.

✅ Nothing happens on the page, and the Console shows a red error: `ReferenceError: deleteStudent is not defined`. The button is calling a function that is switched off.

**2. Switch it on.**

1. In VS Code open `public/script.js` (inside `04-frontend-fetch/start`).
2. Press `Ctrl + F` and search `TASK`. Go to the line `// ───── TASK ─────` near the bottom.
3. Select every line **between** `TASK` and `END TASK`: click the first `// async function deleteStudent` line, hold `Shift`, click the last `// }` line.
4. Press `Ctrl + /` (Mac: `Cmd + /`).
5. Save (`Ctrl + S`).

**3. Reload the page with `Ctrl + F5`.** 🌐 You do **not** need to restart the server, because only the page changed.

**4. Try Delete again.** Click **Delete** next to Kavya.

✅ A box asks `Are you sure you want to delete Kavya?` Click **OK**. A green banner says `Student Kavya deleted successfully!`, her row disappears, and the table is back to **5 rows**.

**5. Check the database.** 🍃

```javascript
db.students.countDocuments({ usn: "1CS23CS010" })
```

✅ You should see: `0`

---

## Done when

- [ ] The page at `http://127.0.0.1:3000/` shows the 5 students
- [ ] You added Kavya from the form and saw the green banner
- [ ] Delete works: confirm box, green banner, row gone
- [ ] `db.students.countDocuments({ usn: "1CS23CS010" })` shows `0`

---

## Stuck?

| What you see | Why | Fix |
| :--- | :--- | :--- |
| Page says it could not connect | The server is not running | `node server.js` in `04-frontend-fetch/start` |
| Blank page or `file:///` in the address bar | You opened the file directly | Use `http://127.0.0.1:3000/` |
| Delete still does nothing after your change | The browser kept the old script | `Ctrl + F5`. Also check you saved |
| `Cannot find module` | Packages not installed | `cd ../..` then `npm install --omit=dev` |
| `EADDRINUSE` | An old server is running | `Ctrl + C` in its terminal |
| Table has the wrong students | Leftover data from Step 3 | Reset (Part 1, step 2) |
| Need the finished code | | See **Fell behind?** in the top README |
