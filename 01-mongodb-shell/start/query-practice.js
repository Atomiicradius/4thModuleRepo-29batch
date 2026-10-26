/**
 * Step 01: MongoDB Shell Practice File (Start Template)
 * Follow along with the instructor during Module 2!
 */

// DEMO: 1. Switch to CollegeDB
// Type in mongosh: use CollegeDB

// DEMO: 2. Create the students collection
// Type in mongosh: db.createCollection("students")

// DEMO: 3. Insert one student (Rahul)
// Type in mongosh:
// db.students.insertOne({
//   name: "Rahul",
//   usn: "1CS23CS001",
//   semester: 3,
//   branch: "CSE"
// })

// DEMO: 4. Insert multiple students (Priya, Amit, Sneha, Vikram)
// Type in mongosh:
// db.students.insertMany([
//   { name: "Priya", usn: "1CS23CS002", semester: 3, branch: "CSE" },
//   { name: "Amit", usn: "1CS23CS003", semester: 5, branch: "ISE" },
//   { name: "Sneha", usn: "1CS23CS004", semester: 4, branch: "ECE" },
//   { name: "Vikram", usn: "1CS23CS005", semester: 6, branch: "AIML" }
// ])

// DEMO: 5. Query all students
// db.students.find()

// DEMO: 6. Query with a branch filter (only CSE)
// db.students.find({ branch: "CSE" })

// DEMO: 7. Query with a comparison operator ($gte on semester >= 4)
// db.students.find({ semester: { $gte: 4 } })

// DEMO: 8. Update Rahul's semester to 4 using $set
// db.students.updateOne({ usn: "1CS23CS001" }, { $set: { semester: 4 } })

// DEMO: 9. Delete Vikram's record
// db.students.deleteOne({ usn: "1CS23CS005" })


// ==========================================
// YOUR TURN: Hands-On Exercise
// (UNCOMMENT the blocks below to run or copy/paste into mongosh!)
// ==========================================

// YOUR TURN 1: Insert 3 students using insertMany()
// db.students.insertMany([
//   { name: "Kavya", usn: "1CS23CS006", semester: 3, branch: "CSE" },
//   { name: "Manoj", usn: "1CS23CS007", semester: 5, branch: "ISE" },
//   { name: "Divya", usn: "1CS23CS008", semester: 4, branch: "AIML" }
// ])

// YOUR TURN 2: Write a query to find only CSE students
// db.students.find({ branch: "CSE" })

// YOUR TURN 3: Write a query to find all students in semester 3 or higher using $gte
// db.students.find({ semester: { $gte: 3 } })

