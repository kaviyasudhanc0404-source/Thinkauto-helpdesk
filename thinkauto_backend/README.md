# ThinkAuto Backend API

AI-Powered IT Helpdesk Backend built with Node.js, Express, and MongoDB.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Employee, Technician, Admin roles
- 🎫 **Ticket Management** - Create, assign, track, and resolve tickets
- 💬 **Comments & Updates** - Real-time ticket collaboration
- 📊 **Analytics & Statistics** - Dashboard metrics and insights
- 🔒 **Secure Admin Access** - Hidden admin login with specific credentials

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

## Installation

1. **Navigate to backend directory:**
   ```bash
   cd thinkauto_backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables are already configured in `.env`**

4. **Seed the admin user:**
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Admin Credentials

**Email:** sudhanadmin@gmail.com  
**Password:** sudhan@123

⚠️ **Note:** Admin role is hidden from public signup. Only use these credentials to login as admin.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user (Employee/Technician only)
- `POST /login` - User login
- `GET /me` - Get current user profile
- `POST /logout` - Logout user
- `PUT /profile` - Update user profile

### Tickets (`/api/tickets`)
- `GET /` - Get all tickets (role-based filtering)
- `POST /` - Create new ticket
- `GET /:id` - Get single ticket
- `PUT /:id` - Update ticket status/priority
- `POST /:id/comments` - Add comment to ticket
- `PUT /:id/assign` - Assign ticket to technician (Admin only)
- `GET /stats` - Get ticket statistics (Admin only)

### Users (`/api/users`)
- `GET /` - Get all users (Admin only)
- `GET /:id` - Get user by ID (Admin only)
- `PUT /:id` - Update user (Admin only)
- `DELETE /:id` - Delete user (Admin only)
- `GET /technicians` - Get all technicians
- `GET /stats` - Get user statistics (Admin only)

## Role Permissions

### Employee
- Create and view their own tickets
- Add comments to their tickets
- Update their profile

### Technician
- View assigned tickets and unassigned tickets
- Update ticket status and priority
- Add comments and resolutions
- View their profile

### Admin
- Full access to all features
- Manage users (CRUD operations)
- Assign tickets to technicians
- View all statistics and analytics
- System configuration

## Project Structure

```
thinkauto_backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── ticketController.js  # Ticket management
│   └── userController.js    # User management
├── middleware/
│   └── auth.js              # JWT & role verification
├── models/
│   ├── User.js              # User schema
│   └── Ticket.js            # Ticket schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── ticketRoutes.js      # Ticket endpoints
│   └── userRoutes.js        # User endpoints
├── scripts/
│   └── seedAdmin.js         # Admin creation script
├── .env                     # Environment variables
├── .gitignore
├── package.json
└── server.js                # Express app entry point
```

## Database Schema

### User Model
- name, email, password (hashed)
- role: employee, technician, admin
- department, phoneNumber, avatar
- isActive, lastLogin, timestamps

### Ticket Model
- ticketNumber (auto-generated)
- title, description, category, priority
- status: Open, In Progress, Resolved, Unsolved, On Hold
- createdBy (User ref), assignedTo (User ref)
- comments, attachments, SLA tracking
- AI suggestions, resolution details
- rating and feedback

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (RBAC)
- Protected admin routes
- Input validation
- CORS configuration
- Environment variable protection

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start

# Seed admin user
npm run seed
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - Token expiration time
- `NODE_ENV` - Environment (development/production)
- `ADMIN_EMAIL` - Admin email address
- `ADMIN_PASSWORD` - Admin password
- `FRONTEND_URL` - Frontend URL for CORS

## License

Copyright © 2026 ThinkAuto. All rights reserved.
