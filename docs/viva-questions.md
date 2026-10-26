# Day 4: Full Stack Skill Lab Viva Questions & Answers
**Department of Computer Science & Engineering, RV College of Engineering**  
*Course: Full Stack Development Skill Lab — Module 4: Database Integration & Full-Stack System*

These 20 questions are drawn directly from the official RVCE Skill Lab Manual. Each entry provides a concise, high-scoring model answer followed by key technical keywords for your viva examination.

---

### Q1. What are the three main components of a student management system?
**Model Answer:**  
The three main components are:
1. **Frontend (Client Tier):** HTML, CSS, and JavaScript interface providing user forms and displaying student records.
2. **Backend (Application Tier):** Node.js and Express server handling HTTP REST requests, business logic, and validation.
3. **Database (Data Tier):** MongoDB server storing persistent student documents in BSON format.  
*Key terms: Presentation tier, Application tier, Data tier, 3-tier architecture.*

---

### Q2. What is the role of `index.html` in the project?
**Model Answer:**  
`index.html` provides the semantic structure and skeleton of the user interface. It defines the student input form (Name, USN, Semester, Branch), action buttons, status notification banners, and the tabular layout where student records are rendered.  
*Key terms: Semantic HTML5, form inputs, table structure, DOM elements.*

---

### Q3. What is the purpose of `script.js`?
**Model Answer:**  
`script.js` contains the client-side JavaScript logic. It listens for user browser events (like form submission and button clicks), prevents default page reloads, makes asynchronous HTTP requests using the `fetch()` API, handles server responses, and dynamically updates the HTML DOM to display data without refreshing the page.  
*Key terms: Event listeners, DOM manipulation, async/await, fetch API, XSS prevention.*

---

### Q4. What is the purpose of `style.css`?
**Model Answer:**  
`style.css` controls the visual presentation and layout of the web page. It defines colors, fonts, margins, card containers, button hover states, responsive grid behavior across mobile and desktop viewports, and visual feedback states like success/error notification banners.  
*Key terms: Responsive design, CSS variables, visual hierarchy, user experience (UX).*

---

### Q5. What is the role of the backend in this application?
**Model Answer:**  
The backend acts as the secure intermediary between the client browser and the database. It listens on port 3000, receives HTTP requests, validates incoming student data, enforces business rules (such as unique USNs and valid semesters 1–8), queries MongoDB using the native driver, and returns appropriate HTTP status codes and JSON responses.  
*Key terms: API endpoints, validation, security, connection pooling, business logic.*

---

### Q6. Why is MongoDB used in this project?
**Model Answer:**  
MongoDB is used because:
1. It is a document-oriented NoSQL database that stores data natively in JSON-like BSON documents, matching JavaScript data structures seamlessly.
2. It offers high read/write performance and flexible schemas.
3. It integrates naturally with Node.js through the official MongoDB driver, allowing persistent storage across application restarts.  
*Key terms: NoSQL, document database, BSON, persistence, scalability.*

---

### Q7. What is an API?
**Model Answer:**  
An **API (Application Programming Interface)** is a formal set of rules, protocols, and endpoints that allows different software applications to communicate with each other. In this lab, our Express REST API enables the frontend browser application to perform CRUD operations on the MongoDB database using standard HTTP methods.  
*Key terms: Interface, communication contract, REST, HTTP endpoints.*

---

### Q8. What is the purpose of the `fetch()` function in JavaScript?
**Model Answer:**  
`fetch()` is a built-in browser API used to make asynchronous network HTTP requests. It returns a JavaScript `Promise` that resolves to the `Response` object, allowing the frontend to send data (POST/PUT/DELETE) and retrieve data (GET) from backend servers without causing a full page refresh.  
*Key terms: Asynchronous, Promises, async/await, AJAX, HTTP request.*

---

### Q9. What is the difference between GET and POST methods?
**Model Answer:**  
- **GET:** Used to **retrieve** data from the server. Parameters are passed in the URL query string, data is cached by browsers, and it has no request body. It is idempotent and safe.
- **POST:** Used to **send/create** new data on the server. Data is transmitted securely inside the HTTP request body (e.g., as JSON), it is not cached, and it alters database state.  
*Key terms: URL query vs body, idempotent, cacheable, resource creation.*

---

### Q10. Which HTTP methods are used for CRUD operations?
**Model Answer:**  
- **Create:** `POST` (e.g., `POST /students` creates a new student)
- **Read:** `GET` (e.g., `GET /students` reads all students, `GET /students/:id` reads one)
- **Update:** `PUT` or `PATCH` (e.g., `PUT /students/:id` updates an existing student)
- **Delete:** `DELETE` (e.g., `DELETE /students/:id` removes a student)  
*Key terms: CRUD to HTTP mapping, REST conventions.*

---

### Q11. What happens when you click the "Add Student" button?
**Model Answer:**  
1. The browser's submit event fires; `event.preventDefault()` stops the page from reloading.
2. JavaScript collects values from the input fields and validates them.
3. JavaScript calls `fetch('/students', { method: 'POST', body: JSON.stringify(...) })`.
4. Express receives the request, validates the fields, and calls `studentsCollection.insertOne()`.
5. MongoDB stores the document and assigns an `_id`.
6. Express responds with HTTP `201 Created` and the new student object.
7. JavaScript displays a success notification and calls `loadStudents()` to re-render the table.  
*Key terms: preventDefault, JSON payload, insertOne, 201 Created, DOM re-render.*

---

### Q12. What happens when you click the "View Students" button (or load the page)?
**Model Answer:**  
1. Client JavaScript triggers `fetch('/students', { method: 'GET' })`.
2. Express invokes `studentsCollection.find({}).toArray()`.
3. MongoDB retrieves matching documents from disk.
4. Express returns the array as JSON with status `200 OK`.
5. JavaScript parses the response and iterates through the array, safely generating HTML `<tr>` elements for each student and updating the count badge.  
*Key terms: GET request, find().toArray(), 200 OK, dynamic table generation.*

---

### Q13. How does the frontend communicate with MongoDB?
**Model Answer:**  
The frontend **never communicates directly with MongoDB** for security reasons. Instead, communication follows an indirect three-tier flow:  
`Frontend Browser --(HTTP / JSON via fetch)--> Express Backend --(TCP wire protocol via MongoClient)--> MongoDB`.  
The backend acts as an authenticated gatekeeper that validates requests before touching the database.  
*Key terms: Decoupled architecture, security, intermediary API, MongoClient.*

---

### Q14. What does “Server running on port 3000” mean?
**Model Answer:**  
It means the Node.js Express process has bound to network port `3000` on the local machine (`127.0.0.1`) and is actively listening for incoming TCP/HTTP connection requests. Any client navigating to `http://127.0.0.1:3000` will be routed to this application.  
*Key terms: Port binding, TCP listener, localhost/127.0.0.1, network socket.*

---

### Q15. Explain the complete data flow when a student is added to the system.
**Model Answer:**  
1. **User Action:** User fills out form and clicks submit.
2. **Client Processing:** Vanilla JS packages data into a JSON string and sends an HTTP `POST /students` request.
3. **Server Reception:** Express middleware (`express.json()`) parses the payload into `req.body`.
4. **Validation:** Server verifies required fields and checks semester range (1–8).
5. **Database Operation:** Server executes `await studentsCollection.insertOne(newStudent)`.
6. **Persistence:** MongoDB writes the BSON document to disk in `CollegeDB.students` and assigns a 12-byte `ObjectId`.
7. **Response:** Express sends back HTTP `201 Created` with the saved document.
8. **UI Update:** Client JavaScript injects a new sanitized row into the DOM table and clears the form inputs.  
*Key terms: End-to-end data flow, serialization, deserialization, persistence.*

---

### Q16. What is the purpose of Node.js in this project?
**Model Answer:**  
Node.js is an open-source, cross-platform JavaScript runtime environment built on Google Chrome's V8 engine. It allows JavaScript to execute outside the browser on the server side, providing capabilities such as file system access, network listening, and database driver communication.  
*Key terms: V8 engine, server-side JavaScript, asynchronous event-driven runtime.*

---

### Q17. Why is Express.js used in the backend?
**Model Answer:**  
Express is a fast, unopinionated, minimalist web framework for Node.js. It simplifies building web servers by providing robust utilities for:
- Route handling (`app.get`, `app.post`, `app.put`, `app.delete`).
- Middleware integration (`cors()`, `express.json()`, `express.static()`).
- Reading URL parameters (`req.params`) and query strings (`req.query`).
- Sending structured HTTP responses and status codes (`res.status(201).json(...)`).  
*Key terms: Web framework, middleware, routing, REST API development.*

---

### Q18. What information is stored in a student document?
**Model Answer:**  
A student document in `CollegeDB.students` contains five fields:
1. `_id`: Unique BSON `ObjectId` automatically generated by MongoDB (Primary Key).
2. `name`: Student's full name (`String`, e.g., `"Rahul"`).
3. `usn`: Unique University Seat Number (`String`, e.g., `"1CS23CS001"`).
4. `semester`: Current semester (`Number` integer, 1 to 8).
5. `branch`: Department/branch name (`String`, e.g., `"CSE"`).  
*Key terms: BSON fields, ObjectId, unique identifier, schema consistency.*

---

### Q19. What is the purpose of the `node_modules` folder?
**Model Answer:**  
The `node_modules` folder contains all the downloaded third-party packages, libraries, and transitive dependencies installed via `npm install` (such as `express`, `mongodb`, and `cors`). Because this folder is very large and can be regenerated at any time using `npm install` from `package.json`, it is always added to `.gitignore` and excluded from Git version control.  
*Key terms: Dependencies, npm packages, package.json, .gitignore.*

---

### Q20. How can you verify that the student data has been successfully stored and retrieved?
**Model Answer:**  
Data storage and retrieval can be verified in four independent ways:
1. **Frontend UI:** The student appears in the HTML table immediately and persists after a hard browser reload (`Ctrl + F5`).
2. **MongoDB Shell (`mongosh`):** Running `use CollegeDB` followed by `db.students.find({ usn: "..." })` returns the stored document.
3. **MongoDB Compass:** Launching Compass GUI, opening `CollegeDB` -> `students`, and viewing the document card.
4. **Postman / cURL:** Sending `GET http://127.0.0.1:3000/students` returns the stored document in the JSON response array.  
*Key terms: Persistence verification, mongosh, Compass GUI, Postman, hard reload.*
