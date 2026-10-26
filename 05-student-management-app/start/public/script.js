/**
 * Step 05: Major Hands-on Project - Student Management App (Start Template)
 * 
 * Features to build:
 * [✓] Feature 1: Add student (form submit with POST /students)
 * [✓] Feature 2: View students (table rendering with GET /students)
 * [✓] Feature 4: Delete student (with confirm dialog and DELETE /students/:id)
 * [ ] Feature 3: Edit student (populate form, toggle button to "Update", PUT /students/:id)
 * [ ] Feature 5: Search students (debounced input against GET /students?search=...)
 * [ ] Feature 6: Full-Stack Persistence Test (verify data survives restarts)
 */

const API_BASE = '/students';

// DOM Elements
const studentForm = document.getElementById('student-form');
const nameInput = document.getElementById('student-name');
const usnInput = document.getElementById('student-usn');
const semesterInput = document.getElementById('student-semester');
const branchInput = document.getElementById('student-branch');
const submitBtn = document.getElementById('submit-btn');
const formHeading = document.getElementById('form-heading');
const tableBody = document.getElementById('student-table-body');
const studentCountBadge = document.getElementById('student-count');
const notification = document.getElementById('notification');

let notificationTimeout;

// TODO (Feature 3): Track editing state
// let editingStudentId = null;

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

function showNotification(message, type = 'success') {
  clearTimeout(notificationTimeout);
  notification.textContent = message;
  notification.className = type;

  notificationTimeout = setTimeout(() => {
    notification.className = '';
    notification.textContent = '';
  }, 4000);
}

// ============================================================================
// Feature 2: Fetch & Render Students
// ============================================================================
async function loadStudents(searchQuery = '') {
  try {
    let url = API_BASE;
    if (searchQuery) {
      url += `?search=${encodeURIComponent(searchQuery)}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const students = await response.json();
    renderStudentTable(students);
  } catch (error) {
    console.error('Failed to load students:', error);
    showNotification('Error loading student records', 'error');
  }
}

function renderStudentTable(students) {
  studentCountBadge.textContent = students.length;

  if (students.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No matching student records found.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = '';

  students.forEach((student) => {
    const tr = document.createElement('tr');
    tr.id = `student-row-${student._id}`;

    tr.innerHTML = `
      <td><strong>${escapeHtml(student.usn)}</strong></td>
      <td>${escapeHtml(student.name)}</td>
      <td>Semester ${escapeHtml(student.semester)}</td>
      <td><span class="badge">${escapeHtml(student.branch)}</span></td>
      <td>
        <!-- TODO (Feature 3): Add Edit Button here -->
        <button class="btn btn-danger delete-btn" data-id="${student._id}" data-name="${escapeHtml(student.name)}">
          Delete
        </button>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      const name = button.getAttribute('data-name');
      deleteStudent(id, name);
    });
  });
}

// ============================================================================
// Feature 1: Add or Update Student
// ============================================================================
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const usn = usnInput.value.trim().toUpperCase();
  const semester = parseInt(semesterInput.value, 10);
  const branch = branchInput.value;

  if (!name || !usn || !semester || !branch) {
    showNotification('Please fill in all required fields.', 'error');
    return;
  }

  const payload = { name, usn, semester, branch };

  // TODO (Feature 3): If editingStudentId is set, send PUT to `${API_BASE}/${editingStudentId}`
  // Otherwise, send POST to API_BASE:
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      showNotification(data.error || 'Failed to save student', 'error');
      return;
    }

    showNotification(`Student ${data.name} saved successfully!`, 'success');
    studentForm.reset();
    semesterInput.value = 3;
    loadStudents();
  } catch (error) {
    console.error('Save error:', error);
    showNotification('Network error connecting to server.', 'error');
  }
});

// ============================================================================
// Feature 4: Delete Student
// ============================================================================
async function deleteStudent(id, name) {
  const confirmDelete = window.confirm(`Are you sure you want to delete ${name}?`);
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) {
      showNotification(data.error || 'Failed to delete student', 'error');
      return;
    }

    showNotification(`Student ${name} deleted successfully.`, 'success');
    loadStudents();
  } catch (error) {
    console.error('Delete error:', error);
    showNotification('Network error while deleting.', 'error');
  }
}

// Initial load
document.addEventListener('DOMContentLoaded', () => loadStudents());
