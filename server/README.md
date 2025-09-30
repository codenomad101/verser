# Server Architecture

This directory contains the refactored server code with a clean separation of concerns.

## Structure

### Controllers (`/controllers/`)
Contains business logic for each domain:
- `authController.ts` - Authentication (login, register, logout, me)
- `userController.ts` - User management (CRUD, settings)
- `conversationController.ts` - Chat and messaging functionality
- `communityController.ts` - Community management
- `postController.ts` - Post creation and management
- `foodController.ts` - Food ordering system
- `travelController.ts` - Travel booking system
- `adminController.ts` - Admin panel functionality
- `searchController.ts` - Search functionality

### Routes (`/routes/`)
Contains route definitions with middleware:
- `authRoutes.ts` - Authentication endpoints
- `userRoutes.ts` - User-related endpoints
- `conversationRoutes.ts` - Chat and messaging endpoints
- `communityRoutes.ts` - Community endpoints
- `postRoutes.ts` - Post endpoints
- `foodRoutes.ts` - Food ordering endpoints
- `travelRoutes.ts` - Travel booking endpoints
- `adminRoutes.ts` - Admin panel endpoints
- `searchRoutes.ts` - Search endpoints
- `index.ts` - Main route registration

### WebSocket (`websocket.ts`)
Handles real-time communication:
- WebSocket server setup
- Connection management
- Message broadcasting
- User status updates

### Main Files
- `routes.ts` - Main route registration and WebSocket setup
- `auth.ts` - Authentication middleware and utilities
- `admin.ts` - Admin authorization middleware
- `storage.ts` - Database operations
- `db.ts` - Database connection

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user

### Users (`/api/users`)
- `GET /` - Get all users
- `GET /:id` - Get user by ID
- `GET /:id/posts` - Get user's posts
- `PATCH /settings` - Update user settings

### Conversations (`/api/conversations`)
- `GET /` - Get all conversations
- `POST /` - Create conversation
- `GET /:id/messages` - Get conversation messages
- `POST /messages` - Send message
- `GET /chat-requests` - Get incoming chat requests
- `POST /chat-requests` - Send chat request
- `POST /chat-requests/:id/accept` - Accept chat request
- `POST /chat-requests/:id/reject` - Reject chat request

### Communities (`/api/communities`)
- `GET /` - Get all communities
- `GET /:id` - Get community by ID
- `POST /` - Create community
- `GET /:id/posts` - Get community posts

### Posts (`/api/posts`)
- `GET /` - Get all posts
- `GET /trending` - Get trending posts
- `POST /` - Create post
- `PATCH /:id/like` - Like post

### Food Orders (`/api/orders`)
- `GET /mine` - Get user's orders
- `POST /` - Create order
- `GET /admin` - Get all orders (admin)
- `PUT /admin/:id/status` - Update order status (admin)

### Travel Bookings (`/api/travel-bookings`)
- `GET /mine` - Get user's bookings
- `POST /` - Create booking
- `GET /admin` - Get all bookings (admin)
- `PUT /admin/:id/status` - Update booking status (admin)

### Admin (`/api/admin`)
- `GET /stats` - Get admin statistics
- `GET /users` - Get all users
- `GET /posts` - Get all posts
- `GET /communities` - Get all communities
- `DELETE /users/:id` - Delete user
- `DELETE /posts/:id` - Delete post
- `PUT /users/:id/status` - Update user status
- `PUT /users/:id/role` - Update user role (superuser)

### Search (`/api/search`)
- `GET /` - Search users, communities, and posts

## WebSocket Events

### Client to Server
- `join` - Join with user ID
- `send_message` - Send a message
- `typing` - Typing indicator

### Server to Client
- `user_status` - User online/offline status
- `new_message` - New message received
- `user_typing` - User typing indicator
- `new_post` - New post created

## Middleware

- `authenticateToken` - Verify JWT token
- `optionalAuth` - Optional authentication
- `requireAdmin` - Require admin role
- `requireSuperuser` - Require superuser role

## Benefits of This Structure

1. **Separation of Concerns**: Controllers handle business logic, routes handle HTTP concerns
2. **Modularity**: Each domain is self-contained
3. **Maintainability**: Easy to find and modify specific functionality
4. **Testability**: Controllers can be unit tested independently
5. **Scalability**: Easy to add new features or modify existing ones
6. **Code Reuse**: Common functionality is centralized
