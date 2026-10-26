/**
 * Step 05: Major Hands-on Project - Student Management App (Start Template)
 * 
 * 💡 LAB TIP: Do NOT waste time typing long code!
 * Select each commented feature below and press Ctrl + / (Windows) or Cmd + / (Mac) to uncomment.
 * 
 * Feature Breakdown:
 * [✓] Feature 1: Add student (POST /students) - ALREADY WORKING!
 * [✓] Feature 2: View directory (GET /students) - ALREADY WORKING!
 * [✓] Feature 4: Delete student (DELETE /students/:id) - ALREADY WORKING!
 * [ ] Feature 3: Edit student (PUT /students/:id) - UNCOMMENT BELOW
 * [ ] Feature 5: Live Search (GET /students?search=...) - UNCOMMENT BELOW
 * [ ] Feature 6: Full-Stack Persistence Test - TEST IN BROWSER/TERMINAL
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
let notificationTimeout = null;
let searchDebounceTimeout = null;

// ============================================================================
// FEATURE 3 (STEP A): Track editing state (UNCOMMENT to enable)
// ============================================================================
let editingStudentId = null;

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
// FEATURE 3 (STEP B): Reset form back to "Add Student" mode
// (UNCOMMENT to enable)
// ============================================================================
function resetFormToCreateMode() {
  editingStudentId = null;
  studentForm.reset();
  semesterInput.value = 3;
  submitBtn.textContent = 'Add Student';
  submitBtn.className = 'btn btn-primary';
  formHeading.textContent = 'Add New Student';
  if (cancelEditBtn) cancelEditBtn.style.display = 'none';

  // Clear table highlights
  document.querySelectorAll('#student-table-body tr').forEach(r => r.style.backgroundColor = '');
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
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const students = await response.json();
    renderStudentTable(students, searchQuery);
  } catch (error) {
    console.error('Failed to load students:', error);
    showNotification('Error loading student records', 'error');
  }
}

function renderStudentTable(students, currentQuery = '') {
  studentCountBadge.textContent = students.length;

  if (students.length === 0) {
    const msg = currentQuery
      ? `No students found matching "${escapeHtml(currentQuery)}".`
      : 'No matching student records found.';
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
        <!-- FEATURE 3 (STEP C): Edit Button (Already active!) -->
        <button 
          class="btn btn-secondary edit-btn" 
          data-id="${student._id}"
          data-name="${escapeHtml(student.name)}"
          data-usn="${escapeHtml(student.usn)}"
          data-semester="${student.semester}"
          data-branch="${escapeHtml(student.branch)}"
        >
          Edit
        </button>
        <button class="btn btn-danger delete-btn" data-id="${student._id}" data-name="${escapeHtml(student.name)}">
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
  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      const name = button.getAttribute('data-name');
      deleteStudent(id, name);
    });
  });
}

// ============================================================================
// FEATURE 3 (STEP D): Edit Student - Fill Form & Switch to Edit Mode
// (UNCOMMENT to enable)
// ============================================================================
function startEditingStudent(student) {
  editingStudentId = student._id;

  // 1. Highlight the active row being edited
  document.querySelectorAll('#student-table-body tr').forEach(r => r.style.backgroundColor = '');
  const activeRow = document.getElementById(`student-row-${student._id}`);
  if (activeRow) {
    activeRow.style.backgroundColor = '#fef9c3';
  }

  // 2. Populate form fields
  nameInput.value = student.name;
  usnInput.value = student.usn;
  semesterInput.value = student.semester;
  branchInput.value = student.branch;

  // 3. Switch form UI to Update mode
  formHeading.textContent = `Edit Student: ${student.name}`;
  submitBtn.textContent = 'Update Student';
  submitBtn.className = 'btn btn-primary';
  if (cancelEditBtn) cancelEditBtn.style.display = 'inline-block';

  // 4. Smooth-scroll directly to the form so the user immediately sees it
  studentForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  nameInput.focus();

  showNotification(`Editing ${student.name}. Modify fields and click Update Student.`, 'warning');
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener('click', () => {
    resetFormToCreateMode();
    showNotification('Edit cancelled.', 'warning');
    loadStudents(searchInput ? searchInput.value : '');
  });
}

// ============================================================================
// Feature 1 & 3: Add (POST) or Update (PUT) Student
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

    // ========================================================================
    // FEATURE 3 (STEP E): If editing, send PUT. Otherwise, send POST!
    // ========================================================================
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
      showNotification(data.error || 'Failed to save student', 'error');
      return;
    }

    const successMsg = isEditing
      ? `Student ${data.name} updated successfully!`
      : `Student ${data.name} (${data.usn}) added successfully!`;

    showNotification(successMsg, 'success');
    resetFormToCreateMode();
    loadStudents(searchInput ? searchInput.value : '');
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
    loadStudents(searchInput ? searchInput.value : '');
  } catch (error) {
    console.error('Delete error:', error);
    showNotification('Network error while deleting.', 'error');
  }
}

// ============================================================================
// FEATURE 5: Live Search with 300ms Debounce
// ============================================================================
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimeout);
    const query = e.target.value;

    if (clearSearchBtn) {
      clearSearchBtn.style.display = query ? 'inline-block' : 'none';
    }

    // Wait 300ms after last keystroke before querying backend
    searchDebounceTimeout = setTimeout(() => {
      loadStudents(query);
    }, 300);
  });
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    loadStudents('');
  });
}

// Initial load
document.addEventListener('DOMContentLoaded', () => loadStudents());
