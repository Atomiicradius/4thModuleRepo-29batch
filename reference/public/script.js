/**
 * Day 4: Full-Stack Student Management System (Finished Reference)
 * RV College of Engineering - Department of Computer Science & Engineering
 * 
 * Features Included:
 * 1. Add Student (POST /students)
 * 2. View Students (GET /students) with XSS Sanitization & Count Badge
 * 3. Edit Student (PUT /students/:id) with form state toggle
 * 4. Delete Student (DELETE /students/:id) with confirmation prompt
 * 5. Debounced Live Search (GET /students?search=...)
 * 6. Full Data Persistence via MongoDB CollegeDB.students
 * Stretch Goals:
 * 7. Branch Filter Dropdown (GET /students?branch=...)
 * 8. Client-side Sort (Name A-Z, Z-A, Semester Asc/Desc, USN)
 * 9. Toast Notifications with auto-dismiss
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
const branchFilter = document.getElementById('branch-filter');
const sortSelect = document.getElementById('sort-select');
const refreshBtn = document.getElementById('refresh-btn');

const tableBody = document.getElementById('student-table-body');
const studentCountBadge = document.getElementById('student-count');
const toastContainer = document.getElementById('toast-container');
const notification = document.getElementById('notification');

// Application State
let rawStudentsList = [];
let editingStudentId = null;
let searchDebounceTimer = null;
let notificationTimer = null;

// ============================================================================
// Utilities: XSS Sanitization & Toast Notifications
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

function showToast(message, type = 'success') {
  // Show in floating toast container
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);

  // Also update banner for screen readers / inline status
  clearTimeout(notificationTimer);
  notification.textContent = message;
  notification.className = type;
  notificationTimer = setTimeout(() => {
    notification.className = '';
    notification.textContent = '';
  }, 4000);
}

function resetFormToCreateMode() {
  editingStudentId = null;
  studentForm.reset();
  semesterInput.value = 3;
  submitBtn.textContent = 'Add Student';
  formHeading.textContent = 'Add New Student';
  cancelEditBtn.style.display = 'none';
}

// ============================================================================
// Data Loading & Sorting
// ============================================================================
async function fetchStudents() {
  try {
    const search = searchInput.value.trim();
    const branch = branchFilter.value;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (branch && branch !== 'ALL') params.append('branch', branch);

    const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    rawStudentsList = await response.json();
    applySortAndRender();
  } catch (error) {
    console.error('Fetch students error:', error);
    showToast('Failed to connect to backend server.', 'error');
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state" style="color: var(--error);">
          ⚠️ Failed to connect to MongoDB server. Ensure Express is running.
        </td>
      </tr>
    `;
  }
}

function applySortAndRender() {
  const sortMode = sortSelect.value;
  const sorted = [...rawStudentsList];

  sorted.sort((a, b) => {
    switch (sortMode) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'sem-asc':
        return a.semester - b.semester;
      case 'sem-desc':
        return b.semester - a.semester;
      case 'usn-asc':
        return a.usn.localeCompare(b.usn);
      default:
        return 0;
    }
  });

  renderTable(sorted);
}

function renderTable(students) {
  studentCountBadge.textContent = students.length;

  if (students.length === 0) {
    const hasFilters = searchInput.value || branchFilter.value !== 'ALL';
    const msg = hasFilters
      ? 'No students found matching your search / filter criteria.'
      : 'No student records in CollegeDB. Use the form above to add one!';
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

  // Attach Edit listeners
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

  // Attach Delete listeners
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      deleteStudent(id, name);
    });
  });
}

// ============================================================================
// Edit Mode Handling
// ============================================================================
function startEditingStudent(student) {
  editingStudentId = student._id;

  nameInput.value = student.name;
  usnInput.value = student.usn;
  semesterInput.value = student.semester;
  branchInput.value = student.branch;

  formHeading.textContent = `Edit Student: ${student.name}`;
  submitBtn.textContent = 'Update Student';
  cancelEditBtn.style.display = 'inline-block';

  nameInput.focus();
  applySortAndRender(); // Re-render to highlight selected row
  showToast(`Editing ${student.name}. Make changes and click Update.`, 'warning');
}

cancelEditBtn.addEventListener('click', () => {
  resetFormToCreateMode();
  applySortAndRender();
  showToast('Edit operation cancelled.', 'warning');
});

// ============================================================================
// Form Submit (POST create or PUT update)
// ============================================================================
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const usn = usnInput.value.trim().toUpperCase();
  const semester = parseInt(semesterInput.value, 10);
  const branch = branchInput.value;

  if (!name || !usn || !semester || !branch) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  const payload = { name, usn, semester, branch };

  try {
    let response;
    const isEditing = Boolean(editingStudentId);

    if (isEditing) {
      response = await fetch(`${API_BASE}/${editingStudentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || 'Operation failed', 'error');
      return;
    }

    const msg = isEditing
      ? `Student ${data.name} updated successfully!`
      : `Student ${data.name} (${data.usn}) created successfully!`;

    showToast(msg, 'success');
    resetFormToCreateMode();
    fetchStudents();
  } catch (error) {
    console.error('Submit error:', error);
    showToast('Network error communicating with server.', 'error');
  }
});

// ============================================================================
// Delete Handler
// ============================================================================
async function deleteStudent(id, name) {
  const confirmed = window.confirm(`Are you sure you want to delete ${name}?`);
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || 'Failed to delete student', 'error');
      return;
    }

    showToast(`Student ${name} deleted successfully.`, 'success');

    if (editingStudentId === id) {
      resetFormToCreateMode();
    }

    fetchStudents();
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Network error while deleting.', 'error');
  }
}

// ============================================================================
// Search, Filter, Sort & Refresh Event Listeners
// ============================================================================
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    fetchStudents();
  }, 300);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  fetchStudents();
});

branchFilter.addEventListener('change', () => {
  fetchStudents();
});

sortSelect.addEventListener('change', () => {
  applySortAndRender();
});

refreshBtn.addEventListener('click', () => {
  fetchStudents();
  showToast('Student directory refreshed from database.', 'success');
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  fetchStudents();
});
