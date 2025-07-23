# PromessiSposi Academy - Replit.md

## Overview

PromessiSposi Academy is a gamified web application designed to make learning Alessandro Manzoni's "I Promessi Sposi" engaging and interactive. The app features chapter-based content, quizzes, user progression tracking, badges, daily challenges, and social features like leaderboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Renaissance-inspired color scheme
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with consistent error handling
- **Database ORM**: Drizzle ORM for type-safe database operations

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Session Storage**: PostgreSQL table for session persistence
- **Connection Pooling**: Neon serverless connection pooling
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Management**: Server-side sessions stored in PostgreSQL
- **User Creation**: Automatic user creation on first login
- **Security**: HTTP-only cookies, CSRF protection

### Gamification Features
- **XP System**: Experience points for completing activities
- **Level Progression**: Users advance levels based on accumulated XP
- **Virtual Currency**: Coins for accessing premium content
- **Badge System**: Achievement tracking with visual rewards
- **Streak Tracking**: Daily login streaks with bonuses
- **Leaderboards**: Global and friends-based competition

### Content Management
- **Chapter Structure**: 38 chapters with interactive content
- **Quiz System**: Multiple choice, true/false, and drag-drop questions
- **Progress Tracking**: Chapter completion and reading progress
- **Challenge System**: Daily and weekly challenges

### User Interface
- **Design System**: Custom Renaissance-inspired theming
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Component Library**: Shadcn/ui for consistent UI components
- **Navigation**: Bottom navigation for mobile, sidebar for desktop
- **Accessibility**: ARIA labels, keyboard navigation support

## Data Flow

### User Authentication Flow
1. User visits application
2. If not authenticated, redirected to Replit Auth
3. Upon successful login, user data is fetched/created
4. User session is established and maintained
5. Protected routes become accessible

### Content Consumption Flow
1. User views chapter grid showing progress and availability
2. Chapters are unlocked sequentially based on completion
3. Reading progress is tracked and saved automatically
4. Quiz completion unlocks next chapter
5. XP and badges are awarded for achievements

### Challenge System Flow
1. Daily challenges are generated/fetched
2. User progress is tracked throughout the day
3. Challenge completion awards XP and coins
4. Weekly challenges provide additional long-term goals

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth service
- **UI Components**: Radix UI primitives
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome (loaded via CDN)

### Development Dependencies
- **TypeScript**: Type safety across the application
- **Vite**: Build tool and development server
- **Drizzle Kit**: Database migration management
- **ESBuild**: Production server bundling

### Third-party Services
- **Replit Environment**: Development and hosting platform
- **Neon Database**: Serverless PostgreSQL hosting
- **CDN Resources**: Font Awesome icons, Replit development banner

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon development database with connection pooling
- **Authentication**: Replit Auth development configuration
- **Environment Variables**: `.env` file for local secrets

### Production Deployment
- **Build Process**: Vite builds client assets, ESBuild bundles server
- **Server**: Node.js Express server serving both API and static files
- **Database**: Production Neon PostgreSQL instance
- **Environment**: Replit production environment with proper secrets
- **Session Storage**: PostgreSQL-backed session store for scalability

### Configuration Management
- **Environment Variables**: Database URL, session secrets, OIDC configuration
- **Build Scripts**: Separate development and production build processes
- **Database Migrations**: Drizzle migrations for schema updates
- **Asset Optimization**: Vite handles code splitting and optimization

### Security Considerations
- **HTTPS**: Enforced in production environment
- **Session Security**: HTTP-only cookies with secure flags
- **CSRF Protection**: Built into session management
- **Input Validation**: Schema validation using Zod
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM