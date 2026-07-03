# Campusly — Student Management System

A full-stack, role-based Student Management System built with **React + Tailwind CSS** on the
frontend and **Node.js + Express + MongoDB** on the backend. Built as a portfolio project to
demonstrate practical MERN-stack skills: JWT authentication, role-based access control, REST
API design, file uploads, and OCR integration.

## ✨ Core features

| Module | What it does |
|---|---|
| **Multi-role auth** | Super Admin → Section Admin → Faculty / Student / Parent, enforced both in the API (middleware) and the UI (route guards) |
| **Student login by admission number** | Students sign in with their admission number instead of an email |
| **Section-scoped admin control** | Super Admin creates Section Admins and assigns them a section (e.g. `CSE`, `Library`, `Hostel`); Section Admins can only manage accounts/records inside their own section |
| **Library** | Book catalogue, issue/return workflow, automatic overdue fine calculation |
| **Hostel** | Room inventory, capacity tracking, student allocation/vacation history |
| **OCR document verification** | Upload ID proofs / marksheets / certificates as images; text is extracted automatically with Tesseract.js and queued for admin verification |
| **Attendance** | Faculty mark daily attendance per subject; students/parents see a running percentage |
| **Grades & performance** | Marks entry with automatic letter-grade computation (A+ to F) and an overall percentage on the student dashboard |
| **Weekly timetable** | Per-department, per-day class schedule with subject, timing, and faculty name |
| **Events & holidays** | College-wide calendar, filterable by upcoming/past |

## 🏗 Role hierarchy

```
Super Admin
 ├── creates & manages Section Admins, and (directly) any Faculty/Student/Parent
 └── Section Admin (scoped to one section, e.g. "CSE" or "Library")
      ├── creates & manages Faculty, Students, Parents within that section only
      ├── Faculty        → marks attendance, records grades, views timetable
      ├── Student        → logs in via admission number, read-only dashboard
      └── Parent         → linked to a student, read-only view of their ward
```

This is enforced twice: server-side via `middleware/auth.js` (`authorize`, `scopeToSection`)
so the API itself can't be bypassed, and client-side via `ProtectedRoute` + the role-aware
sidebar so users only ever see actions available to them.

## 🗂 Project structure

```
student-management-system/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── models/                 # Mongoose schemas (User, Book, HostelRoom, Attendance, Grade, Document, Timetable, Event...)
│   ├── middleware/              # JWT auth, role authorization, file upload (multer)
│   ├── controllers/            # Business logic per module
│   ├── routes/                 # Express routers
│   ├── utils/                  # JWT signing, OCR service (tesseract.js)
│   ├── seed/seed.js             # Creates sample accounts for every role
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/axios.js          # Axios instance with JWT interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/           # Sidebar, Navbar, ProtectedRoute, StatCard, Loader
    │   ├── layouts/DashboardLayout.jsx
    │   └── pages/                # Login, Dashboard, Users, Library, Hostel, Attendance, Grades, Documents, Timetable, Events
    └── tailwind.config.js
```

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or an Atlas connection string)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI / JWT_SECRET if needed
npm run seed               # creates sample accounts for every role (see below)
npm run dev                 # starts the API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env       # points to the backend API
npm run dev                 # starts the app on http://localhost:5173
```

### Sample logins (created by `npm run seed`)

| Role | Identifier | Password |
|---|---|---|
| Super Admin | `superadmin@college.edu` | `Super@123` |
| Section Admin (CSE) | `cseadmin@college.edu` | `Admin@123` |
| Section Admin (Library) | `library@college.edu` | `Admin@123` |
| Faculty | `ramesh.faculty@college.edu` | `Faculty@123` |
| Student | `CSE2024001` (admission no.) | `Student@123` |
| Parent | `sunita.parent@college.edu` | `Parent@123` |

## 🔌 Key API endpoints

```
POST   /api/auth/login                 { identifier, password }
GET    /api/auth/me

POST   /api/users                      create account (role-restricted)
GET    /api/users                      list accounts (scoped by role)

GET    /api/library/books
POST   /api/library/issue
PUT    /api/library/return/:id

GET    /api/hostel/rooms
POST   /api/hostel/allocate

POST   /api/attendance/mark
GET    /api/attendance/student/:id?

POST   /api/grades
GET    /api/grades/student/:id?

POST   /api/documents/upload           multipart/form-data, runs OCR async
GET    /api/documents/pending          admin queue for verification

GET    /api/timetable?department=CSE
POST   /api/events
```

## 🛠 Tech stack

- **Frontend:** React 18 (Vite), React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JSON Web Tokens, bcrypt password hashing
- **File handling:** Multer (uploads), Tesseract.js (OCR — no external API key needed)

## 📌 Notes & next steps for extending this further

- The "Student IDs" fields in Attendance/Library/Hostel forms are intentionally simple text
  inputs for this minimal build — swap in a searchable student picker for production use.
- Add pagination to the account/document lists once data volume grows.
- The OCR pipeline currently supports JPG/PNG; add a PDF-to-image conversion step
  (e.g. `pdf-poppler`) to support scanned PDF uploads.
- Consider adding refresh tokens and email verification for a production deployment.
