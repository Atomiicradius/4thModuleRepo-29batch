/* global use, db */
// MongoDB Playground for VS Code
// To run: Click "Execute" at the top right of this editor tab

// Select CollegeDB
use('CollegeDB');

// Drop and recreate collection
db.students.drop();
db.createCollection('students');
db.students.createIndex({ usn: 1 }, { unique: true });

// Insert 5 sample student documents
db.students.insertMany([
  { name: 'Rahul', usn: '1CS23CS001', semester: 3, branch: 'CSE' },
  { name: 'Priya', usn: '1CS23CS002', semester: 3, branch: 'CSE' },
  { name: 'Amit', usn: '1CS23CS003', semester: 5, branch: 'ISE' },
  { name: 'Sneha', usn: '1CS23CS004', semester: 4, branch: 'ECE' },
  { name: 'Vikram', usn: '1CS23CS005', semester: 6, branch: 'AIML' }
]);

// Verify
db.students.find();
