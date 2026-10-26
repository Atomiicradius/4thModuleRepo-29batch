# Hints for Feature 3: Edit Student (Form Switching & PUT Request)

### Goal
Clicking "Edit" fills the form with that student's details, changes the submit button to "Update Student", reveals a "Cancel" button, and sends a `PUT /students/:id` request upon submission.

### Guided Hints

1. **State Tracking:**
   Keep a top-level JavaScript variable to know whether the form is in "Add" mode or "Edit" mode:
   ```javascript
   let editingStudentId = null; // null = Add mode; string ObjectId = Edit mode
   ```

2. **Populating Form Fields:**
   When the user clicks the Edit button:
   - Save the ID: `editingStudentId = student._id;`
   - Fill inputs:
     ```javascript
     nameInput.value = student.name;
     usnInput.value = student.usn;
     semesterInput.value = student.semester;
     branchInput.value = student.branch;
     ```
   - Update UI elements:
     ```javascript
     submitBtn.textContent = 'Update Student';
     cancelEditBtn.style.display = 'inline-block';
     ```

3. **Branching in Form Submit:**
   Inside `studentForm.addEventListener('submit', ...)`:
   - If `editingStudentId` is set, make a `PUT` request to `/students/${editingStudentId}`.
   - If `editingStudentId` is `null`, make a `POST` request to `/students`.

4. **Canceling Edit Mode:**
   Add a click listener to the Cancel button:
   - Reset form fields with `studentForm.reset()`.
   - Restore `editingStudentId = null;`.
   - Change button text back to `Add Student`.
   - Hide the Cancel button: `cancelEditBtn.style.display = 'none';`.
