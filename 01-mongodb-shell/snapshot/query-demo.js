/**
 * Step 01: Complete MongoDB Shell Script (Finished Snapshot)
 * Can be loaded into mongosh: load("query-demo.js")
 */

// 1. Select the database and ensure a clean state
db = db.getSiblingDB("CollegeDB");
print("Switched to CollegeDB");

// Reset collection so this demo runs cleanly even if data already exists
db.students.drop();
db.createCollection("students");
db.students.createIndex({ usn: 1 }, { unique: true });

// 2. Insert single student
print("\n--- 1. insertOne ---");
const singleStudent = db.students.insertOne({
  name: "Rahul",
  usn: "1CS23CS001",
  semester: 3,
  branch: "CSE"
});
printjson(singleStudent);

// 3. Insert multiple students
print("\n--- 2. insertMany ---");
const multipleStudents = db.students.insertMany([
  { name: "Priya", usn: "1CS23CS002", semester: 3, branch: "CSE" },
  { name: "Amit", usn: "1CS23CS003", semester: 5, branch: "ISE" },
  { name: "Sneha", usn: "1CS23CS004", semester: 4, branch: "ECE" },
  { name: "Vikram", usn: "1CS23CS005", semester: 6, branch: "AIML" }
]);
printjson(multipleStudents);

// 4. Find all students
print("\n--- 3. find (all) ---");
printjson(db.students.find().toArray());

// 5. Find by branch
print("\n--- 4. find with branch filter (CSE) ---");
printjson(db.students.find({ branch: "CSE" }).toArray());

// 6. Find with $gte filter (semester >= 4)
print("\n--- 5. find with $gte filter (semester >= 4) ---");
printjson(db.students.find({ semester: { $gte: 4 } }).toArray());

// 7. Update one document using $set
print("\n--- 6. updateOne with $set ---");
const updateResult = db.students.updateOne(
  { usn: "1CS23CS001" },
  { $set: { semester: 4 } }
);
printjson(updateResult);

// 8. Delete one document
print("\n--- 7. deleteOne ---");
const deleteResult = db.students.deleteOne({ usn: "1CS23CS005" });
printjson(deleteResult);

// 9. Count remaining documents
print("\n--- 8. Final Count ---");
print(`Remaining students: ${db.students.countDocuments()}`);
