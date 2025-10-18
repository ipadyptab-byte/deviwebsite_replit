# Devi Jewellers E-Commerce Application

## Overview
A jewelry e-commerce React application that displays gold and silver rates, manages product images, and allows administrators to update pricing information. The application has been successfully migrated from Firebase to PostgreSQL database.

## Current State
- **Status**: Migration from Firebase to PostgreSQL complete and functional
- **Database**: PostgreSQL (Replit Neon database)
- **Backend**: Express.js REST API on port 3001
- **Frontend**: React app on port 5000
- **Deployment**: Configured for VM deployment with both frontend and backend running

## Recent Changes
**October 17, 2025 - Firebase to PostgreSQL Migration (Completed)**
- Migrated database from Firebase to PostgreSQL
- Set up Drizzle ORM with node-postgres driver
- Created Express.js backend server with REST API endpoints
- Updated all React components to use PostgreSQL API instead of Firebase
- Configured deployment settings for production
- Fixed TLS/SSL connection issues by switching from @neondatabase/serverless to standard pg library
- Added category support to images table for filtering and categorization
- Implemented complete REST API for images: GET all, GET by category, POST with category support

## Project Architecture

### Database Schema
**Tables:**
1. **rates** - Stores current gold/silver rates
   - id (serial, primary key)
   - vedhani (varchar)
   - ornaments22k (varchar)
   - ornaments18k (varchar)
   - silver (varchar)
   - updated_at (timestamp, auto-updated)

2. **images** - Stores product image metadata
   - id (serial, primary key)
   - url (text, not null) - Image URL
   - category (varchar 100, nullable) - Image category for filtering
   - file_name (text, nullable) - Original file name
   - uploaded_at (timestamp, auto-set on creation)

### Backend API (Port 3001)
**Endpoints:**
- GET `/api/rates` - Fetch current rates
- PUT `/api/rates` - Update rates (creates new if none exist)
- GET `/api/images` - Fetch all images (ordered by upload date)
- GET `/api/images/latest` - Fetch the most recently uploaded image
- GET `/api/images/:category` - Fetch images filtered by category
- POST `/api/images` - Add new image with optional category

### Frontend (Port 5000)
**Key Components:**
- CurrentRates - Displays rates in header tooltip (uses PostgreSQL API)
- Admin - Form to update rates (uses PostgreSQL API)
- Home - Main landing page with product carousel
- UploadImage - Upload images to Firebase Storage (metadata to PostgreSQL)

**Routing:**
- `/` - Home page
- `/admin` - Admin panel for updating rates
- `/upload` - Upload images
- Other product category pages (bestSellers, rings, earrings, etc.)

### Technology Stack
- **Frontend**: React, React Router, SASS
- **Backend**: Express.js, CORS
- **Database**: PostgreSQL via Drizzle ORM
- **ORM**: Drizzle with node-postgres driver
- **Image Storage**: Firebase Storage (images), PostgreSQL (metadata)

## File Structure
```
/
├── server/
│   └── index.js                 # Express backend server
├── shared/
│   └── schema.js                # Drizzle database schema
├── src/
│   ├── api/
│   │   └── client.js            # API client for backend
│   ├── component/
│   │   ├── currentRates/        # Current rates component
│   │   ├── header/              # Header with navigation
│   │   └── UploadImage/         # Image upload component
│   ├── pages/
│   │   ├── admin/               # Admin page for rate updates
│   │   └── home/                # Home page
│   └── App.js                   # Main app with routes
├── drizzle.config.ts            # Drizzle ORM configuration
└── package.json                 # Dependencies and scripts
```

## Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (auto-configured by Replit)
- **SERVER_PORT**: Backend server port (default: 3001)
- **PORT**: Frontend port (5000)
- **SKIP_PREFLIGHT_CHECK**: Set to "true" for React

## Workflows
1. **Backend Server** - `npm run server` - Runs Express backend on port 3001
2. **React App** - `npm start` - Runs React frontend on port 5000

## Deployment Configuration
- **Type**: VM (always running)
- **Command**: Runs both backend and frontend (`npm run server & npm start`)
- **Ports**: Backend (3001), Frontend (5000)

## Key Design Decisions
1. **Database Choice**: Migrated to PostgreSQL for better relational data management and Replit integration
2. **ORM**: Using Drizzle ORM for type-safe database queries
3. **Connection Library**: Switched from @neondatabase/serverless to standard pg library to resolve TLS/WebSocket issues in Node.js environment
4. **API Architecture**: REST API with Express.js separating backend logic from frontend
5. **Image Storage**: Firebase Storage still used for actual images; only metadata stored in PostgreSQL
6. **Deployment**: VM deployment to keep both servers running continuously

## User Preferences
- None specified yet

## Notes
- Firebase is no longer used for data storage, only for image hosting
- The app binds to 0.0.0.0 for Replit environment compatibility
- React proxy is configured to forward API requests to backend on port 3001
- SSL is configured with `rejectUnauthorized: false` for development database connection
