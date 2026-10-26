# Step 05: Major Hands-on Project - Student Management App

## Goal
Build a complete, production-style, database-backed Student Management Web Application from guided tasks. Implement all six core features: **Add**, **View**, **Edit (PUT)**, **Delete**, **Debounced Live Search**, and conduct a **Full-Stack Persistence Test**.

---

## Concepts
A full-stack application brings together the frontend client (HTML presentation, CSS styling, and DOM manipulation via vanilla JavaScript), a REST API server (Node.js and Express handling HTTP routing and validation), and a durable document database (MongoDB persisting records to disk). In this capstone exercise of Day 4, you tie every individual building block from earlier modules into a cohesive system that handles real-world workflows such as live asynchronous searching and form state switching between creation and updates.

---

## The 6 Core Features Checklist

Work through each feature one by one. If you get stuck, refer to the corresponding hint file in the `hints/` directory:

- [ ] **Feature 1: Add Student** ([Hints: hints/feature-1-add.md](hints/feature-1-add.md))
  - Submit form data to `POST /students`.
  - Validate required fields on client and server.
  - Display inline error banner on duplicate USN (`409 Conflict`).
  - Clear the form and refresh the table on success.

- [ ] **Feature 2: View Students & Count Badge** ([Hints: hints/feature-2-view.md](hints/feature-2-view.md))
  - Load records from `GET /students` when page loads.
  - Render an HTML table with USN, Name, Semester, and Branch.
  - Escape all user input before insertion to prevent XSS vulnerabilities.
  - Update the count badge showing total enrolled students.
  - Display a clean empty-state message when 0 students exist.

- [ ] **Feature 3: Edit Student & Form Mode Toggle** ([Hints: hints/feature-3-edit.md](hints/feature-3-edit.md))
  - Click the "Edit" button on any student row.
  - Populate the input fields with that student's current values.
  - Change submit button text from "Add Student" to "Update Student".
  - Reveal a "Cancel Edit" button.
  - Submit form via `PUT /students/:id` to update the document in MongoDB.
  - Reset form back to "Add Student" mode upon success or cancellation.

- [ ] **Feature 4: Delete Student with Confirmation** ([Hints: hints/feature-4-delete.md](hints/feature-4-delete.md))
  - Click the "Delete" button.
  - Ask for user confirmation via `window.confirm()`.
  - Issue `DELETE /students/:id`.
  - Show success notification and remove row from table.

- [ ] **Feature 5: Debounced Live Search** ([Hints: hints/feature-5-search.md](hints/feature-5-search.md))
  - Add search input field above the table.
  - Listen to the `input` event and apply a 300ms debounce timer.
  - Query `GET /students?search=<query>` to filter by Name or USN.
  - Provide a "Clear" button to restore all records.

- [ ] **Feature 6: Full-Stack Persistence Test** ([Hints: hints/feature-6-persistence.md](hints/feature-6-persistence.md))
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

> 💡 **Finished Reference Implementation:**
> If you want to compare your finished code or inspect how the stretch goals are implemented, check out the `reference/` directory at the root of this repository.

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
