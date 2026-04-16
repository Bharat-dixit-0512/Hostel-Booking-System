# Hostel Booking System - Server

Backend API for the Hostel Booking System.

This service handles authentication, student booking flow, payment flow, and admin inventory controls.

## Tech Stack

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT (cookie and bearer-token auth)
- Multer + XLSX (room import)

## Quick Start

1. Install dependencies.

```bash
npm install
```

2. Create env file.

```bash
cp .env.example .env
```

3. Run in development.

```bash
npm run dev
```

4. Run in production mode.

```bash
npm start
```

## NPM Scripts

- npm run dev: Start server with nodemon
- npm start: Start server with node
- npm run seed:auth: Seed auth and hostel student profile data
- npm run seed:auth:admins: Seed admin users only
- npm run seed:auth:students: Seed student users only

## Environment Variables

Defined in .env.example:

- PORT: Server port (default 5000)
- NODE_ENV: Environment name
- MONGODB_URI: Base Mongo connection URI
- JWT_SECRET: Secret used to sign access tokens
- JWT_EXPIRE: Token expiry duration (example: 1d)
- COOKIE_SECRET: Secret for signed cookies
- CLIENT_URL: Frontend URL (used as CORS fallback)
- CORS_ORIGIN: Comma-separated allowed origins

## Architecture Notes

- Two Mongo databases are used from one URI:
  - AuthDB for admin/student auth entities
  - HostelDB for hostels, rooms, bookings, counters, and booking window
- API base path is /api
- Routers mounted in src/app.js:
  - /api/auth
  - /api/hostels
  - /api/bookings
  - /api/payments
  - /api/admin

## Authentication and Authorization

- Access token is accepted either from:
  - Authorization: Bearer <token>
  - accessToken cookie
- Protected routes use middleware in src/middlewares/auth.middleware.js
- Role rules:
  - Student routes: login_type must be student
  - Admin routes: login_type must be admin
  - Some admin routes require role mainadmin

## API Endpoints (Current)

### Health

- GET /api/health

### Auth

- POST /api/auth/student/login
- POST /api/auth/admin/login
- POST /api/auth/logout
- GET /api/auth/me

### Student Hostels

- GET /api/hostels
- GET /api/hostels/:hostelId/rooms

### Student Bookings

- POST /api/bookings
- GET /api/bookings/me
- PUT /api/bookings/:id/cancel

### Student Payments

- POST /api/payments/create-session
- POST /api/payments/confirm
- GET /api/payments/:id/status

### Admin (All require admin login)

- GET /api/admin/hostels
- GET /api/admin/bookings
- GET /api/admin/eligible-students
- GET /api/admin/hostels/:hostelId/rooms
- GET /api/admin/booking-window
- POST /api/admin/offline-bookings

### Admin (mainadmin only)

- POST /api/admin/hostels
- PUT /api/admin/hostels/:hostelId
- DELETE /api/admin/hostels/:hostelId
- PUT /api/admin/hostels/:hostelId/allowed-years
- POST /api/admin/hostels/:hostelId/rooms
- PUT /api/admin/hostels/:hostelId/rooms/:roomNumber
- DELETE /api/admin/hostels/:hostelId/rooms/:roomNumber
- POST /api/admin/hostels/:hostelId/rooms/import/preview (multipart/form-data, file field: file)
- POST /api/admin/hostels/:hostelId/rooms/import/confirm (multipart/form-data, file field: file)
- PATCH /api/admin/booking-window
- POST /api/admin/session/reset

## Project Structure

```
server/
  src/
    app.js
    server.js
    constants.js
    controllers/
    db/
    middlewares/
    models/
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
