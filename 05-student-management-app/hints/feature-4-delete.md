# Hints for Feature 4: Delete Student with Confirmation

### Goal
Clicking "Delete" displays a confirmation prompt, issues a `DELETE /students/:id` HTTP call, displays an inline status message, and refreshes the student directory.

### Guided Hints

1. **Safety Confirmation:**
   Deleting data permanently is irreversible. Always prompt the user first:
   ```javascript
   const confirmed = window.confirm(`Are you sure you want to delete ${name}?`);
   if (!confirmed) return; // Student clicked Cancel, do nothing!
   ```

2. **Sending the DELETE Method:**
   Unlike `POST` and `PUT`, `DELETE` does not require a request body:
   ```javascript
   const response = await fetch(`/students/${id}`, {
     method: 'DELETE'
   });
   ```

3. **Cleaning Up Active Edits:**
   If the student being deleted is currently loaded in the edit form (`editingStudentId === id`), remember to cancel edit mode and reset the form.

4. **DOM Re-render:**
   Always re-run `loadStudents()` after successful deletion so the table accurately reflects the database state.
