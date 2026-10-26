/**
 * Day 4: Full Stack Development Skill Lab (RVCE CSE)
 * Step 01: MongoDB Seed Script
 * 
 * Database: CollegeDB
 * Collection: students
 * 
 * Usage in mongosh:
 *   mongosh mongodb://127.0.0.1:27017/CollegeDB seed.js
 * 
 * Or inside mongosh prompt:
 *   load("seed.js")
 */

// Switch to CollegeDB
db = db.getSiblingDB("CollegeDB");

print("🌱 Resetting and seeding CollegeDB.students collection...");

// Drop existing collection to start clean
db.students.drop();

// Create collection explicitly (as covered in Module 4)
db.createCollection("students");

// Create unique index on USN to enforce constraint
db.students.createIndex({ usn: 1 }, { unique: true });

// Insert standard 5 sample student documents
const sampleStudents = [
  {
    name: "Rahul",
    usn: "1CS23CS001",
    semester: 3,
    branch: "CSE"
  },
  {
    name: "Priya",
    usn: "1CS23CS002",
    semester: 3,
    branch: "CSE"
  },
  {
    name: "Amit",
    usn: "1CS23CS003",
    semester: 5,
    branch: "ISE"
  },
  {
    name: "Sneha",
    usn: "1CS23CS004",
    semester: 4,
    branch: "ECE"
  },
  {
    name: "Vikram",
    usn: "1CS23CS005",
    semester: 6,
    branch: "AIML"
  }
];

const result = db.students.insertMany(sampleStudents);
print(`✅ Seed successful! Inserted ${Object.keys(result.insertedIds).length} student documents.`);
print("\nCurrent students in CollegeDB:");
printjson(db.students.find().toArray());
