# 🏨 Hostel Booking System - Server

A robust and scalable backend API for the Hostel Booking System built with **Node.js**, **Express 5**, and **MongoDB**. This server handles authentication, student bookings, admin operations, payments, and comprehensive hostel inventory management.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Server](#running-the-server)
- [Database Structure](#database-structure)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Project Structure](#project-structure)
- [Utilities & Helpers](#utilities--helpers)
- [Error Handling](#error-handling)
- [Middleware](#middleware)
- [Seeding Data](#seeding-data)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The **Hostel Booking System Server** is a comprehensive backend API providing:

### Core Functionality
- **Authentication** - Secure JWT-based authentication for students and admins
- **Hostel Management** - Complete CRUD operations for hostels and rooms
- **Booking System** - FCFS (First Come First Serve) booking with pending/confirmed states
- **Payment Processing** - Integration-ready payment flow management
- **Admin Controls** - System administration and inventory management
- **Room Import** - Bulk room import via Excel files
- **Booking Windows** - Time-based booking control and scheduling
- **Room Swaps** - Facilitate student room exchanges

### Key Features
- Two separate databases (AuthDB, HostelDB) for data segregation
- JWT authentication with cookie and bearer token support
- Role-based access control (student, admin, mainadmin)
- Comprehensive error handling and validation
- Async request handling with proper error propagation
- XLSX file upload and parsing for bulk room imports
- Booking state management (pending, confirmed, expired, cancelled)
- Real-time booking counters and tracking

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 19+ | JavaScript runtime environment |
| **Express** | ^5.2.1 | Web framework for routing and middleware |
| **MongoDB** | - | NoSQL database for data storage |
| **Mongoose** | ^9.4.1 | MongoDB object modeling and validation |
| **JWT** | ^9.0.3 | JSON Web Token for authentication |
| **bcryptjs** | ^3.0.2 | Password hashing and verification |
| **Multer** | ^2.1.1 | File upload handling middleware |
| **XLSX** | ^0.18.5 | Excel file parsing for room imports |
| **dotenv** | ^17.4.0 | Environment variable management |
| **CORS** | ^2.8.6 | Cross-Origin Resource Sharing |
| **Cookie-Parser** | ^1.4.7 | Cookie parsing middleware |
| **Nodemon** | ^3.1.14 | Development auto-restart tool |

---

## 🏗️ Architecture

### Database Architecture

**Two MongoDB Databases:**

1. **AuthDB** - Authentication and user profiles
   - Admin users and credentials
   - Student users and credentials
   - User authentication records

2. **HostelDB** - Hostel operations and bookings
   - Hostel configurations
   - Room inventory
   - Room pricing information
   - Booking records
   - Booking windows (FCFS timing)
   - Counters (for ID generation)

### Authentication Architecture

- **JWT Tokens** - Stateless authentication
- **Access Token** - Short-lived, contains user identity and role
- **Cookie Storage** - HttpOnly cookies for security
- **Bearer Token** - Alternative header-based authentication
- **Token Versioning** - Invalidate tokens on logout

### Booking Architecture

- **States** - PENDING → CONFIRMED (or EXPIRED/CANCELLED)
- **FCFS Tracking** - Virtual queue with booking windows
- **Hold Period** - 10-minute berth lock to complete booking
- **Counters** - Track booking sequences and IDs
- **Payment Integration** - Link bookings to payments

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** v19+ ([Download](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)
- **Git** v2+ ([Download](https://git-scm.com/))
- **MongoDB** (local or Atlas cloud)

### Verify Prerequisites

```bash
node --version    # Should be v19+
npm --version     # Should be v9+
git --version     # Should be v2+
```

### Clone and Setup

#### 1. Clone Repository

```bash
git clone https://github.com/Bharat-dixit-0512/Hostel-Booking-System.git
cd Hostel-Booking-System/server
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Create Environment File

```bash
# Copy example (if available)
cp .env.example .env

# Or create new .env file
touch .env
```

#### 4. Configure Environment Variables

Edit `.env` with your settings (see [Environment Configuration](#environment-configuration))

#### 5. Seed Database (Optional)

```bash
# Seed both auth data and hostels
npm run seed:auth

# Or seed specific data
npm run seed:auth:admins
npm run seed:auth:students
```

---

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRE=7d
COOKIE_SECRET=your-cookie-secret-key

# CORS Configuration
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development`, `production` |
| `MONGODB_URI` | Database connection string | `mongodb+srv://user:pass@cluster...` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your-secret-key-here` |
| `JWT_EXPIRE` | Token expiration time | `7d`, `24h`, `1w` |
| `COOKIE_SECRET` | Cookie signing secret | `cookie-secret-key` |
| `CLIENT_URL` | Frontend URL for redirects | `http://localhost:5173` |
| `CORS_ORIGIN` | Comma-separated allowed origins | `http://localhost:5173,http://localhost:3000` |

### Environment Profiles

**Development:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/
JWT_SECRET=dev-secret-key-min-32-characters-long
JWT_EXPIRE=7d
COOKIE_SECRET=dev-cookie-secret
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**Production:**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster...
JWT_SECRET=prod-secret-key-min-32-characters-long
JWT_EXPIRE=7d
COOKIE_SECRET=prod-cookie-secret
CLIENT_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

---

## ▶️ Running the Server

### Development Mode

```bash
npm run dev
```

Starts server with Nodemon auto-restart on file changes.

### Production Mode

```bash
npm start
```

Starts server with Node (no auto-restart).

### Server Output

```
Server running on port 5000
MongoDB connection successful
```

### Verify Server Health

```bash
# In another terminal
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy"
}
```

---

## 💾 Database Structure

### AuthDB Collections

#### `AuthAdmin`
- `employee_id` (String) - Unique employee identifier
- `name` (String) - Admin name
- `email` (String) - Unique email address
- `password` (String, hashed) - Encrypted password
- `role` (String) - `mainadmin` or `subadmin`
- `token_version` (Number) - For token invalidation

#### `AuthStudent`
- `roll_number` (Number) - Unique student ID
- `name` (String) - Student name
- `email` (String) - Unique email address
- `password` (String, hashed) - Encrypted password
- `year` (String) - `1st`, `2nd`, `3rd`, `4th`
- `gender` (String) - `male` or `female`
- `residence` (String) - `hostler` or `dayscholar`
- `phone` (String) - Contact number

### HostelDB Collections

#### `Hostel`
- `hostel_id` (Number) - Unique hostel identifier
- `hostel_name` (String) - Hostel name
- `gender` (String) - Hostel gender type (`male`, `female`)
- `floors` (Number) - Number of floors

#### `Room`
- `room_number` (String) - Room identifier
- `hostel_id` (Number) - Parent hostel ID
- `capacity` (Number) - Room capacity (1-3)
- `ac_type` (Boolean) - Air conditioned or not
- `floor` (Number) - Floor number
- `is_available` (Boolean) - Availability status

#### `Booking`
- `roll_number` (Number) - Student roll number
- `hostel_id` (Number) - Booked hostel
- `room_number` (String) - Booked room
- `room_capacity` (Number) - Room capacity at booking time
- `room_ac_type` (Boolean) - AC status at booking time
- `price` (Number) - Booking price
- `status` (String) - `PENDING`, `CONFIRMED`, `EXPIRED`, `CANCELLED`
- `source` (String) - `online` or `offline`
- `booked_by_type` (String) - `student` or `admin`
- `booked_by_id` (String) - ID of person who booked
- `payment_reference` (String) - Payment transaction ID
- `expires_at` (Date) - Pending booking expiration time
- `confirmed_at` (Date) - Confirmation timestamp
- `cancelled_at` (Date) - Cancellation timestamp

#### `BookingWindow`
- `key` (String) - "global_booking_window"
- `is_open` (Boolean) - Booking window status
- `opens_at` (Date) - Window open time
- `closes_at` (Date) - Window close time

#### `Counter`
- `_id` (String) - Counter identifier (e.g., "hostel_id")
- `sequence_value` (Number) - Current counter value

---

## 📡 API Documentation

### Authentication Endpoints

#### Login Student
```
POST /api/auth/student/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "login_type": "student",
      "roll_number": 12345,
      "name": "Student Name",
      "email": "student@example.com",
      "year": "2nd",
      "gender": "male"
    },
    "accessToken": "jwt-token-here"
  }
}
```

#### Login Admin
```
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "login_type": "admin",
      "employee_id": "EMP001",
      "name": "Admin Name",
      "email": "admin@example.com",
      "role": "mainadmin"
    },
    "accessToken": "jwt-token-here"
  }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "user": { user_object }
  }
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Hostel Endpoints

#### Get All Hostels
```
GET /api/hostels

Response (200):
{
  "success": true,
  "data": {
    "hostels": [...]
  }
}
```

#### Get Hostel Rooms
```
GET /api/hostels/:hostelId/rooms

Response (200):
{
  "success": true,
  "data": {
    "rooms": [...]
  }
}
```

### Booking Endpoints

#### Create Booking
```
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "hostel_id": 1,
  "room_number": "101"
}

Response (201):
{
  "success": true,
  "data": {
    "booking": { booking_object }
  }
}
```

#### Get My Bookings
```
GET /api/bookings/me
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "bookings": [...]
  }
}
```

#### Cancel Booking
```
PUT /api/bookings/:id/cancel
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "booking": { updated_booking }
  }
}
```

### Payment Endpoints

#### Create Payment Session
```
POST /api/payments/create-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": "booking-object-id",
  "amount": 5000
}

Response (201):
{
  "success": true,
  "data": {
    "session_id": "payment-session-id"
  }
}
```

#### Confirm Payment
```
POST /api/payments/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": "booking-object-id",
  "session_id": "payment-session-id"
}

Response (200):
{
  "success": true,
  "data": {
    "booking": { updated_booking }
  }
}
```

#### Check Payment Status
```
GET /api/payments/:id/status
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "status": "completed"
  }
}
```

### Admin Endpoints (require admin login)

#### Get All Hostels (Admin)
```
GET /api/admin/hostels
Authorization: Bearer <admin-token>
```

#### Get All Bookings (Admin)
```
GET /api/admin/bookings
Authorization: Bearer <admin-token>
```

#### Create Manual Booking
```
POST /api/admin/offline-bookings
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "roll_number": 12345,
  "hostel_id": 1,
  "room_number": "101"
}
```

#### Get Booking Window
```
GET /api/admin/booking-window
Authorization: Bearer <admin-token>
```

#### Update Booking Window
```
PATCH /api/admin/booking-window
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "is_open": true,
  "opens_at": "2026-04-20T08:00:00Z",
  "closes_at": "2026-04-20T20:00:00Z"
}
```

#### Import Rooms
```
POST /api/admin/hostels/:hostelId/rooms/import/preview
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

File: rooms.xlsx
```

---

## 🔐 Authentication & Authorization

### JWT Authentication

**Flow:**
1. User logs in with email/password
2. Server validates credentials against respective database
3. Server generates JWT token with user info and role
4. Token returned to client
5. Client includes token in subsequent requests
6. Server validates token on protected routes

**Token Structure:**
```javascript
{
  login_type: "student" | "admin",
  roll_number: Number,        // For students
  employee_id: String,        // For admins
  name: String,
  email: String,
  role: String,               // For admins
  token_version: Number,
  iat: Timestamp,
  exp: Timestamp
}
```

### Authorization Levels

| User Type | Routes | Permissions |
|-----------|--------|-------------|
| **Student** | `/api/bookings`, `/api/hostels`, `/api/payments` | Create bookings, view rooms, make payments |
| **Admin (subadmin)** | `/api/admin/*` (except reset) | Manage applications, view analytics, approve swaps |
| **Admin (mainadmin)** | `/api/admin/*` | All admin operations + hostel management + system reset |

### Protected Routes Middleware

```javascript
app.use(protect);  // Requires valid JWT
app.use(authorizeLoginTypes("student", "admin"));  // Role check
```

---

## 📁 Project Structure

```
server/
├── src/
│   ├── app.js                   # Express app configuration
│   ├── server.js                # Server entry point
│   ├── constants.js             # Global constants
│   ├── controllers/             # Request handlers
│   │   ├── auth.controller.js            # Login, logout, auth
│   │   ├── booking.controller.js         # Booking operations
│   │   ├── hostel.controller.js          # Hostel management
│   │   ├── room.controller.js            # Room management
│   │   ├── payment.controller.js         # Payment handling
│   │   └── admin.controller.js           # Admin operations
│   ├── routes/                  # API route definitions
│   │   ├── auth.routes.js
│   │   ├── booking.routes.js
│   │   ├── hostel.routes.js
│   │   ├── room.routes.js
│   │   ├── payment.routes.js
│   │   └── admin.routes.js
│   ├── models/                  # Mongoose schemas
│   │   ├── authAdmin.model.js
│   │   ├── authStudent.model.js
│   │   ├── booking.model.js
│   │   ├── bookingWindow.model.js
│   │   ├── counter.model.js
│   │   ├── hostel.model.js
│   │   ├── room.model.js
│   │   └── hostelStudent.model.js
│   ├── middlewares/             # Express middleware
│   │   ├── auth.middleware.js           # JWT verification
│   │   └── error.middleware.js          # Error handling
│   ├── db/                      # Database configuration
│   │   └── index.js             # Connection, model registration
│   ├── utils/                   # Utility functions
│   │   ├── ApiError.js          # Custom error class
│   │   ├── ApiResponse.js       # Standard response format
│   │   ├── asyncHandler.js      # Async error wrapper
│   │   ├── jwt.js               # JWT operations
│   │   ├── password.js          # Password hashing
│   │   ├── booking.utils.js     # Booking logic
│   │   ├── counter.utils.js     # Counter management
│   │   ├── excel.utils.js       # Excel parsing
│   │   └── roomImport.utils.js  # Room import logic
│   └── scripts/                 # Seed scripts
│       ├── seedAuthDb.js
│       ├── seedAdmins.js
│       └── seedStudents.js
├── package.json                 # Dependencies
├── .env.example                 # Example environment file
└── README.md                    # This file
```

---

## 🛠️ Utilities & Helpers

### ApiError
Custom error class for consistent error responses:
```javascript
throw new ApiError(400, "Validation failed");
```

### ApiResponse
Standard response format:
```javascript
new ApiResponse(200, { data }, "Success message")
```

### asyncHandler
Wrapper for async route handlers:
```javascript
export const handler = asyncHandler(async (req, res) => {
  // Errors automatically caught and passed to error middleware
});
```

### JWT Utils
- `signAccessToken()` - Create JWT token
- `verifyAccessToken()` - Validate JWT token
- `setAuthCookie()` - Set secure cookie
- `clearAuthCookie()` - Clear authentication cookie

### Password Utils
- `hashPassword()` - Hash password with bcrypt
- `verifyPassword()` - Verify password against hash

### Booking Utils
- `createPendingStudentBooking()` - Create new booking
- `releaseExpiredPendingBookings()` - Clear expired bookings
- `cancelStudentBooking()` - Cancel active booking

### Counter Utils
- `getNextSequenceValue()` - Get next ID for entities
- `incrementCounter()` - Increment counter value

---

## ⚠️ Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Booking created |
| 201 | Created | New resource created |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid credentials |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

### Error Middleware

All errors are caught and standardized:
```javascript
app.use(errorHandler);  // Centralized error handling
```

---

## 🔌 Middleware

### Authentication Middleware
- Verifies JWT token from cookies or headers
- Attaches user info to request
- Denies access without valid token

### Authorization Middleware
- Checks user login type and role
- Grants/denies route access based on permissions

### Error Middleware
- Catches all errors
- Formats error responses
- Logs errors for debugging

---

## 📊 Seeding Data

### Seed All Data
```bash
npm run seed:auth
```

Creates sample:
- Admin users
- Student users
- Hostels
- Rooms
- Booking window

### Seed Admin Only
```bash
npm run seed:auth:admins
```

### Seed Students Only
```bash
npm run seed:auth:students
```

**Default Seed Data:**
- 2 admin users (mainadmin, subadmin)
- 10 student users
- 2 hostels (male, female)
- 20 rooms per hostel

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Verify `MONGODB_URI` in `.env`
- Ensure MongoDB is running
- Check network connectivity
- Verify credentials (for Atlas)

### Port Already in Use
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti :5000 | xargs kill -9
```

### JWT Token Errors
- Verify `JWT_SECRET` is configured
- Check token hasn't expired
- Verify token format in headers

### CORS Errors
- Verify `CORS_ORIGIN` includes frontend URL
- Check `CLIENT_URL` configuration
- Clear browser cache

### Database Errors
- Verify collections are created
- Check MongoDB indexes
- Run seed scripts if needed
- Verify database permissions

---

## 🤝 Contributing

### Code Standards
- Use consistent error handling
- Follow existing code patterns
- Add comments for complex logic
- Test with different scenarios

### Git Workflow
1. Create feature branch
2. Make changes with clear commits
3. Test thoroughly
4. Create Pull Request
5. Get review and merge

---

## 📞 Support

- Check troubleshooting section
- Review API documentation
- Check server logs
- Create GitHub issue

---

## 📄 License

ISC

---

**Last Updated:** April 2026  
**Version:** 1.0.0

    routes/
    scripts/
    utils/
  .env.example
  package.json
  README.md
```

## Notes

- This README reflects routes currently implemented in src/routes.
- Removed old docs for /api/admin/users endpoints because those routes are not present in the current code.

## License

ISC
