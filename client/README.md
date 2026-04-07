# Hostel Booking System - Client

A modern, responsive web application for hostel room booking management built with React and Vite. This frontend provides comprehensive functionality for students and administrators to manage hostel accommodations through an intuitive user interface.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Available Scripts](#available-scripts)
- [Features](#features)
- [Environment Configuration](#environment-configuration)

## 🎯 Overview

The Hostel Booking System Client is a comprehensive frontend application designed to:

- Allow students to browse and book available hostel accommodations
- Manage room allocations through First Come First Serve (FCFS) system
- Facilitate room swaps and manual bookings
- Enable payment processing for bookings
- Provide administrators with system oversight and management capabilities
- Display real-time booking analytics and statistics

## 🛠️ Tech Stack

| Technology | Version | Purpose | Key Features |
|------------|---------|---------|---------------|
| **React** | ^19.2.4 | UI library | Components, Hooks, State management |
| **Vite** | ^8.0.1 | Build tool & dev server | Lightning-fast HMR, optimized builds |
| **React Router DOM** | ^7.14.0 | Client-side routing | SPA navigation, dynamic routes |
| **Tailwind CSS** | ^4.2.2 | Utility-first CSS framework | Custom styling, responsive design |
| **Tailwind Vite Plugin** | ^4.2.2 | Tailwind integration | JIT compilation, optimized output |
| **Axios** | ^1.14.0 | HTTP client | API requests, interceptors, error handling |
| **React Hot Toast** | ^2.6.0 | Toast notifications | User feedback, alerts, confirmations |
| **Lucide React** | ^1.7.0 | Icon library | 1000+ modern icons, customizable |
| **@babel/Core** | ^7.29.0 | JavaScript compiler | ES6+ transformation, JSX compilation |
| **ESLint** | ^9.39.4 | Code quality & linting | Code style enforcement, best practices |
| **React Compiler** | ^1.0.0 | Auto-optimization | Performance optimization, memoization |

### Technology Rationale

**React 19** - Modern UI framework with improved performance and developer experience through automatic compilation.

**Vite** - Next-generation build tool providing:
- Instant server start (< 50ms)
- Lightning-fast HMR (Hot Module Replacement)
- Optimized production builds
- Better dependency resolution
- Smaller bundle sizes compared to Webpack

**Tailwind CSS** - Utility-first CSS framework for:
- Rapid UI development
- Consistent design system
- Responsive design helpers
- Reduced CSS bundle size
- Easy customization and theming

**Axios** - Preferred over fetch for:
- Request/response interceptors
- Automatic JSON transformation
- Timeout handling
- Cancel token support
- Browser compatibility

## 📁 Project Structure

```
client/
├── public/                    # Static assets (favicon, manifest, etc.)
├── src/
│   ├── assets/               # Images, fonts, and media files
│   │                         # Organized by type (images/, icons/, fonts/)
│   ├── components/           # Reusable React components
│   │   ├── AdminNavbar.jsx              # Navigation bar for admin users
│   │   ├── StudentNavbar.jsx            # Navigation bar for student users
│   │   ├── AnimatedBorder.jsx           # Animated UI border component
│   │   ├── AnimatedLogout.jsx           # Logout animation component
│   │   ├── BookingWindowToggle.jsx      # Toggle for booking time windows
│   │   ├── ResetSystemAction.jsx        # System reset control component
│   │   └── FCFS/                        # First Come First Serve components
│   │       ├── AllotmentSlip.jsx        # Displays room allocation slip
│   │       ├── BerthLockTimer.jsx       # Countdown timer for berth locking
│   │       ├── LiveTicker.jsx           # Real-time booking updates ticker
│   │       ├── RoommateCode.jsx         # Generates/displays roommate codes
│   │       ├── SwapRequestCard.jsx      # Card UI for room swap requests
│   │       └── VirtualQueue.jsx         # Virtual queue position display
│   ├── config/               # Configuration files
│   │   └── api.js            # API endpoints, base URLs, timeout settings
│   ├── hooks/                # Custom React hooks
│   │   └── ClickMouse.js     # Custom hook for mouse click events
│   ├── lib/                  # Utility libraries and helpers
│   │   └── axios.js          # Axios instance with interceptors and auth
│   ├── pages/                # Page components (connected to routes)
│   │   ├── AdminDashboardPage.jsx        # Main admin control panel
│   │   ├── AdminProfile.jsx              # Admin profile management
│   │   ├── ApplicationRegistryPage.jsx   # View all booking applications
│   │   ├── BookingCountdownPage.jsx      # Booking window countdown display
│   │   ├── BrowseHostelsPage.jsx         # Browse available hostels
│   │   ├── ConfirmedBookingsPage.jsx     # View confirmed bookings
│   │   ├── DownloadSlipPage.jsx          # Download allotment slip
│   │   ├── FCFSAnalytics.jsx             # FCFS system analytics dashboard
│   │   ├── InventoryConfig.jsx           # Configure hostel inventory
│   │   ├── LoginPage.jsx                 # User authentication
│   │   ├── ManualBookingPage.jsx         # Admin manual booking creation
│   │   ├── PaymentPage.jsx               # Payment processing interface
│   │   ├── RoomSwapDashboard.jsx         # Room swap requests management
│   │   ├── StudentDashboardPage.jsx      # Main student dashboard
│   │   ├── StudentProfile.jsx            # Student profile management
│   │   └── SwapApprovalPage.jsx          # Approve/reject room swaps
│   ├── store/                # State management (Zustand, Redux, or Context API)
│   │                         # Global state for auth, bookings, user data
│   ├── App.jsx               # Root component with routing
│   ├── main.jsx              # Application entry point, React DOM render
│   └── index.css             # Global styles, Tailwind directives
├── index.html                # HTML template, app mount point
├── package.json              # Dependencies and npm scripts
├── vite.config.js            # Vite build and dev server configuration
├── eslint.config.js          # ESLint rules and code quality settings
└── README.md                 # This file
```

### Directory Details

#### **assets/**
Stores all static media files used throughout the application:
- Images for hostel previews, room layouts, and branding
- SVG icons for UI elements
- Custom fonts for typography
- Background images and patterns

#### **components/**
Reusable, self-contained UI components used across multiple pages:
- Navigation components for routing and user identity
- Utility components for visual effects and animations
- FCFS-specific components handling booking queue operations
- Composed together to build complete page layouts

#### **config/**
Centralized configuration management:
- `api.js`: Defines all backend API endpoints, base URL, request/response interceptors
- Environmental configuration for development, staging, and production

#### **hooks/**
Custom React Hooks for shared logic:
- Event handling hooks (mouse, keyboard, touch)
- API data fetching hooks
- Authentication and authorization hooks
- Form state management hooks

#### **lib/**
Low-level utility libraries and helper functions:
- `axios.js`: Pre-configured Axios instance with authentication headers, error handling, and retry logic
- API client utilities
- Storage utilities (localStorage, sessionStorage)
- Formatting and validation helpers

#### **pages/**
Full-page components connected to routes:
- One page per major feature/route
- Combines multiple child components
- Handles page-level state and logic
- Receives route parameters and manages navigation

#### **store/**
Global state management:
- Stores user authentication state, role, permissions
- Manages booking data, user profile information
- Handles UI state (modals, notifications, loading states)
- Provides state access throughout the application

## 🚀 Installation

### Prerequisites

- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v7.0.0 or higher) - Comes with Node.js
- **Git** (v2.0.0 or higher) - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended ([Download](https://code.visualstudio.com/))

### Verify Prerequisites

Verify that all prerequisites are installed:

```bash
node --version
npm --version
git --version
```

Expected output should show version numbers v16+ for Node and v7+ for npm.

### Setup Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/Bharat-dixit-0512/Hostel-Booking-System.git
cd Hostel-Booking-System/client
```

This creates a local copy of the project and navigates to the client directory.

#### 2. Install Dependencies

```bash
npm install
```

This reads the `package.json` file and installs all required dependencies in the `node_modules/` directory. This step may take 2-5 minutes depending on internet speed.

**What gets installed:**
- React and ReactDOM
- Vite build tools
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication
- ESLint for code quality
- Development dependencies for testing and building

#### 3. Configure Environment Variables

Create a `.env` file in the client root directory:

```bash
# Windows
type nul > .env

# macOS/Linux
touch .env
```

Add your configuration:

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_API_TIMEOUT=30000

# Application Mode
VITE_APP_ENV=development
VITE_DEBUG=true

# Feature Flags (Optional)
VITE_ENABLE_FCFS=true
VITE_ENABLE_PAYMENTS=true
```

**Environment Variables Explanation:**
- `VITE_API_URL`: Backend server URL for API requests
- `VITE_API_TIMEOUT`: Request timeout in milliseconds (30 seconds)
- `VITE_APP_ENV`: Current environment (development, staging, production)
- `VITE_DEBUG`: Enable debug logging
- `VITE_ENABLE_FCFS`: Enable/disable FCFS feature
- `VITE_ENABLE_PAYMENTS`: Enable/disable payment processing

**Important**: All environment variables must be prefixed with `VITE_` to be accessible in Vite.

#### 4. Verify Installation

Run ESLint to check for any setup issues:

```bash
npm run lint
```

Expected output should show no errors (warnings are acceptable during setup).

### Installation Troubleshooting

#### Issue: `npm: command not found`
**Solution**: Node.js may not be properly installed. Download and install from https://nodejs.org/

#### Issue: Port 5173 already in use
**Solution**: Vite will automatically use the next available port. No action needed.

#### Issue: Dependencies installation fails
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

#### Issue: Environment variables not loading
**Solution**: 
- Ensure `.env` file is in the client root directory
- Restart the dev server after creating `.env`
- Verify variable names start with `VITE_`
- Reload the browser page

## 💻 Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` with HMR (Hot Module Replacement) enabled.

### Development Features

- **Fast Refresh**: Instant feedback on code changes without full page reload
- **HMR Support**: Hot Module Replacement for seamless component updates
- **React Compiler**: Automatic optimization of React components for better performance
- **ESLint Integration**: Real-time code quality checks and suggestions
- **Source Maps**: Full JavaScript source maps for accurate debugging

### Development Workflow

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Open browser** to `http://localhost:5173`

3. **Edit files** in src/ and watch for automatic updates

4. **Check console** for HMR status and any errors

5. **Use React DevTools** browser extension for component debugging

### Code Quality

Run ESLint to check code quality and potential issues:

```bash
npm run lint
```

Fix common ESLint issues automatically:

```bash
npm run lint -- --fix
```

### ESLint Configuration

The project uses ESLint with:
- React recommended rules
- React Hooks exhaustive dependency warnings
- React Fast Refresh support
- ES2021 and JSX syntax support

### React Compiler

The React Compiler is enabled by default and provides:
- Automatic memoization of expensive computations
- Optimized re-render behavior
- Reduced performance bugs
- Better bundle size efficiency

**Note**: React Compiler may impact initial Vite build time but improves runtime performance.

### Development Best Practices

1. **Component Structure**
   - Keep components focused and single-responsibility
   - Use functional components with Hooks
   - Extract reusable logic into custom hooks
   - Place components in appropriate directories

2. **State Management**
   - Use React Context for app-wide state
   - Use useState for local component state
   - Use useReducer for complex state logic
   - Avoid prop drilling with Provider pattern

3. **Code Organization**
   - Group related functionality together
   - Separate concerns (logic, presentation, styling)
   - Keep component files focused and small
   - Use meaningful, descriptive names

4. **Performance Optimization**
   - Use React.memo() for expensive components
   - Implement code splitting with dynamic imports
   - Optimize re-renders with useMemo and useCallback
   - Lazy load components and routes

5. **Error Handling**
   - Implement error boundaries for component errors
   - Handle API request errors gracefully
   - Show user-friendly error messages
   - Log errors for debugging and monitoring

6. **Testing**
   - Write unit tests for utility functions
   - Test component rendering and user interactions
   - Mock API calls in tests
   - Aim for >80% code coverage

## 🔨 Build & Deployment

### Production Build

Create an optimized production build:

```bash
npm run build
```

### Build Process

The build command performs the following operations:

1. **Dependency Analysis** - Analyzes all imports and dependencies
2. **Code Splitting** - Splits code into chunks for optimal loading
3. **Minification** - Removes unnecessary characters from JavaScript and CSS
4. **Compression** - Gzips assets for smaller file transfer
5. **Image Optimization** - Compresses and optimizes images
6. **Asset Hashing** - Adds content-based hashes to filenames for caching
7. **Source Map Generation** - Creates optional source maps for debugging
8. **Output to dist/** - Generates production-ready files in `dist/` folder

### Build Artifacts

After successful build, the `dist/` folder contains:

```
dist/
├── index.html              # Main HTML file (entry point)
├── assets/
│   ├── index-[hash].js     # Main application JavaScript
│   ├── vendor-[hash].js    # External dependencies
│   ├── styles-[hash].css   # Compiled Tailwind styles
│   └── [hash].png          # Static images
└── vite.svg               # Static assets (if included)
```

### Build Configuration

The build process is configured in `vite.config.js`:

```javascript
// Key build settings:
- target: 'esnext'              // Target modern browsers
- outDir: 'dist'                // Output directory
- assetsDir: 'assets'           // Assets subdirectory
- sourcemap: false              // No source maps in production
- minify: 'terser'              // Minify with Terser
- rollupOptions: {...}          // Rollup bundler options
```

### Optimization Tips for Build

1. **Code Splitting**
   ```javascript
   // Lazy load route components
   const AdminPage = lazy(() => import('./pages/AdminDashboardPage'))
   ```

2. **Image Optimization**
   - Use modern formats (WebP with fallback)
   - Compress images before adding to assets
   - Use responsive images with srcset

3. **Dependency Management**
   - Remove unused dependencies
   - Check bundle size with `npm run build -- --report`
   - Consider dynamic imports for rarely-used features

4. **CSS Optimization**
   - Tailwind CSS automatically removes unused styles
   - Custom CSS is automatically minified
   - Consider critical path CSS for above-the-fold content

### Preview Production Build Locally

Test the production build on your machine:

```bash
npm run preview
```

The production build will be served at `http://localhost:4173`.

**Important**: Always preview the production build before deploying to catch any issues:
- Missing environment variables
- Broken images or assets
- API connectivity problems
- CSS styling inconsistencies
- JavaScript errors in console

### Deployment Strategies

#### **Option 1: Static Hosting (Recommended)**
Deploy to services like Vercel, Netlify, GitHub Pages:

1. **Prepare build**
   ```bash
   npm run build
   ```

2. **Connect repository** to hosting platform

3. **Configure build settings**
   - Build command: `npm run build`
   - Build directory: `dist`
   - Environment variables configured in platform

4. **Deploy** - Platform automatically builds and deploys on push

#### **Option 2: Traditional Server**
Deploy to traditional web servers (Nginx, Apache):

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Copy dist/ folder** to server web root
   ```bash
   scp -r dist/* user@server:/var/www/hostel-booking/
   ```

3. **Configure server** for SPA routing:
   - Point all requests to `index.html`
   - Configure gzip compression
   - Set cache headers for assets

4. **Verify deployment**
   - Check that all routes work
   - Test API connectivity
   - Verify asset loading

#### **Option 3: Docker Containerization**
Build a Docker container for consistent deployment:

```dockerfile
# Dockerfile
FROM node:19-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment-Specific Configuration

#### Development
```env
VITE_API_URL=http://localhost:5000
VITE_APP_ENV=development
VITE_DEBUG=true
```

#### Staging
```env
VITE_API_URL=https://staging-api.hostname.com
VITE_APP_ENV=staging
VITE_DEBUG=false
```

#### Production
```env
VITE_API_URL=https://api.hostname.com
VITE_APP_ENV=production
VITE_DEBUG=false
```

### Deployment Checklist

- [ ] All code committed and pushed
- [ ] Tests passing locally
- [ ] No console errors in preview
- [ ] Environment variables configured correctly
- [ ] API endpoints verified for target environment
- [ ] Production build size acceptable (< 500KB gzipped)
- [ ] Source maps generated for production debugging
- [ ] Cache headers configured for assets
- [ ] HTTPS enabled on production server
- [ ] CORS configured appropriately
- [ ] Error monitoring/logging configured
- [ ] Rollback plan in place
- [ ] Performance monitoring active

### Post-Deployment Verification

After deployment, verify:

1. **Accessibility**
   ```bash
   # Test from different locations
   curl https://your-domain.com
   ```

2. **Performance**
   - Check Core Web Vitals
   - Monitor bundle size
   - Check API response times
   - Use Lighthouse audit

3. **Functionality**
   - Test critical user flows
   - Verify authentication works
   - Check payment processing
   - Test on multiple browsers

4. **Security**
   - Verify HTTPS is enforced
   - Check security headers
   - Test CORS configuration
   - Review environment variables

## 📦 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **dev** | `npm run dev` | Start development server with HMR |
| **build** | `npm run build` | Create optimized production build |
| **preview** | `npm run preview` | Preview production build locally |
| **lint** | `npm run lint` | Run ESLint code quality checks |

## ✨ Features

### 🎓 Student Features

#### 🏠 Browse Available Hostels and Rooms
Students can explore all available hostel accommodations in the system:
- View detailed hostel information including amenities, location, and capacity
- See individual room details with photos, specifications, and pricing
- Filter and sort hostels by preferences (location, price range, facilities)
- Check real-time room availability status
- Compare different hostels and make informed decisions

#### 📝 Apply for Room Bookings
Complete booking application process with ease:
- Fill out booking application form with personal and preferences
- Select desired room type and hostel preference
- Enter booking dates and duration
- Submit application for administrative review
- Track application status in real-time (pending, approved, rejected)

#### 💳 Process Payments Securely
Secure payment handling for confirmed bookings:
- Multiple payment method support (credit card, debit card, digital wallets)
- Encrypted payment gateway integration
- Automatic payment confirmation and receipt generation
- Support for installment payments if available
- Transparent pricing with no hidden charges

#### 📋 View Confirmed Bookings and Allotment Slips
Access and manage confirmed bookings:
- View all confirmed room allocations with dates and details
- Download official allotment slips as PDF documents
- Print allotment slips for on-campus submission
- Get check-in instructions and hostel contact information
- View booking duration and renewal options

#### 🔄 Request Room Swaps with Other Students
Facilitate room exchanges and upgrades:
- Browse available rooms from other students willing to swap
- Create swap requests with detailed reasons
- View swap request history and status
- Communicate with potential swap partners
- Complete swap only after admin approval
- Maintain booking continuity during swap process

#### ⏱️ Track Booking Countdown Timers
Real-time booking timeline management:
- See countdown timer for booking window closure
- Get notifications when booking window is about to close
- Understand priority based on position in virtual queue
- Track berth lock timer to secure room spot
- Plan and organize booking submission accordingly

#### 📊 View Personal Booking Dashboard
Comprehensive personal dashboard with all relevant information:
- Summary of current and upcoming bookings
- Payment status and history
- Application status tracking
- Quick access to important documents
- Personal profile information and preferences
- Booking history and statistics

---

### 👨‍💼 Admin Features

#### 📊 Comprehensive Admin Dashboard
Centralized control panel for complete system oversight:
- Real-time statistics on bookings, applications, and revenue
- System health and performance metrics
- Recent activities and user actions log
- Quick access to critical management functions
- Visual analytics for decision-making
- Alerts and notifications for system events

#### ⚙️ Configure Hostel Inventory and Room Availability
Manage hostel resources and room inventory:
- Add/edit/delete hostels in the system
- Configure room types and specifications for each hostel
- Set room capacity and total availability
- Define pricing per room type and duration
- Manage seasonal pricing adjustments
- Set occupancy limits and restrictions
- Update room amenities and facilities list

#### 👥 Manage Application Registry
Track and process all booking applications:
- View complete list of all booking applications
- Filter applications by status (pending, approved, rejected)
- Review application details and student information
- Add notes and comments on applications
- Bulk operations for approving/rejecting applications
- Export application data for reporting
- Search and sort applications by various criteria

#### 💰 Manual Booking Management
Create and manage bookings outside normal process:
- Manually create bookings for specific students
- Override normal booking rules for special cases
- Create emergency or reserved bookings
- Assign specific rooms to students
- Modify booking dates and room assignments
- Cancel bookings with explanations
- Handle booking corrections and adjustments

#### 🔄 Approve/Reject Room Swap Requests
Control and manage room exchange operations:
- Review all pending room swap requests with details
- Verify swap eligibility and compliance
- Approve swaps that meet criteria
- Reject swaps with feedback to students
- Monitor completed swaps for integrity
- Generate swap history reports
- Ensure system fairness and prevent abuse

#### 📈 View FCFS Booking Analytics
Analyze First Come First Serve system performance:
- Booking completion rates and statistics
- Peak demand times and patterns
- Average time to complete booking
- Queue analysis and wait times
- Student participation metrics
- Identify bottlenecks and inefficiencies
- Generate reports for system improvements

#### 🎮 System Control and Management Tools
Advanced administrative controls:
- Reset system or clear all bookings for new cycle
- Configure booking window open/close times
- Set system-wide policies and rules
- Manage admin user accounts and permissions
- View system logs and audit trail
- Backup and restore system data
- Emergency shutdown and recovery options

---

### 🚀 FCFS (First Come First Serve) System Components

The FCFS system manages fair and transparent room allocation through a structured queue-based booking process.

#### 🎫 Virtual Queue Management
Organize students in fair ordering for FCFS:
- Assign position in virtual queue upon registration
- Display current queue position to students
- Update queue position as students complete bookings
- Handle queue position changes during bookings
- Implement priority rules (seniors, special cases)
- Prevent queue jumps and maintain fairness
- Show estimated time to reach booking turn

#### ⏱️ Berth Lock Timer
Secure rooms during booking process:
- Start timer when student selects a room
- Prevent other students from booking same room during timer
- Clear timer when booking is completed or abandoned
- Automatically release room if timer expires
- Display remaining time to student
- Handle timer extensions for payment processing
- Ensure fair time allocation for all students

#### 📺 Live Booking Ticker
Real-time display of booking activity:
- Show live stream of completed bookings
- Display student names and room assignments
- Update in real-time as bookings occur
- Show booking success rate and statistics
- Motivate waiting students with activity feed
- Allow filtering by hostel or room type
- Archive historical ticker data

#### 🧑‍🤝‍🧑 Roommate Code Generation
Create roommate identification system:
- Generate unique codes for new room assignments
- Share codes with multiple students for same room
- Validate codes during hostel check-in
- Use codes for hostel access and identification
- Prevent unauthorized room access
- Allow code regeneration if needed
- Store codes securely in system

#### 📊 Real-time Allocation Analytics
Performance metrics for FCFS system:
- Track booking completion rates in real-time
- Monitor queue progress and throughput
- Display average booking time per student
- Show peak and low activity periods
- Identify system bottlenecks
- Predict completion timeline for remaining students
- Generate performance reports for optimization

## 🔧 Environment Configuration

### Environment Variables Template

Create a `.env` file in the root of the client directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Application Mode
VITE_APP_ENV=development
```

### Configuration Files

- **vite.config.js**: Vite build and development server configuration
- **eslint.config.js**: ESLint rules and code quality settings

## 📝 Contributing Guidelines

### Before You Start

1. **Fork the repository** on GitHub
2. **Create a feature branch** for your changes
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make changes** following the guidelines below
4. **Push to your fork** and create a Pull Request

### Code Style & Conventions

#### Component Naming
- Use PascalCase for component filenames: `UserDashboard.jsx`
- Component names should be descriptive and nouns
- Avoid generic names like `Component`, `Page`, `Section`

#### File Organization
- Keep component file size under 300 lines
- Extract logic into custom hooks
- Group related components in subdirectories
- One component per file (except utilities)

#### JavaScript Conventions
```javascript
// ✅ Good: Descriptive function names
const calculateTotalPrice = (items) => { ... }

// ❌ Bad: Generic names
const calculate = (i) => { ... }

// ✅ Good: Const over let/var
const API_URL = 'http://api.example.com'

// ✅ Good: Template literals
const message = `Hello, ${userName}`

// ✅ Good: Destructuring
const { name, email } = user
```

#### React Component Structure
```javascript
// ✅ Good component structure:
import React, { useState, useEffect } from 'react'
import Button from '@components/Button'
import { useApi } from '@hooks/useApi'

// Props destructuring at top
const UserProfile = ({ userId, onUpdate }) => {
  // Hooks first
  const [user, setUser] = useState(null)
  const { data, loading } = useApi(`/users/${userId}`)

  // Effects
  useEffect(() => { ... }, [])

  // Handlers
  const handleDelete = () => { ... }

  // Render
  return (
    <div>...</div>
  )
}

export default UserProfile
```

### Testing Requirements

Before submitting a PR:

1. **Run ESLint**
   ```bash
   npm run lint
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Test locally**
   ```bash
   npm run dev
   # Test your changes in browser
   ```

4. **No console errors** - Check browser DevTools

### Git Commit Guidelines

Write clear, descriptive commit messages:

```bash
# ✅ Good commit messages:
git commit -m "feat: add room booking functionality"
git commit -m "fix: resolve payment gateway timeout issue"
git commit -m "docs: update API documentation"
git commit -m "refactor: optimize user dashboard performance"

# ❌ Bad commit messages:
git commit -m "fix stuff"
git commit -m "update"
git commit -m "asdf"
```

### PR Description Template

When creating a Pull Request, include:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing Done
- Tested on Windows/Mac/Linux
- Tested in Chrome/Firefox/Safari
- All ESLint checks pass

## Checklist
- [ ] Code follows style guidelines
- [ ] No console errors
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

- All PRs require at least one approval
- Address review comments promptly
- Resolve conversations before merging
- Keep PRs focused on single feature/fix
- Rebase before merging to keep history clean

---

## 🏗️ Project Architecture

### Application Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Hostel Booking System              │
│            (Frontend Client)                │
└─────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼────┐            ┌──────▼──────┐
   │ React   │            │ Tailwind CSS │
   │ Router  │            │ Styling     │
   └────┬────┘            └─────────────┘
        │
   ┌────▼─────────────────────────────┐
   │     Application Structure        │
   ├──────────────────────────────────┤
   │ ┌──────────────────────────────┐ │
   │ │ Pages (Route Components)     │ │
   │ │ - AdminDashboardPage        │ │
   │ │ - StudentDashboardPage      │ │
   │ │ - BookingPages              │ │
   │ └──────────────────────────────┘ │
   │              ▲                    │
   │              │                    │
   │ ┌──────────────────────────────┐ │
   │ │ Components (Reusable UI)    │ │
   │ │ - Navigation                 │ │
   │ │ - Cards, Modals              │ │
   │ │ - FCFS Components            │ │
   │ └──────────────────────────────┘ │
   │              ▲                    │
   │              │                    │
   │ ┌──────────────────────────────┐ │
   │ │ Hooks & Utils                │ │
   │ │ - useApi, useAuth            │ │
   │ │ - API client (Axios)         │ │
   │ └──────────────────────────────┘ │
   │              ▲                    │
   │              │                    │
   │ ┌──────────────────────────────┐ │
   │ │ State Management (Store)     │ │
   │ │ - Authentication             │ │
   │ │ - User Profile               │ │
   │ │ - Bookings, FCFS State       │ │
   │ └──────────────────────────────┘ │
   └──────────────────────────────────┘
                │
         ┌──────▼──────┐
         │  Axios      │
         │  HTTP Client│
         └──────┬──────┘
                │
         ┌──────▼──────────────────┐
         │  Backend API Server     │
         │  (Node.js + Express)    │
         └─────────────────────────┘
```

### Data Flow

1. **User Interaction** → Component event (button click, form submit)
2. **Event Handler** → Updates local state or calls API
3. **API Call** → Axios makes HTTP request to backend
4. **Backend Processing** → Server handles request, updates database
5. **Response** → Backend returns data/status to client
6. **State Update** → Component updates global or local state
7. **Re-render** → React re-renders component with new data
8. **UI Update** → User sees updated interface

### State Management Pattern

```javascript
// Global State (Context/Store)
├── auth: { user, token, role, permissions }
├── bookings: { list, current, history }
├── hostels: { list, selected, details }
├── ui: { loading, modal, notification, sidebar }
└── fcfs: { queue, position, vitals }

// Local State (Component useState)
├── form input values
├── ui toggles (expanded, selected)
├── temporary data
└── animations
```

---

## 🔗 API Integration

### Base Configuration

API configuration is managed in [config/api.js](config/api.js):

```javascript
// api.js
export const API_BASE_URL = import.meta.env.VITE_API_URL
export const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  
  // Bookings
  BOOKINGS: '/bookings',
  CREATE_BOOKING: '/bookings/create',
  
  // Hostels
  HOSTELS: '/hostels',
  HOSTEL_DETAILS: '/hostels/:id',
  
  // etc...
}
```

### Axios Configuration

[lib/axios.js](lib/axios.js) provides pre-configured Axios instance:

```javascript
// Automatic features:
- Base URL configuration
- Request/Response interceptors
- Authentication token injection
- Error handling
- Timeout management
- Request cancellation support
```

### Making API Calls

#### Using custom hook (Recommended)

```javascript
const { data, loading, error } = useApi('/bookings')
```

#### Direct Axios call

```javascript
import axios from '@lib/axios'

const fetchBooking = async (bookingId) => {
  try {
    const response = await axios.get(`/bookings/${bookingId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching booking:', error)
  }
}
```

### Common API Patterns

#### GET Request (Fetch Data)
```javascript
const getHostels = () => axios.get('/hostels')

// With query parameters
const searchHostels = (filters) => 
  axios.get('/hostels', { params: filters })
```

#### POST Request (Create/Submit)
```javascript
const createBooking = (bookingData) => 
  axios.post('/bookings', bookingData)
```

#### PUT Request (Update)
```javascript
const updateUser = (userId, userData) => 
  axios.put(`/users/${userId}`, userData)
```

#### DELETE Request (Remove)
```javascript
const cancelBooking = (bookingId) => 
  axios.delete(`/bookings/${bookingId}`)
```

### Error Handling

Global error handling configured in axios interceptors:

```javascript
// Automatic handling:
- HTTP error status codes
- Network errors
- Timeout errors
- Unauthorized (401) - redirect to login
- Forbidden (403) - show permission error
- Server errors (500+) - show generic message
```

### Authentication

Authentication tokens are:
- Automatically injected in request headers
- Stored securely (localStorage/sessionStorage)
- Renewed on expiration (if implemented)
- Cleared on logout

---

## 📚 Additional Resources

### Official Documentation
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)

### Learning Resources
- React Hooks patterns and best practices
- Performance optimization techniques
- Modern CSS with Tailwind utility classes
- REST API design principles
- Component design patterns

---

## 🐛 Troubleshooting & FAQ

### Common Issues & Solutions

#### **Issue: "Port 5173 is already in use"**
**Symptoms**: Development server fails to start

**Solutions**:
- Vite automatically uses next available port (5174, 5175, etc.)
- Or manually specify port: `npm run dev -- --port 3000`
- Kill process on port: `lsof -ti:5173 | xargs kill -9` (macOS/Linux)
- Or use `netstat` on Windows to find and close process

#### **Issue: "Cannot find module '@components/ComponentName'"**
**Symptoms**: Import errors in browser console

**Solutions**:
- Check file spelling and exact path
- Ensure file exists in correct location
- Restart dev server after adding new files
- Check import path matches actual file location
- Import statements are case-sensitive on Linux/macOS

#### **Issue: "dependencies not installing" / "npm install fails"**
**Symptoms**: Installation hangs or shows error

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Remove lock files and node_modules
rm -rf node_modules package-lock.json

# Try installing with verbose output
npm install --verbose

# Use older npm version if needed
npm install -g npm@7
```

#### **Issue: "Blank white page after deployment"**
**Symptoms**: Production build loads but shows nothing

**Solutions**:
- Check browser console for JavaScript errors
- Verify API endpoint configuration
- Check `index.html` is being served
- Verify SPA routing is configured on server
- Check asset paths are correct (not using absolute paths)

#### **Issue: "API calls return 404 or network error"**
**Symptoms**: Cannot connect to backend server

**Solutions**:
```javascript
// Check API URL configuration
console.log(import.meta.env.VITE_API_URL)

// Verify backend is running
// Try direct request: curl http://localhost:5000/api/health

// Check CORS configuration on backend
// Verify network request in DevTools Network tab
```

#### **Issue: "Build fails with 'out of memory'"**
**Symptoms**: Build process crashes during compilation

**Solutions**:
```bash
# Increase Node heap size
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Remove unused dependencies
npm prune

# Clear build cache
rm -rf dist/ .vite/
```

#### **Issue: "Hot Module Replacement (HMR) not working"**
**Symptoms**: Changes don't reflect without manual refresh

**Solutions**:
- Restart dev server: Stop (Ctrl+C) and run `npm run dev`
- Check file is saved
- Only JSX/CSS changes support HMR
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache

#### **Issue: "ESLint shows warnings I want to ignore"**
**Symptoms**: Linting warnings block development

**Solutions**:
- Disable specific rule for line: `// eslint-disable-next-line rule-name`
- Disable for file: Add at top of file: `/* eslint-disable rule-name */`
- Update `.eslintrc` to disable globally (not recommended)

#### **Issue: "Tailwind CSS classes not applying"**
**Symptoms**: CSS classes don't style elements

**Solutions**:
- Verify Tailwind CSS plugin is loaded in `vite.config.js`
- Check class names are exact Tailwind classes
- Ensure paths in tailwind.config.js include your files
- Rebuild: `npm run build`
- Check browser DevTools for actual applied styles

#### **Issue: ".env file changes not reflecting"**
**Symptoms**: Environment variables show old values

**Solutions**:
- Restart dev server after changing .env
- Verify variable name starts with `VITE_`
- Use correct syntax: `KEY=value` (no spaces around =)
- Check file is in root client directory (not src/)
- Hard refresh browser after restart

#### **Issue: "Components not re-rendering"**
**Symptoms**: State changes but UI doesn't update

**Solutions**:
```javascript
// ❌ Wrong: Mutating state directly
state.user.name = 'John'

// ✅ Correct: Create new object
setState({ ...state, user: { ...state.user, name: 'John' } })

// Ensure dependencies in useEffect are correct
useEffect(() => { ... }, [dependency])

// Check parent component re-renders when state changes
```

#### **Issue: "Infinite loop or performance issues"**
**Symptoms**: Browser freezes or extreme slowdown

**Solutions**:
- Check useEffect dependencies for infinite loops
- Review useCallback/useMemo usage
- Check for unintended state updates
- Use React DevTools Profiler
- Check Network tab for excessive API calls
- Look for missing keys in lists

---

## ⚡ Performance Optimization

### Code Splitting & Lazy Loading

```javascript
// ❌ Bad: Loads all pages upfront
import AdminPage from './pages/AdminPage'
import StudentPage from './pages/StudentPage'

// ✅ Good: Load pages only when needed
const AdminPage = lazy(() => import('./pages/AdminPage'))
const StudentPage = lazy(() => import('./pages/StudentPage'))

// Wrap with Suspense
<Suspense fallback={<Loading />}>
  <AdminPage />
</Suspense>
```

### Component Memoization

```javascript
// Prevent unnecessary re-renders
const StudentCard = React.memo(({ student, onSelect }) => {
  return <div onClick={() => onSelect(student)}>...</div>
})

// Custom comparison
export default memo(Component, (prev, next) => {
  return prev.id === next.id
})
```

### Image Optimization

```javascript
// Use modern formats with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Hostel" />
</picture>

// Responsive images
<img 
  srcSet="image-small.jpg 480w, image-large.jpg 1024w"
  sizes="(max-width: 600px) 480px, 1024px"
  src="image-large.jpg"
  alt="Hostel"
/>
```

### Bundle Analysis

```bash
# Generate build report
npm run build -- --analyze

# Check bundle size
npm run build
# Check dist/ folder size
```

### Monitoring Performance

```javascript
// Use Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)  // Cumulative Layout Shift
getFID(console.log)  // First Input Delay
getFCP(console.log)  // First Contentful Paint
getLCP(console.log)  // Largest Contentful Paint
getTTFB(console.log) // Time to First Byte
```

---

## 🔒 Security Best Practices

### Authentication & Authorization

```javascript
// ✅ Store token securely
const token = localStorage.getItem('auth_token')

// ✅ Always validate user role before rendering
if (user.role !== 'admin') {
  return <Unauthorized />
}

// ✅ Implement role-based access control
const ProtectedRoute = ({ component, requiredRole }) => {
  if (currentUser.role !== requiredRole) {
    return <Navigate to="/unauthorized" />
  }
  return component
}
```

### API Security

```javascript
// ✅ Always validate and sanitize input
const validateBookingData = (data) => {
  if (!data.startDate || !data.endDate) {
    throw new Error('Invalid dates')
  }
  return data
}

// ✅ Implement HTTPS only
if (import.meta.env.PROD) {
  // Enforce HTTPS on production
}

// ✅ Handle errors safely
catch (error) {
  console.error('Safe error:', error.message)
  // Don't expose internal error details to users
  showUserError('An error occurred. Please try again.')
}
```

### XSS Prevention

```javascript
// ✅ React automatically escapes content
const userContent = '<script>alert("xss")</script>'
<div>{userContent}</div> // Rendered as text, not executed

// ✅ Sanitize user input if needed
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(html)}} />
```

### CSRF Protection

```javascript
// ✅ Include CSRF token with requests
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
axios.defaults.headers.post['X-CSRF-Token'] = csrfToken

// ✅ Use SameSite and secure cookies
// Configured on backend: Set-Cookie: token=value; SameSite=Strict; Secure
```

---

## 📊 Monitoring & Analytics

### Error Tracking

```javascript
// Implement error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  
  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo)
    // Send to error tracking service (Sentry, Bugsnag, etc.)
  }
  
  render() {
    if (this.state.hasError) return <ErrorFallback />
    return this.props.children
  }
}
```

### User Analytics

```javascript
// Track important events
const trackEvent = (eventName, eventData) => {
  if (window.gtag) {
    gtag('event', eventName, eventData)
  }
}

// Usage
trackEvent('booking_completed', { bookingId, amount })
trackEvent('page_view', { pageName: 'dashboard' })
```

---

## 📄 License

This project is part of the Hostel Booking System. All rights reserved.

---

## 🤝 Support & Contact

For issues, questions, or suggestions:
- **GitHub Issues**: Create an issue on the repository
- **Email**: support@hostelbooking.com
- **Documentation**: See [server README](../../server/README.md) for backend documentation

---

**Last Updated**: April 2026 | **Version**: 1.0.0
