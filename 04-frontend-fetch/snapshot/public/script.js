/**
 * Step 04: Frontend Fetch Integration (Finished Snapshot)
 * 
 * Demonstrates:
 * 1. GET /students -> Fetch all students and render them into the HTML table.
 * 2. POST /students -> Send form data as JSON to create a new student.
 * 3. DELETE /students/:id -> Delete a student by ObjectId.
 * 4. XSS Prevention -> Escapes user input before inserting into DOM.
 * 5. Inline feedback -> No ugly alert() popups; displays success/error banners.
 */

const API_BASE = '/students';

// DOM Elements
const studentForm = document.getElementById('student-form');
const nameInput = document.getElementById('student-name');
const usnInput = document.getElementById('student-usn');
const semesterInput = document.getElementById('student-semester');
const branchInput = document.getElementById('student-branch');
const tableBody = document.getElementById('student-table-body');
const studentCountBadge = document.getElementById('student-count');
const notification = document.getElementById('notification');

let notificationTimeout;

// Helper: Escape user input to prevent Cross-Site Scripting (XSS)
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Show inline status message
function showNotification(message, type = 'success') {
  clearTimeout(notificationTimeout);
  notification.textContent = message;
  notification.className = type; // 'success' or 'error'

  notificationTimeout = setTimeout(() => {
    notification.className = '';
    notification.textContent = '';
  }, 4000);
}

// ============================================================================
// 1. FETCH & RENDER: GET /students
// ============================================================================
async function loadStudents() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const students = await response.json();
    renderStudentTable(students);
  } catch (error) {
    console.error('Failed to load students:', error);
    showNotification('Could not connect to server. Ensure Express is running.', 'error');
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state" style="color: var(--error);">
          ⚠️ Failed to load students from database.
        </td>
      </tr>
    `;
  }
}

// Render student list into table rows
function renderStudentTable(students) {
  studentCountBadge.textContent = students.length;

  if (students.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No student records found in CollegeDB. Add one above!</td>
      </tr>
    `;
    return;
  }

  // Clear existing rows
  tableBody.innerHTML = '';

  students.forEach((student) => {
    const tr = document.createElement('tr');
    tr.id = `student-row-${student._id}`;

    // Safely insert content using escaped values
    tr.innerHTML = `
      <td><strong>${escapeHtml(student.usn)}</strong></td>
      <td>${escapeHtml(student.name)}</td>
      <td>Semester ${escapeHtml(student.semester)}</td>
      <td><span class="badge">${escapeHtml(student.branch)}</span></td>
      <td>
        <button class="btn btn-danger delete-btn" data-id="${student._id}" data-name="${escapeHtml(student.name)}">
          Delete
        </button>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  // Attach event listeners to all newly created delete buttons
  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      const name = button.getAttribute('data-name');
      deleteStudent(id, name);
    });
  });
}

// ============================================================================
// 2. SUBMIT FORM: POST /students
// ============================================================================
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const usn = usnInput.value.trim().toUpperCase();
  const semester = parseInt(semesterInput.value, 10);
  const branch = branchInput.value;

  // Client-side quick check
  if (!name || !usn || !semester || !branch) {
    showNotification('Please fill in all required fields.', 'error');
    return;
  }

  const payload = { name, usn, semester, branch };

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      // Backend returned error (e.g. 400 or 409 duplicate USN)
      showNotification(data.error || 'Failed to add student', 'error');
      return;
    }

    // Success!
    showNotification(`Student ${data.name} (${data.usn}) added successfully!`, 'success');
    studentForm.reset();
    semesterInput.value = 3; // Reset default
    loadStudents(); // Refresh table
  } catch (error) {
    console.error('Add student error:', error);
    showNotification('Network error while connecting to server.', 'error');
  }
});

// ============================================================================
// 3. DELETE STUDENT: DELETE /students/:id (Your Turn Task)
// ============================================================================
async function deleteStudent(id, name) {
  const confirmDelete = window.confirm(`Are you sure you want to delete ${name}?`);
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      showNotification(data.error || 'Failed to delete student', 'error');
      return;
    }

    showNotification(`Student ${name} deleted successfully.`, 'success');
    loadStudents(); // Re-render table
  } catch (error) {
    console.error('Delete student error:', error);
    showNotification('Network error while attempting deletion.', 'error');
  }
}

// Initial load when page opens
document.addEventListener('DOMContentLoaded', loadStudents);
