/**
 * Reset CollegeDB.students to the 5 sample students.
 * Works without mongosh:   npm run seed     (run from the repo root)
 */
const { MongoClient } = require('mongodb');

const students = [
  { name: 'Rahul', usn: '1CS23CS001', semester: 3, branch: 'CSE' },
  { name: 'Priya', usn: '1CS23CS002', semester: 3, branch: 'CSE' },
  { name: 'Amit', usn: '1CS23CS003', semester: 5, branch: 'ISE' },
  { name: 'Sneha', usn: '1CS23CS004', semester: 4, branch: 'ECE' },
  { name: 'Vikram', usn: '1CS23CS005', semester: 6, branch: 'AIML' }
];

(async () => {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  try {
    await client.connect();
    const col = client.db('CollegeDB').collection('students');
    await col.drop().catch(() => {});                       // ignore "collection does not exist"
    await col.createIndex({ usn: 1 }, { unique: true });
    await col.insertMany(students);
    console.log(`Seeded CollegeDB.students with ${await col.countDocuments()} students.`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
})();
