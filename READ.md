# ChatPDF Application

## Overview

ChatPDF is a full-stack web application that allows users to upload PDF documents and interact with them through natural language chat. The system uses AI to extract insights from documents and provide responses with page citations. Built with React frontend, Express backend, and integrates with Hugging Face's AI models for document understanding and conversational AI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Clean, utility-focused approach inspired by productivity tools like Notion and Linear

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **File Processing**: PDF text extraction using pdf-parse library with multer for file uploads
- **Data Storage**: 
  - Drizzle ORM configured for PostgreSQL (schema defined but currently using in-memory storage)
  - In-memory storage implementation for development/testing
  - Text chunking system for efficient document processing
- **API Structure**: RESTful endpoints for document upload, chat interactions, and document management

### AI Integration
- **LLM Provider**: Hugging Face Inference API using Mistral-7B-Instruct model
- **Document Processing**: Text chunking and embedding system for context retrieval
- **Chat System**: Conversation history management with document context injection
- **Citation System**: Automatic page number extraction and citation generation

### Authentication & Session Management
- Session-based authentication using connect-pg-simple for PostgreSQL session storage
- No user authentication implemented yet - focuses on document-centric interactions

### Development & Deployment
- **Build System**: Vite for frontend bundling with hot module replacement
- **Development Tools**: TypeScript compilation, ESLint configuration, Replit-specific plugins
- **Environment**: Configured for both local development and Replit deployment
- **File Structure**: Monorepo structure with shared types and schemas between client and server

### Key Design Decisions
- **Text Processing**: Chunking strategy for large documents to improve AI response accuracy
- **Storage Strategy**: Dual approach with in-memory for development and PostgreSQL schema for production
- **UI Architecture**: Component-based design with shadcn/ui for consistency and accessibility
- **State Management**: React Query for optimistic updates and efficient data fetching
- **PDF Handling**: Browser-based PDF viewing with server-side text extraction

## External Dependencies

### Core Dependencies
- **@huggingface/inference**: AI model integration for text generation and embeddings
- **pdf-parse**: Server-side PDF text extraction and processing
- **@neondatabase/serverless**: PostgreSQL database connection (serverless-optimized)
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect

### UI & Frontend Libraries
- **@radix-ui/react-***: Comprehensive set of unstyled, accessible UI components
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework for styling
- **wouter**: Minimalist routing library for React
- **class-variance-authority**: Utility for creating component variants

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-***: Replit-specific development tools and error handling

### Backend Infrastructure
- **express**: Web application framework for Node.js
- **multer**: Middleware for handling multipart/form-data (file uploads)
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Validation & Forms
- **zod**: Schema validation library for TypeScript
- **@hookform/resolvers**: Form validation resolvers for React Hook Form
- **react-hook-form**: Performant forms with easy validation (via shadcn components)