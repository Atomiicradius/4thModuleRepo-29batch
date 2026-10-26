/**
 * Step 05: Major Hands-on Project - Complete Student Management App (Finished Snapshot)
 * 
 * Features Implemented:
 * 1. Add Student: Form submit with validation, POST /students, inline error handling.
 * 2. View Students: Dynamic rendering, count badge, empty state, XSS escaping.
 * 3. Edit Student: Form fills on "Edit" click, changes button to "Update Student",
 *    displays Cancel button, issues PUT /students/:id, restores form state.
 * 4. Delete Student: Confirmation prompt, issues DELETE /students/:id, re-renders list.
 * 5. Search Students: Live debounced search input (300ms) with Clear button.
 * 6. Persistence: All state is backed by MongoDB CollegeDB.
 */

const API_BASE = '/students';

// DOM Elements
const studentForm = document.getElementById('student-form');
const nameInput = document.getElementById('student-name');
const usnInput = document.getElementById('student-usn');
const semesterInput = document.getElementById('student-semester');
const branchInput = document.getElementById('student-branch');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const formHeading = document.getElementById('form-heading');

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');

const tableBody = document.getElementById('student-table-body');
const studentCountBadge = document.getElementById('student-count');
const notification = document.getElementById('notification');

// State variables
let editingStudentId = null;
let notificationTimeout = null;
let searchDebounceTimeout = null;

// ============================================================================
// Utilities: XSS Prevention & Inline Feedback
// ============================================================================
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
  notification.className = type; // 'success', 'error', 'warning'

  notificationTimeout = setTimeout(() => {
    notification.className = '';
    notification.textContent = '';
  }, 4000);
}

// Reset form back to "Add Student" mode
function resetFormToCreateMode() {
  editingStudentId = null;
  studentForm.reset();
  semesterInput.value = 3;
  submitBtn.textContent = 'Add Student';
  submitBtn.className = 'btn btn-primary';
  formHeading.textContent = 'Add New Student';
  cancelEditBtn.style.display = 'none';
}

// ============================================================================
// Feature 2: Fetch & Render Students
// ============================================================================
async function loadStudents(searchQuery = '') {
  try {
    let url = API_BASE;
    if (searchQuery.trim() !== '') {
      url += `?search=${encodeURIComponent(searchQuery.trim())}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const students = await response.json();
    renderStudentTable(students, searchQuery);
  } catch (error) {
    console.error('Failed to load students:', error);
    showNotification('Could not load student records. Is the server running?', 'error');
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state" style="color: var(--error);">
          ⚠️ Failed to load student records from database.
        </td>
      </tr>
    `;
  }
}

function renderStudentTable(students, currentQuery = '') {
  studentCountBadge.textContent = students.length;

  if (students.length === 0) {
    const msg = currentQuery
      ? `No students found matching "${escapeHtml(currentQuery)}".`
      : 'No student records in CollegeDB. Add one above!';
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">${msg}</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = '';

  students.forEach((student) => {
    const tr = document.createElement('tr');
    tr.id = `student-row-${student._id}`;

    // Highlight row if currently being edited
    if (editingStudentId === student._id) {
      tr.style.backgroundColor = '#fef9c3';
    }

    tr.innerHTML = `
      <td><strong>${escapeHtml(student.usn)}</strong></td>
      <td>${escapeHtml(student.name)}</td>
      <td>Semester ${escapeHtml(student.semester)}</td>
      <td><span class="badge">${escapeHtml(student.branch)}</span></td>
      <td>
        <button 
          class="btn btn-edit edit-btn" 
          data-id="${student._id}"
          data-name="${escapeHtml(student.name)}"
          data-usn="${escapeHtml(student.usn)}"
          data-semester="${student.semester}"
          data-branch="${escapeHtml(student.branch)}"
        >
          Edit
        </button>
        <button 
          class="btn btn-danger delete-btn" 
          data-id="${student._id}" 
          data-name="${escapeHtml(student.name)}"
        >
          Delete
        </button>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  // Attach Edit handlers
  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      startEditingStudent({
        _id: btn.getAttribute('data-id'),
        name: btn.getAttribute('data-name'),
        usn: btn.getAttribute('data-usn'),
        semester: btn.getAttribute('data-semester'),
        branch: btn.getAttribute('data-branch')
      });
    });
  });

  // Attach Delete handlers
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      deleteStudent(id, name);
    });
  });
}

// ============================================================================
// Feature 3: Edit Student (Populate Form & Switch Mode)
// ============================================================================
function startEditingStudent(student) {
  editingStudentId = student._id;

  // Fill form inputs with student data
  nameInput.value = student.name;
  usnInput.value = student.usn;
  semesterInput.value = student.semester;
  branchInput.value = student.branch;

  // Toggle UI state to Edit Mode
  formHeading.textContent = `Edit Student: ${student.name}`;
  submitBtn.textContent = 'Update Student';
  submitBtn.className = 'btn btn-primary';
  cancelEditBtn.style.display = 'inline-block';

  nameInput.focus();
  showNotification(`Editing ${student.name} (${student.usn}). Modify fields and click Update.`, 'warning');
}

cancelEditBtn.addEventListener('click', () => {
  resetFormToCreateMode();
  showNotification('Edit cancelled.', 'warning');
  loadStudents(searchInput.value);
});

// ============================================================================
// Feature 1 & 3: Form Submit Handler (Add POST or Update PUT)
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

  try {
    let response;
    let isEditing = Boolean(editingStudentId);

    if (isEditing) {
      // Feature 3: PUT /students/:id
      response = await fetch(`${API_BASE}/${editingStudentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // Feature 1: POST /students
      response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await response.json();

    if (!response.ok) {
      showNotification(data.error || 'Operation failed', 'error');
      return;
    }

    const successMsg = isEditing
      ? `Student ${data.name} updated successfully!`
      : `Student ${data.name} (${data.usn}) added successfully!`;

    showNotification(successMsg, 'success');
    resetFormToCreateMode();
    loadStudents(searchInput.value);
  } catch (error) {
    console.error('Submit error:', error);
    showNotification('Network error connecting to backend API.', 'error');
  }
});

// ============================================================================
// Feature 4: Delete Student
// ============================================================================
async function deleteStudent(id, name) {
  const confirmed = window.confirm(`Are you sure you want to delete ${name}?`);
  if (!confirmed) return;

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

    // If currently editing the deleted student, cancel edit mode
    if (editingStudentId === id) {
      resetFormToCreateMode();
    }

    loadStudents(searchInput.value);
  } catch (error) {
    console.error('Delete error:', error);
    showNotification('Network error while attempting to delete student.', 'error');
  }
}

// ============================================================================
// Feature 5: Debounced Live Search
// ============================================================================
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchDebounceTimeout);
  const query = e.target.value;

  // Debounce API calls by 300ms to avoid overwhelming the database while typing
  searchDebounceTimeout = setTimeout(() => {
    loadStudents(query);
  }, 300);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  loadStudents('');
});

// Initial boot: fetch all records
document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
});
