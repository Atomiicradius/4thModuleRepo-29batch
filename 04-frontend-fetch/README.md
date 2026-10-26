# Step 04: Frontend Integration with Fetch API (Module 4)

## Goal
Connect a vanilla HTML/CSS/JavaScript user interface to your Express and MongoDB backend. Configure Express to serve static frontend files with `express.static`, use the browser's native `fetch()` API with `async/await` to perform `GET` and `POST` operations, prevent Cross-Site Scripting (XSS), display inline feedback messages, and implement a student deletion feature.

---

## Concepts
Modern web applications separate the client interface from the database layer through an intermediary REST API. When a user submits an HTML form, client-side JavaScript intercepts the event (`e.preventDefault()`), packs the input fields into a JSON payload, and sends an asynchronous HTTP request using `fetch()`. The Express backend handles the route, updates MongoDB, and responds with JSON data that JavaScript dynamically inserts into the HTML Document Object Model (DOM) without triggering a full page reload.

---

## Full-Stack Request/Response Lifecycle

```
[ Browser UI ]
   │  1. User fills form and clicks "Add Student"
   │  2. JavaScript e.preventDefault() stops page reload
   ▼
[ fetch() POST /students ]  ──(HTTP JSON Payload)──▶  [ Express API Route ]
                                                           │  3. Validates body
                                                           │  4. studentsCollection.insertOne()
                                                           ▼
                                                      [ MongoDB CollegeDB ]
                                                           │  5. Generates _id & saves document
                                                           ▼
[ DOM Table Updated ]  ◀──(201 Created JSON)─────────  [ Express API ]
   6. Inline success alert displayed
   7. Student row rendered dynamically
```

---

## Instructor Demo Steps

Follow along step-by-step:

### 1. Serve Static Frontend Files in Express
In `server.js`, configure Express to serve the `public/` directory:
```javascript
const path = require('path');

// Place above route definitions:
app.use(express.static(path.join(__dirname, 'public')));
```
Now visiting `http://127.0.0.1:3000/` automatically serves `public/index.html`!

---

### 2. Fetch and Render Student List (`GET /students`)
In `public/script.js`, retrieve all student records from MongoDB and render them into the HTML table:

```javascript
async function loadStudents() {
  try {
    const response = await fetch('/students');
    const students = await response.json();
    renderStudentTable(students);
  } catch (error) {
    showNotification('Error loading students', 'error');
  }
}
```

> **Security Rule: Never use raw `innerHTML` with user data!**
> Inserting unescaped user text directly via `innerHTML` opens your app to Cross-Site Scripting (XSS) attacks. Always sanitize text with a utility like `escapeHtml()`:
> ```javascript
> function escapeHtml(str) {
>   const div = document.createElement('div');
>   div.textContent = str;
>   return div.innerHTML;
> }
> ```

---

### 3. Handle Form Submission (`POST /students`)
Intercept the form submit, package the inputs into JSON, and send a `POST` request:

```javascript
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: nameInput.value.trim(),
    usn: usnInput.value.trim().toUpperCase(),
    semester: parseInt(semesterInput.value, 10),
    branch: branchInput.value
  };

  const response = await fetch('/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (response.ok) {
    showNotification(`Student ${data.name} added!`, 'success');
    studentForm.reset();
    loadStudents(); // Re-render table!
  } else {
    showNotification(data.error || 'Failed to add student', 'error');
  }
});
```

---

## Your Turn: Implement the Delete Action

1. Open `public/script.js` in your editor.
2. Locate the skeleton `deleteStudent(id, name)` function at the bottom:
3. Implement the function so that:
   - It prompts the user for confirmation using `window.confirm(`Are you sure you want to delete ${name}?`)`.
   - If confirmed, it makes an asynchronous `DELETE` request to `/students/${id}`:
     ```javascript
     const response = await fetch(`/students/${id}`, { method: 'DELETE' });
     ```
   - If `response.ok`, show an inline notification `Student deleted successfully` and call `loadStudents()` to refresh the table.
   - If not ok, display the error message returned from the backend.
4. Save the file, refresh your browser, and click the **Delete** button next to any student. Verify that the student disappears from the table and is removed from MongoDB Compass!

---

## Checkpoint Checklist
- [ ] Served static frontend via `express.static(path.join(__dirname, 'public'))`.
- [ ] Opened `http://127.0.0.1:3000/` in the browser and saw the Student Management UI.
- [ ] Existing students from Step 01 automatically populate the table upon load.
- [ ] Added a new student using the form; verified table updates instantly without page reload.
- [ ] Attempted adding a student with a duplicate USN; verified inline error banner displays.
- [ ] Completed "Your Turn": Clicked **Delete**, confirmed the prompt, and verified student is removed.

---

## Expected Output
**Browser UI:**
- Top header: *RVCE Student Management System*
- Form fields: Name, USN, Semester, Branch, and "Add Student" button
- Green alert banner: *Student Kavya (1CS23CS010) added successfully!*
- Table row showing USN in bold, Name, Semester, Branch badge, and red **Delete** button.

---

## Stuck?
- **Form submission reloads the page and loses state**:
  - Did you call `e.preventDefault();` as the first line of your submit event handler?
- **Console error: `Failed to fetch` or `CORS error`**:
  - Verify that the Node server is running in terminal (`node server.js`).
  - Make sure you are accessing the page via `http://127.0.0.1:3000` (NOT opening `index.html` as a `file:///` URI).
- **Table shows `[object Object]`**:
  - Make sure you are reading properties (`student.name`, `student.usn`) rather than passing the whole object.
- **Behind?**:
  - Compare your files with `04-frontend-fetch/snapshot/` or copy them to your directory.
