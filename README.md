# 🛡️ School Trip Tracking System

A real-time web application for managing and tracking students during school trips.  
The teacher can view each student's location on a live map, receive alerts if a student wanders too far, and manage the class roster.

---

## 🗂️ Project Structure

```
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
```

---


## 🛠️ Prerequisites



## 🗄️ Database Setup

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
```
##  Running the Project

### Step 1 — Install Dependencies

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
<img width="1423" height="703" alt="image" src="https://github.com/user-attachments/assets/b06c78de-4a5f-4fc5-882b-9cbd18b39b74" />
You can register with id 111111111
<img width="1407" height="845" alt="image" src="https://github.com/user-attachments/assets/1e9fafe9-d9eb-43c0-8449-2ee7b7a72e99" />
For the simulation, each student receives a random location and every 20 seconds the location is updated and moves a little, and once every 2 minutes or so a student moves more than 3 kilometers away from the teacher, and then the teacher can call her back to come closer. The teacher has a history of how far away each student has moved.
<img width="769" height="502" alt="image" src="https://github.com/user-attachments/assets/a7f0be41-2e4e-44ff-8c9e-ed1043de2943" />
<img width="957" height="731" alt="image" src="https://github.com/user-attachments/assets/65f718f3-fff3-4b73-a357-319940d243ae" />
<img width="615" height="205" alt="image" src="https://github.com/user-attachments/assets/eec344fe-2613-4e8d-8f41-8b5c0c1fd2c1" />

## 📖 How to Use

1. **Register** — Click "Register", enter your full name, ID number, and class
2. **Login** — Click "Login", enter the ID number of a registered teacher
3. **Add Students** — From the dashboard, enter a student's name and ID (class is set automatically)
4. **Live Map** — Scroll down on the dashboard to see student locations in real time
5. **Alerts** — If a student moves more than 3 km away, a red alert appears above the map
##  Tech Stack

**Frontend:**
- React 19
- Vite
- React-Leaflet + Leaflet (maps)

**Backend:**
- Node.js + Express
- mssql / msnodesqlv8
- SQL Server Express

---

## ⚠️ Important Notes

- The simulation (`simulation.js`) fakes movement for 3 students for development purposes only — remove it in production
- The simulation student IDs are: `333333333`, `444444444`, `555555555` — they must exist in the database (inserted by `seed.js`)
- The database connection uses Windows Authentication — no username or password required
