# Step 05: Major Hands-on Project - Student Management App

## Goal
Build a complete, production-style, database-backed Student Management Web Application from guided tasks. Implement all six core features: **Add**, **View**, **Edit (PUT)**, **Delete**, **Debounced Live Search**, and conduct a **Full-Stack Persistence Test**.

---

## Concepts
A full-stack application brings together the frontend client (HTML presentation, CSS styling, and DOM manipulation via vanilla JavaScript), a REST API server (Node.js and Express handling HTTP routing and validation), and a durable document database (MongoDB persisting records to disk). In this capstone exercise of Day 4, you tie every individual building block from earlier modules into a cohesive system that handles real-world workflows such as live asynchronous searching and form state switching between creation and updates.

---

## Feature Breakdown: What's Already Done vs What You Build

To avoid hunting for missing code, understand that **your `start/` code already includes the foundation from Step 04**:

| Feature | Status at Start of Step 05 | What You Need To Do |
| :--- | :---: | :--- |
| **Feature 1: Add Student** | ✅ Already Built (Step 04) | Functional! Try adding a student to verify. |
| **Feature 2: View Students** | ✅ Already Built (Step 04) | Functional! Renders table with count badge & XSS escaping. |
| **Feature 4: Delete Student** | ✅ Already Built (Step 04) | Functional! Confirm dialog and `DELETE` work. |
| **Feature 3: Edit Student (PUT)** | 🛠️ **YOUR TASK 1** | Wire Edit button, fill form, toggle "Update", send `PUT`. |
| **Feature 5: Debounced Search** | 🛠️ **YOUR TASK 2** | Add debounced input (300ms) to call `GET /students?search=`. |
| **Feature 6: Persistence Test** | 🧪 **YOUR TASK 3** | Add records, shut down server with `Ctrl+C`, restart, verify. |

---

## Your Hands-On Tasks in Step 05

Refer to the hint files in `hints/` if you need guidance:

- [ ] **Task 1: Feature 3 — Edit Student & Form Mode Toggle** ([Hints: hints/feature-3-edit.md](hints/feature-3-edit.md))
  - When the user clicks "Edit" on a student row:
    - Store the student's `_id` in a state variable (`let editingStudentId = student._id`).
    - Populate the input fields (Name, USN, Semester, Branch).
    - Change submit button text from "Add Student" to "Update Student".
    - Reveal the "Cancel Edit" button.
  - When submitted in edit mode, send `PUT /students/:editingStudentId`.
  - When "Cancel Edit" is clicked, reset form to "Add Student" mode.

- [ ] **Task 2: Feature 5 — Debounced Live Search** ([Hints: hints/feature-5-search.md](hints/feature-5-search.md))
  - Add search input field above the table.
  - Listen to the `input` event and apply a 300ms debounce timer with `setTimeout`.
  - Query `GET /students?search=<query>` to filter by Name or USN.
  - Connect the "Clear" button to restore all records.

- [ ] **Task 3: Feature 6 — Full-Stack Persistence Verification** ([Hints: hints/feature-6-persistence.md](hints/feature-6-persistence.md))
  - Add and edit student records in the UI.
  - Refresh the browser (`Ctrl + F5`) and confirm records persist.
  - Stop the Node server (`Ctrl + C`) and restart it (`node server.js`).
  - Refresh browser and confirm all records remain intact in MongoDB.
  - Verify stored records inside MongoDB Compass.

---

## Stretch Goals (For Early Finishers)
1. **Branch Filter Dropdown:** Add a `<select id="branch-filter">` to filter the table by department (CSE, ISE, AIML, etc.) without page reload.
2. **Column Sorting:** Click on the "Name" or "Semester" table header to sort students ascending or descending.
3. **Toast Notifications:** Replace the banner with floating, auto-dismissing toast notifications in the top-right corner.

> 💡 **Pedagogical Note on `snapshot/` and `reference/`:**
> The finished code in `snapshot/` and `reference/` is provided as an educational safety net so you can inspect working implementations or catch up if you fall behind. **Challenge yourself to build Features 3, 5, and 6 using only the `hints/` files first!** (Instructors may also opt to withhold the `reference/` folder until the end of the lab session).

---

## Checkpoint Checklist
- [ ] Started server with `node server.js` inside `05-student-management-app/start`.
- [ ] Added at least 3 students via the UI form.
- [ ] Tested duplicate USN validation; confirmed inline error alert appears.
- [ ] Edited a student's semester using the Edit button and verified `PUT` updates the database.
- [ ] Deleted a student after confirmation prompt.
- [ ] Typed in search box and verified live debounced filtering works.
- [ ] Restarted server and verified full database persistence.

---

## Expected Output
**Browser UI Features:**
- Header: *RVCE Student Management System*
- Form: Name, USN, Semester, Branch, and dynamic "Add Student" / "Update Student" button.
- Search box: Debounced input with Clear button.
- Table: Rows with USN in bold, Name, Semester, Branch badge, and Edit / Delete action buttons.
- Persistence: Data remains identical across browser reloads and server restarts.

---

## Stuck?
- **Edit mode doesn't know which student to update**:
  - Keep a global `let editingStudentId = null;` variable. Store the `_id` when Edit is clicked, and check `if (editingStudentId)` when submitting.
- **Search sends requests on every single key typed**:
  - Make sure you clear the old timeout before starting a new one:
    `clearTimeout(searchDebounceTimeout); searchDebounceTimeout = setTimeout(...);`
- **Need help?**:
  - Read through each feature's file in `05-student-management-app/hints/`.
  - Review the complete solution in `05-student-management-app/snapshot/` or `reference/`.
