# Hints for Feature 2: View Students & Table Rendering

### Goal
Fetch students using `GET /students`, dynamically construct table rows, display a count badge, and handle the empty state.

### Guided Hints

1. **Triggering on Page Boot:**
   Use the `DOMContentLoaded` event so that student records are loaded immediately when the user opens or refreshes the page:
   ```javascript
   document.addEventListener('DOMContentLoaded', () => loadStudents());
   ```

2. **Sanitize Everything (Prevent XSS):**
   Never inject raw user strings directly into HTML using `innerHTML`. Create a lightweight escaping helper:
   ```javascript
   function escapeHtml(str) {
     const div = document.createElement('div');
     div.textContent = str;
     return div.innerHTML;
   }
   ```
   Wrap every student field before inserting into template literals: `${escapeHtml(student.name)}`.

3. **Empty State Check:**
   Check `if (students.length === 0)` before building rows. Render a friendly message: `<td colspan="5" class="empty-state">No students found.</td>`.

4. **Updating the Count Badge:**
   Keep your count badge element in sync by updating its text:
   ```javascript
   studentCountBadge.textContent = students.length;
   ```
