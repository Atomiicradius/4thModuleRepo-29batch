# Step 2: Connect your Node.js server to MongoDB

⏱ About 20 minutes · 🖥️ VS Code terminal · 🌐 Browser · 🍃 Compass shell

**You will:** run a server that connects to MongoDB, then make two small changes of your own.

**The idea:** the server connects to the database **once**, when it starts, and reuses that connection for every request. (We write `127.0.0.1` instead of `localhost` because on Windows `localhost` can be slow.)

---

## Part 1: Run the server

**1. Go to the Step 2 folder.** 🖥️ From the top folder of the lab:

```powershell
cd 02-connect-backend/start
```

**2. Start the server.** 🖥️

```powershell
node server.js
```

✅ You should see exactly two lines:

```
Connected to MongoDB
Server running on port 3000
```

> `Cannot find module 'express'`? Go to the top folder (`cd ../..`) and run `npm install --omit=dev`, then come back.
> `ECONNREFUSED`? MongoDB is not running. See **Stuck?** below.

**3. Open the server in your browser.** 🌐

```
http://127.0.0.1:3000/
```

✅ You should see JSON like this (the time will be different):

```json
{"status":"ok","message":"Hello from YOUR NAME's server connected to CollegeDB","time":"10:15:02 AM","database":"CollegeDB"}
```

**4. Read the code.** In VS Code open `server.js`. It has three parts, top to bottom:

| Part | What it does |
| :--- | :--- |
| `require('mongodb')` and `MONGO_URI` | Loads the MongoDB driver and says where the database is |
| `let db; let studentsCollection;` | Boxes for the connection. They sit **outside** every function so every route can use them |
| `startServer()` | Connects once, **fills the boxes without `const`/`let`**, then starts listening |

---

## Your turn

### Task 1: Put your name in the message

1. In `server.js`, find this line (use `Ctrl + F` and search `YOUR NAME`):

   ```javascript
   const YOUR_NAME = 'YOUR NAME';
   ```

2. Replace `YOUR NAME` with your own name (keep the quotes). Example: `const YOUR_NAME = 'Asha';`
3. Save the file (`Ctrl + S`).
4. Restart the server. 🖥️ Click in the terminal, press `Ctrl + C`, then run:

   ```powershell
   node server.js
   ```

5. Reload `http://127.0.0.1:3000/` 🌐

✅ The message now says `Hello from Asha's server connected to CollegeDB` (with your name).

### Task 2: Make the server write to MongoDB

1. In `server.js`, find the line `// ───── TASK 2 ─────` (search `TASK 2`).
2. Select every line **between** `TASK 2` and `END TASK 2`: click on the first `// app.get(` line, then hold `Shift` and click on the last `// });` line.
3. Press `Ctrl + /` (Mac: `Cmd + /`). The `//` disappears from every selected line.
4. Save, then restart the server (`Ctrl + C`, then `node server.js`). 🖥️
5. Open this address, then **reload it 3 times**: 🌐

   ```
   http://127.0.0.1:3000/ping-db
   ```

   ✅ Each time you see JSON with a different `insertedId`:

   ```json
   {"status":"ok","message":"Ping document written to CollegeDB.pings collection!","insertedId":"6adfcdd8493340f8e381d7cc"}
   ```

6. Now look inside the database. 🍃 In the Compass shell:

   ```javascript
   use("CollegeDB")
   ```

   ```javascript
   db.getCollectionNames()
   ```

   ✅ The list now includes `'pings'`. Nobody created it: MongoDB made it the first time your code wrote to it.

   ```javascript
   db.pings.find()
   ```

   ✅ You see **3 documents** (one per reload), each with `ping: 'pong'`, your name as `author`, and a `timestamp`.

   > The `Z` at the end of the timestamp means UTC time, which is 5 hours 30 minutes behind India time.

---

## Done when

- [ ] The terminal printed `Connected to MongoDB` and `Server running on port 3000`
- [ ] `http://127.0.0.1:3000/` shows **your name**
- [ ] `/ping-db` worked, and `db.pings.find()` shows one document per reload

---

## Stuck?

| What you see | Why | Fix |
| :--- | :--- | :--- |
| `{"error":"db is not defined"}` at `/ping-db` | `db` was created **inside** `startServer()` with `const` | At the top declare `let db;` and `let studentsCollection;`. Inside `startServer()` write `db = client.db(DB_NAME);` with **no `const`**. Then restart |
| `Cannot GET /ping-db` | TASK 2 is not switched on, or you did not restart | Do Task 2 steps 3 and 4 again |
| The page still shows `YOUR NAME` | You did not save, or did not restart the server | `Ctrl + S`, then `Ctrl + C` and `node server.js` |
| `EADDRINUSE: address already in use :::3000` | An old server is still running | `Ctrl + C` in its terminal, or see **Stop a server** in the top README |
| `ECONNREFUSED 127.0.0.1:27017` | The MongoDB service is stopped | **PowerShell as Administrator**: `net start MongoDB` |
| `Cannot find module 'express'` | Packages are not installed | `cd ../..` then `npm install --omit=dev` |
| Everything looks broken | | Copy the finished code (see **Fell behind?** in the top README) |
