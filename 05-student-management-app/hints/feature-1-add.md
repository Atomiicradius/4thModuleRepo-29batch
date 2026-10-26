# Hints for Feature 1: Add Student

### Goal
Submit student data from the HTML form to `POST /students` without page reload, display inline success/error messages, and refresh the table.

### Guided Hints (Try these before looking at solutions!)

1. **Stop the Browser Default Refresh:**
   Forms in HTML naturally reload the browser when submitted. In your submit event listener, your first line must be:
   ```javascript
   e.preventDefault();
   ```

2. **Extract and Validate Values:**
   Read values with `.value.trim()`. Remember that HTML number inputs return strings in JavaScript, so parse the semester with `parseInt(semesterInput.value, 10)` before sending.

3. **Setting Request Headers:**
   When sending a JSON payload, you **must** inform Express using headers:
   ```javascript
   headers: {
     'Content-Type': 'application/json'
   }
   ```
   If omitted, Express won't parse `req.body` and will receive `undefined`.

4. **Handling Error Responses:**
   Check `response.ok` (which is `true` for status `200`-`299`). If `false`, parse `await response.json()` to get the backend `{ error: "..." }` message and display it in `#notification`.

5. **Clearing the Form:**
   After a successful addition:
   - Call `studentForm.reset()`.
   - Call `loadStudents()` to re-fetch and render the updated table immediately.
