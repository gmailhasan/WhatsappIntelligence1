# WhatsApp AI Campaign Manager

## Overview

This is a full-stack WhatsApp AI campaign management application built with React (frontend) and Express.js (backend). The system enables users to create and manage WhatsApp campaigns with AI-powered responses using website content for contextual information through RAG (Retrieval-Augmented Generation).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API endpoints
- **Session Management**: PostgreSQL-based session storage
- **File Structure**: Modular service-based architecture

## Key Components

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: User authentication and profile management
- **Websites**: Website URLs for content crawling and indexing
- **Website Content**: Scraped content with vector embeddings for RAG
- **Templates**: Message templates with variable support and AI enablement
- **Campaigns**: Campaign management with template association
- **Conversations**: WhatsApp conversation tracking
- **Messages**: Individual message storage with metadata

### Services Layer
- **Web Scraper Service**: Crawls websites to extract content for AI context
- **Vector Store Service**: Manages content embeddings and similarity search
- **OpenAI Service**: Handles AI response generation and content embedding
- **WhatsApp Service**: Manages WhatsApp message sending and webhook handling
- **Storage Service**: Database abstraction layer for all data operations

### Frontend Pages
- **Dashboard**: Main overview with stats and quick actions
- **Campaigns**: Campaign creation and management interface
- **Templates**: Message template creation and editing
- **Conversations**: Real-time conversation management
- **AI Configuration**: Website crawling and AI settings
- **Analytics**: Performance metrics and reporting

## Data Flow

1. **Content Ingestion**: Users add website URLs which are crawled and stored with vector embeddings
2. **Template Creation**: Users create message templates with variables and AI enablement options
3. **Campaign Management**: Users create campaigns associating templates with phone number lists
4. **Message Processing**: Incoming WhatsApp messages trigger AI responses using RAG with website content
5. **Response Generation**: OpenAI generates contextual responses based on website content and conversation history

## External Dependencies

### AI and Machine Learning
- **OpenAI API**: GPT-4o model for text generation and text-embedding-ada-002 for embeddings
- **Vector Search**: Cosine similarity for content matching

### UI and Styling
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast JavaScript bundler for production

### Database and Storage
- **Neon Database**: Serverless PostgreSQL provider
- **Drizzle ORM**: Type-safe database operations
- **Connect-PG-Simple**: PostgreSQL session store

## Deployment Strategy

### Build Process
- Frontend builds to `dist/public` directory using Vite
- Backend builds to `dist` directory using ESBuild
- Single deployment artifact serving both frontend and API

### Environment Configuration
- Development: `npm run dev` starts Express server with Vite middleware
- Production: `npm run build` creates optimized bundles, `npm start` serves the application
- Database migrations: `npm run db:push` applies schema changes

### Infrastructure Requirements
- Node.js environment supporting ES modules
- PostgreSQL database (provided by Neon)
- OpenAI API key for AI functionality
- WhatsApp Business API credentials (mocked in current implementation)

The application is designed to be deployed on platforms like Replit, Vercel, or traditional hosting with Node.js support, with the database hosted on Neon's serverless PostgreSQL platform.