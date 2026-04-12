# Hostel Booking System - Server

This is the backend server for the Hostel Booking System, responsible for handling all business logic, data storage, authentication, and API endpoints for the application. It is built with Node.js, Express, and MongoDB, and is designed to be robust, secure, and scalable for managing hostel operations.

---

## Table of Contents
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [Database Seeding](#database-seeding)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Error Handling](#error-handling)
- [Development & Contribution](#development--contribution)
- [License](#license)

---

## Features
- **User Authentication:** Supports login and registration for both students and admins using JWT tokens. Passwords are securely hashed with bcrypt.
- **Role-Based Access Control:** Admins and students have different permissions and access to resources.
- **Hostel & Room Management:** Admins can create, update, and delete hostels and rooms, set room capacities, and manage allowed years and genders.
- **Booking System:** Students can view available rooms, book rooms, and cancel bookings. Admins can confirm, expire, or cancel bookings.
- **Payment Integration:** Handles payment records and status updates for bookings.
- **Multi-Database Support:** Separates authentication and hostel data into different MongoDB databases for better organization and security.
- **File Uploads:** Supports uploading Excel files for bulk room import using Multer and XLSX.
- **Comprehensive API:** RESTful endpoints for all major operations, with clear separation of concerns via controllers and routes.
- **CORS & Security:** Configurable CORS, cookie parsing, and environment-based configuration for secure deployment.

---

## Architecture Overview
- **Express.js** is used as the web framework, with modular routers for different resources (auth, hostels, bookings, payments, admin).
- **Mongoose** manages MongoDB connections and models, with separate connections for authentication and hostel data.
- **Controllers** encapsulate business logic, while **middlewares** handle authentication, error handling, and request validation.
- **Environment variables** are loaded via dotenv for flexible configuration.

---

## Tech Stack
- **Node.js** (JavaScript runtime)
- **Express.js** (Web framework)
- **MongoDB** (Database)
- **Mongoose** (ODM for MongoDB)
- **JWT** (Authentication)
- **bcryptjs** (Password hashing)
- **dotenv** (Environment configuration)
- **multer** (File uploads)
- **xlsx** (Excel file parsing)
- **cookie-parser**, **cors** (Security and cross-origin support)
- **nodemon** (Development hot-reloading)

---

## Project Structure
```
server/
├── src/
│   ├── app.js                # Express app setup and middleware
│   ├── server.js             # Entry point, starts the server
│   ├── constants.js          # Application-wide constants
│   ├── db/                   # Database connection and logic
│   ├── controllers/          # Business logic for each resource
│   ├── middlewares/          # Custom Express middlewares
│   ├── models/               # Mongoose models
│   ├── routes/               # Express routers
│   ├── scripts/              # Database seeding and utility scripts
│   └── utils/                # Utility functions
├── .env.example              # Example environment variables
├── package.json              # NPM configuration
└── README.md                 # Project documentation
```

---

## Environment Variables
Create a `.env` file in the `server/` directory based on `.env.example`. Required variables:
- `PORT` - Port number for the server (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `COOKIE_SECRET` - Secret for signing cookies
- `CORS_ORIGIN` - Allowed origins for CORS (comma-separated)
- `CLIENT_URL` - URL of the frontend client

---

## Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Hostel-Booking-System/server
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in the required values.

---

## Running the Server
- **Development mode (with hot reload):**
  ```bash
  npm run dev
  ```
- **Production mode:**
  ```bash
  npm start
  ```

---

## Database Seeding
- **Seed authentication database:**
  ```bash
  npm run seed:auth
  ```
- **Seed admin users:**
  ```bash
  npm run seed:auth:admins
  ```
- **Seed student users:**
  ```bash
  npm run seed:auth:students
  ```

---

## API Endpoints
### Health Check
- `GET /api/health` - Returns server health status.

### Authentication
- `POST /api/auth/register` - Register a new user (student or admin)
- `POST /api/auth/login` - Login and receive JWT token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get current user profile

### Hostels
- `GET /api/hostels` - List all hostels
- `POST /api/hostels` - Create a new hostel (admin only)
- `GET /api/hostels/:id` - Get hostel details
- `PUT /api/hostels/:id` - Update hostel info (admin only)
- `DELETE /api/hostels/:id` - Delete hostel (admin only)

### Rooms
- `GET /api/hostels/:hostelId/rooms` - List rooms in a hostel
- `POST /api/hostels/:hostelId/rooms` - Add a room (admin only)
- `PUT /api/hostels/:hostelId/rooms/:roomId` - Update room info (admin only)
- `DELETE /api/hostels/:hostelId/rooms/:roomId` - Delete room (admin only)

### Bookings
- `GET /api/bookings` - List bookings (user or admin)
- `POST /api/bookings` - Create a new booking (student)
- `PATCH /api/bookings/:id/cancel` - Cancel a booking
- `PATCH /api/bookings/:id/confirm` - Confirm a booking (admin)
- `PATCH /api/bookings/:id/expire` - Expire a booking (admin)

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Record a payment

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `POST /api/admin/users` - Create a new admin user
- `PATCH /api/admin/users/:id` - Update admin user
- `DELETE /api/admin/users/:id` - Delete admin user

---

## Authentication & Authorization
- Uses JWT tokens for stateless authentication.
- Passwords are hashed with bcrypt before storage.
- Role-based access control ensures only authorized users can access admin routes.
- Middleware checks for valid tokens and permissions on protected routes.

---

## Error Handling
- Centralized error handler middleware returns consistent error responses.
- 404 handler for unknown routes.
- Validation errors and database errors are handled gracefully.

---

## Development & Contribution
- Use feature branches for new features or bug fixes.
- Run `npm run dev` for development with hot reloading.
- Ensure code is well-documented and tested before submitting pull requests.

---

## License
This project is licensed under the ISC License.
