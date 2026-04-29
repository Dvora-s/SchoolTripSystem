#  School Trip Tracking System

A real-time web application for managing and tracking students during school trips.  
The teacher can view each student's location on a live map, receive alerts if a student wanders too far, and manage the class roster.

# Project Structure

SchoolTripSystem/
├── client/          # Frontend - React + Vite
│   └── src/
│       ├── api/         # Server communication layer
│       └── components/  # Components: forms, map, teacher dashboard
└── server/          # Backend - Node.js + Express
    ├── config/          # Database connection
    ├── controllers/     # Business logic
    ├── routes/          # API route definitions
    ├── simulation.js    # Location simulation for development
    └── seed.js          # Seed script for demo data

# Features

- **Teacher Registration** — Register with full name, ID number, and class
- **Login** — Sign in using your ID number
- **Student Management** — Add students to your class directly from the dashboard
- **Live Map** — Student locations update every 10 seconds
- **Name Labels** — Each student's name is displayed above their marker on the map
- **Distance Alerts** — Automatic alert if a student moves more than 3 km away from the teacher


## Database Setup

Open **SQL Server Management Studio** (or any similar tool) and run the following script to create the database and tables:

```sql
CREATE DATABASE SchoolTripDB;
GO

USE SchoolTripDB;
GO

CREATE TABLE Teachers (
    ID        VARCHAR(9)    PRIMARY KEY,
    FullName  NVARCHAR(100) NOT NULL,
    ClassName NVARCHAR(10)  NOT NULL
);

CREATE TABLE Students (
    ID        VARCHAR(9)    PRIMARY KEY,
    FullName  NVARCHAR(100) NOT NULL,
    ClassName NVARCHAR(10)  NOT NULL
);

# Running the Project:

#Step 1 — Install Dependencies

Open two separate terminal windows:

**Terminal 1 — Server:**
```bash
cd server
npm install
```

**Terminal 2 — Client:**
```bash
cd client
npm install
```

---

### Step 2 — Seed the Database (once only)

This script inserts 3 demo students used by the location simulation.  
Run from inside the `server` folder:

```bash
node seed.js
```

---

### Step 3 — Start the App

**Terminal 1 — Start the server:**
```bash
cd server
node index.js
```
Server runs at: `http://localhost:3001`

**Terminal 2 — Start the client:**
```bash
cd client
npm run dev
```
App runs at: `http://localhost:5173`

---

## 📖 How to Use

1. **Register** — Click "Register", enter your full name, ID number, and class
2. **Login** — Click "Login", enter the ID number of a registered teacher
3. **Add Students** — From the dashboard, enter a student's name and ID (class is set automatically)
4. **Live Map** — Scroll down on the dashboard to see student locations in real time
5. **Alerts** — If a student moves more than 3 km away, a red alert appears above the map


# Tech Stack

**Frontend:**
- React 19
- Vite
- React-Leaflet + Leaflet (maps)

**Backend:**
- Node.js + Express
- mssql / msnodesqlv8
- SQL Server Express

# Important Notes

- The simulation (`simulation.js`) fakes movement for 3 students for development purposes only — remove it in production
- The simulation student IDs are: `333333333`, `444444444`, `555555555` — they must exist in the database (inserted by `seed.js`)
- The database connection uses Windows Authentication — no username or password required
