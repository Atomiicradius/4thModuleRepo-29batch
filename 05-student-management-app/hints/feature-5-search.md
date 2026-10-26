# Hints for Feature 5: Debounced Live Search

> **Note:** the finished code for this feature is already in `public/script.js`, switched off with `//` (search for `TASK 2`). These hints explain *how it works*. Read them after you have tried the task.


### Goal
As the user types into the search box, query `GET /students?search=...` to filter by name or USN. Use debouncing to prevent firing an API call on every single keystroke.

### Guided Hints

1. **What is Debouncing and Why Do We Need It?**
   If a user types `"Rahul"` quickly (5 keystrokes in 1 second), making 5 immediate HTTP requests causes unnecessary database queries and network lag. **Debouncing** delays the request until the user pauses typing for 300 milliseconds.

2. **How to Implement Debounce with `setTimeout`:**
   ```javascript
   let searchDebounceTimeout = null;

   searchInput.addEventListener('input', (e) => {
     // Cancel previous timer if user pressed another key
     clearTimeout(searchDebounceTimeout);

     const query = e.target.value;

     // Start a new 300ms timer
     searchDebounceTimeout = setTimeout(() => {
       loadStudents(query);
     }, 300);
   });
   ```

3. **URL Encoding Query Strings:**
   Query parameter values might contain spaces or symbols. Always encode with `encodeURIComponent()`:
   ```javascript
   const url = `/students?search=${encodeURIComponent(query)}`;
   ```

4. **Clear Search Button:**
   Provide a convenient button to reset the search box:
   ```javascript
   clearBtn.addEventListener('click', () => {
     searchInput.value = '';
     loadStudents('');
   });
   ```
