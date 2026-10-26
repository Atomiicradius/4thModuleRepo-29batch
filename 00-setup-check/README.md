# Setup check

Run this once, before Step 1, to make sure your computer is ready.

## Run it

🖥️ In the VS Code terminal, from the **top folder** of the lab:

```powershell
node 00-setup-check/check-setup.js
```

✅ You should see something like this (versions will differ):

```
[ PASS ] Node.js Runtime
[ PASS ] Node Package Manager (npm)
[ PASS ] MongoDB Shell (mongosh) - optional
[ PASS ] Postman API Client
[ PASS ] MongoDB Server (Port 27017)
Summary: 5 of 5 checks passed.
```

The **mongosh** line is optional. If it says "not installed", that is fine: you use the **`>_ MONGOSH`** bar inside MongoDB Compass instead.

## If a line says FAIL

| FAIL line | What it means | Fix |
| :--- | :--- | :--- |
| **Node.js Runtime** | Node is missing or too old | Install Node 22 or 24 from the installer folder, then **close and reopen VS Code** |
| **npm** | npm is not found | Reinstall Node and keep "Add to PATH" ticked, then reopen VS Code |
| **MongoDB Server (Port 27017)** | The database is not running | Open **PowerShell as Administrator** and run `net start MongoDB`. If it says the service does not exist, MongoDB was not installed as a service: reinstall and keep "Install MongoDB as a Service" ticked |
| **Postman** | Postman is not installed | Install it from the installer folder |

After any fix, run the check again.
