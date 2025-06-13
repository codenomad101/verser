# Verser - Social Platform Application

## Overview

Verser is a full-stack social media and communication platform built with modern web technologies. It combines real-time chat, community management, content discovery, and integrated services like payments, food ordering, and travel booking. The application features a React frontend with Express.js backend, using PostgreSQL for data persistence and WebSocket for real-time communication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Real-time Communication**: WebSocket server for live messaging and notifications
- **API Design**: RESTful API with structured error handling

### Database Design
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Storage Abstraction**: Interface-based storage layer supporting multiple backends (PostgreSQL, MongoDB, in-memory)

## Key Components

### Authentication System
- JWT-based authentication with 30-day token expiration
- Password hashing using bcrypt with salt rounds
- Protected routes with middleware authentication
- Demo login functionality for quick testing

### Real-time Communication
- WebSocket server integrated with Express HTTP server
- Real-time messaging with conversation support
- Live user status updates (online/offline/away)
- Message broadcasting and user presence tracking

### Multi-Service Platform
- **Chat**: Direct and group messaging with real-time updates
- **Communities**: Topic-based discussion groups with posts and interactions
- **Discovery**: Content feed with trending posts and user-generated content
- **VerserPay**: Integrated payment system for money transfers
- **Food Ordering**: Restaurant and menu management system
- **Travel Booking**: Bus, train, and hotel reservation system

### Data Models
- **Users**: Profile management with status, bio, privacy settings
- **Conversations**: Group and direct messaging support
- **Messages**: Text, image, and file message types
- **Communities**: Topic-based groups with member management
- **Posts**: Content creation with likes, comments, and sharing

## Data Flow

### Client-Server Communication
1. **Authentication Flow**: Login/Register → JWT token → Stored in localStorage → Authorization header
2. **API Requests**: React Query manages server state with automatic caching and revalidation
3. **Real-time Updates**: WebSocket connection established on user login for live features
4. **State Management**: Server state via React Query, UI state via React hooks

### Database Operations
1. **Connection**: Neon PostgreSQL with connection pooling
2. **Queries**: Drizzle ORM with type-safe query building
3. **Migrations**: Schema changes managed through Drizzle Kit
4. **Storage Layer**: Abstracted interface allows switching between database backends

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: drizzle-orm with drizzle-kit for schema management
- **Authentication**: jsonwebtoken for JWT handling, bcryptjs for password security
- **Real-time**: ws (WebSocket) library for live communication
- **UI Library**: @radix-ui components with class-variance-authority for styling
- **State Management**: @tanstack/react-query for server state
- **Forms**: @hookform/resolvers with react-hook-form (implied by resolvers)

### Development Dependencies
- **Build Tools**: Vite with React plugin and TypeScript support
- **Runtime**: tsx for TypeScript execution in development
- **Bundling**: esbuild for production server bundling

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Database**: Replit PostgreSQL module for development database

### Production Deployment
- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles server
- **Server**: Express serves static files in production mode
- **Database**: Production PostgreSQL connection via DATABASE_URL environment variable
- **Port Configuration**: Server runs on port 5000, exposed as port 80

### Build Commands
- `npm run dev`: Development mode with hot reload
- `npm run build`: Production build for both frontend and backend
- `npm start`: Production server startup
- `npm run db:push`: Database schema deployment

## Changelog
- June 13, 2025. Initial setup
- June 13, 2025. Desktop sidebar implementation with responsive layout, search bar in top navigation, centered main content with equal spacing

## User Preferences

Preferred communication style: Simple, everyday language.
Desktop layout: Always-visible sidebar on left, top navigation with search/notifications/avatar on right, centered main content with equal spacing.