# Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development without Docker)

## Quick Start with Docker

1. **Clone/Navigate to the project directory**

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Start PostgreSQL database
   - Build and start the backend server
   - Build and start the frontend client
   - Run database migrations automatically

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health check: http://localhost:5000/health

## Local Development (Without Docker)

### Backend Setup

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` (if it exists) or create `.env` with:
     ```
     NODE_ENV=development
     DATABASE_URL=postgresql://booking_user:booking_password@localhost:5432/booking_db
     JWT_SECRET=your-super-secret-jwt-key-change-in-production
     PORT=5000
     ```

4. Make sure PostgreSQL is running locally

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

7. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (optional):
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Database Management

### Using Prisma Studio (GUI for database)

```bash
cd server
npm run prisma:studio
```

This will open Prisma Studio at http://localhost:5555

### Running Migrations

```bash
cd server
npm run prisma:migrate
```

## Project Structure

```
booking/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── context/       # React Context (Auth)
│   │   └── pages/         # Page components
│   ├── Dockerfile
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   └── utils/         # Utility functions
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── uploads/           # Local file storage
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user (Protected)

### Properties
- `GET /properties` - List properties (with optional filters: ?minPrice=X&maxPrice=Y&location=Z)
- `GET /properties/:id` - Get property details
- `POST /properties` - Create property (Protected: Host/Admin only)

### Bookings
- `POST /bookings` - Create booking (Protected)
- `GET /bookings/my-bookings` - Get user's bookings (Protected)
- `GET /bookings/host-bookings` - Get bookings for host's properties (Protected: Host/Admin)
- `PATCH /bookings/:id/status` - Update booking status (Protected: Host/Admin)

## User Roles

- **guest**: Can browse and book properties
- **host**: Can create properties and manage bookings for their properties
- **admin**: Full access (can manage all properties and bookings)

## Features

✅ User authentication (JWT-based)
✅ Property listings with image uploads
✅ Image storage (AWS S3 with local fallback)
✅ Booking system with date validation
✅ Role-based access control
✅ Responsive UI with Tailwind CSS
✅ Docker containerization
✅ Database migrations with Prisma

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in environment variables
- Verify database credentials

### Image upload issues
- For local development, images are stored in `server/uploads/`
- For production, configure AWS S3 credentials in environment variables
- Ensure uploads directory has write permissions

### CORS issues
- Backend CORS is configured to allow all origins in development
- For production, update CORS settings in `server/src/index.js`

## Next Steps

1. Set up AWS S3 for production image storage
2. Add email notifications for bookings
3. Implement payment processing
4. Add property reviews and ratings
5. Enhance search and filtering capabilities


