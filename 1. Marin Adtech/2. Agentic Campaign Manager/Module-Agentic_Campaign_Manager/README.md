# Agentic Campaign Manager Module

A web-based React module for the Ad Development Environment (ADE) that enables performance marketers to create, launch, and optimize advertising campaigns from scratch using natural language goals, with AI agents handling all tactical execution autonomously.

## Project Overview

This module provides:
- **Natural Language Goal Input**: Describe campaign goals in plain English
- **AI-Powered Campaign Creation**: AI generates and creates campaigns autonomously
- **Multi-Channel Support**: Google Ads, Meta Ads (single platform for MVP)
- **Performance Monitoring**: Real-time campaign performance tracking
- **Autonomous Optimization**: AI-driven campaign optimization (post-MVP)

## Technology Stack

### Frontend
- React 18 + TypeScript 5.0
- Vite (build tool)
- React Router (routing)
- Zustand/Redux (state management)
- Axios (HTTP client)

### Backend
- Node.js + Express
- TypeScript
- CORS, Cookie Parser
- OpenAI/Claude API integration
- Google Ads API / Meta Marketing API

## Project Structure

```
Module-Agentic_Campaign_Manager/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   ├── store/             # State management
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration
│   └── assets/            # Static assets
├── backend/               # Backend source code
│   └── src/
│       ├── routes/        # API routes
│       ├── controllers/   # Route controllers
│       ├── services/      # Business logic
│       ├── middleware/    # Express middleware
│       ├── types/         # TypeScript types
│       └── utils/         # Utility functions
├── package.json           # Frontend dependencies
└── backend/package.json   # Backend dependencies
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

1. Install frontend dependencies:
```powershell
npm install
```

2. Install backend dependencies:
```powershell
cd backend
npm install
cd ..
```

### Development

1. Start backend server:
```powershell
cd backend
npm run dev
```

2. Start frontend dev server:
```powershell
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `OPENAI_API_KEY`: Your OpenAI API key
- `GOOGLE_ADS_CLIENT_ID`: Google Ads OAuth client ID
- `GOOGLE_ADS_CLIENT_SECRET`: Google Ads OAuth client secret

## MVP Features

- [x] Project setup and foundation
- [ ] Conversational interface for goal input
- [ ] AI-powered goal understanding
- [ ] Campaign preview and approval
- [ ] Campaign creation (Google Ads OR Meta)
- [ ] Campaign launch and tracking
- [ ] Basic performance dashboard

## Development Timeline

- **Phase 1**: Project Setup & Foundation (4 hours)
- **Phase 2**: Conversational Interface & Goal Understanding (4 hours)
- **Phase 3**: Campaign Preview & Creation (4 hours)
- **Phase 4**: Campaign Launch & Tracking (4 hours)
- **Phase 5**: Performance Dashboard (4 hours)
- **Phase 6**: Integration & Polish (8 hours)

**Total**: 24 hours (MVP Demo by Tomorrow 5:00 PM)

---

*Document Version: 1.0*  
*Created: January 2025*

