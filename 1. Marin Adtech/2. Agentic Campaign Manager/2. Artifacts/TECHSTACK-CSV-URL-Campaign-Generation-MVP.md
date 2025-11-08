# Tech Stack: CSV/URL-Based Campaign Generation MVP

**Document Version**: 1.0  
**Created**: January 2025  
**Last Updated**: January 2025  
**Project**: CSV/URL-Based Campaign Generation MVP  
**Integration**: Agentic Campaign Manager Module

---

## Table of Contents

1. [Overview](#overview)
2. [Frontend Tech Stack](#frontend-tech-stack)
3. [Backend Tech Stack](#backend-tech-stack)
4. [External Services & APIs](#external-services--apis)
5. [Development Tools](#development-tools)
6. [Build & Deployment Tools](#build--deployment-tools)
7. [Testing Framework](#testing-framework)
8. [Package Versions](#package-versions)
9. [Dependencies Overview](#dependencies-overview)

---

## Overview

The CSV/URL-Based Campaign Generation MVP is built using a modern, type-safe stack with React on the frontend and Node.js/Express on the backend. The architecture emphasizes type safety, performance, and maintainability.

### Stack Summary

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **State Management**: Zustand
- **API Communication**: Axios
- **External APIs**: Google Ads API, OpenAI/Claude API
- **Build Tools**: Vite, TypeScript Compiler
- **Testing**: Jest + React Testing Library

---

## Frontend Tech Stack

### Core Framework

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **React** | ^18.3.1 | UI framework for building component-based interfaces | [React Docs](https://react.dev/) |
| **TypeScript** | 5.0 | Type safety and enhanced developer experience | [TypeScript Docs](https://www.typescriptlang.org/) |
| **Vite** | ^7.1.12 | Fast build tool and dev server with HMR | [Vite Docs](https://vitejs.dev/) |

### Routing

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **react-router-dom** | ^7.9.5 | Client-side routing for single-page application | [React Router Docs](https://reactrouter.com/) |

### State Management

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **Zustand** | ^5.0.8 | Lightweight state management library | [Zustand Docs](https://zustand-demo.pmnd.rs/) |

### HTTP Client

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **Axios** | ^1.13.2 | HTTP client for API requests with interceptors | [Axios Docs](https://axios-http.com/) |

### UI Components & Libraries

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **@tanstack/react-table** | ^8.21.3 | Powerful table/grid component for spreadsheet-like preview | [React Table Docs](https://tanstack.com/table) |
| **react-dropzone** | ^14.3.8 | Drag-and-drop file upload component for CSV upload | [React Dropzone Docs](https://react-dropzone.js.org/) |
| **recharts** | ^3.3.0 | Charting library for performance visualization (if needed) | [Recharts Docs](https://recharts.org/) |

### Data Processing

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **papaparse** | ^5.5.3 | CSV parsing library for client-side CSV processing | [PapaParse Docs](https://www.papaparse.com/) |

### Frontend Development Dependencies

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **@vitejs/plugin-react** | ^5.1.0 | Vite plugin for React support | [Vite React Plugin](https://github.com/vitejs/vite-plugin-react) |
| **@types/react** | ^18.3.26 | TypeScript types for React | - |
| **@types/react-dom** | ^18.3.7 | TypeScript types for React DOM | - |
| **@types/papaparse** | ^5.5.0 | TypeScript types for PapaParse | - |
| **@types/react-router-dom** | ^5.3.3 | TypeScript types for React Router | - |

---

## Backend Tech Stack

### Core Framework

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **Node.js** | 18+ | JavaScript runtime for backend server | [Node.js Docs](https://nodejs.org/) |
| **Express** | ^5.1.0 | Web framework for building REST API | [Express Docs](https://expressjs.com/) |
| **TypeScript** | 5.0 | Type safety for backend code | [TypeScript Docs](https://www.typescriptlang.org/) |

### Development Tools

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **ts-node-dev** | ^2.0.0 | TypeScript execution with auto-restart on file changes | [ts-node-dev](https://github.com/wclr/ts-node-dev) |
| **ts-node** | ^10.9.2 | TypeScript execution environment | [ts-node](https://github.com/TypeStrong/ts-node) |

### Middleware & Utilities

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **cors** | ^2.8.5 | Cross-Origin Resource Sharing middleware | [CORS Docs](https://github.com/expressjs/cors) |
| **cookie-parser** | ^1.4.7 | Cookie parsing middleware for OAuth | [Cookie Parser](https://github.com/expressjs/cookie-parser) |
| **dotenv** | ^17.2.3 | Environment variable management | [dotenv](https://github.com/motdotla/dotenv) |
| **multer** | ^2.0.2 | File upload middleware for CSV uploads | [Multer Docs](https://github.com/expressjs/multer) |

### Data Processing

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **papaparse** | ^5.5.3 | CSV parsing library for server-side CSV processing | [PapaParse Docs](https://www.papaparse.com/) |

### HTTP Client

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **axios** | ^1.13.2 | HTTP client for external API calls | [Axios Docs](https://axios-http.com/) |

### Backend Development Dependencies

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **@types/express** | ^5.0.5 | TypeScript types for Express | - |
| **@types/cors** | ^2.8.19 | TypeScript types for CORS | - |
| **@types/cookie-parser** | ^1.4.10 | TypeScript types for cookie-parser | - |
| **@types/multer** | ^2.0.0 | TypeScript types for Multer | - |
| **@types/node** | ^24.10.0 | TypeScript types for Node.js | - |

---

## External Services & APIs

### Google Ads API

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **google-ads-api** | ^21.0.1 | Official Google Ads API client library | [Google Ads API Docs](https://developers.google.com/google-ads/api/docs/start) |

**Usage**:
- Query existing campaigns
- Extract ad groups, keywords, and ad copy
- Get performance metrics
- OAuth 2.0 authentication

**Authentication**: OAuth 2.0 flow with refresh tokens

### LLM APIs

#### OpenAI (Primary Option)

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **openai** | Latest | OpenAI API client for keyword and ad copy generation | [OpenAI API Docs](https://platform.openai.com/docs) |

**Models Used**:
- `gpt-4o-mini` (recommended for cost-effectiveness)
- `gpt-4` (for higher quality, if needed)

**Usage**:
- Keyword generation (20 keywords per product)
- RSA headline generation (15 headlines)
- RSA description generation (4 descriptions)

#### Anthropic Claude (Alternative Option)

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **@anthropic-ai/sdk** | Latest | Anthropic Claude API client | [Anthropic API Docs](https://docs.anthropic.com/) |

**Models Used**:
- `claude-3-haiku` (recommended for cost-effectiveness)
- `claude-3-sonnet` (for higher quality, if needed)

**Usage**: Same as OpenAI (keyword and ad copy generation)

**Note**: Choose one LLM provider based on cost, quality, and availability requirements.

---

## Development Tools

### Code Quality

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **ESLint** | Latest | JavaScript/TypeScript linting | [ESLint Docs](https://eslint.org/) |
| **Prettier** | Latest | Code formatting (optional) | [Prettier Docs](https://prettier.io/) |

### Type Checking

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **TypeScript Compiler** | 5.0 | Static type checking | [TypeScript Docs](https://www.typescriptlang.org/) |

**Commands**:
- Frontend: `npm run type-check` (tsc --noEmit)
- Backend: Built into build process

---

## Build & Deployment Tools

### Frontend Build

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **Vite** | ^7.1.12 | Build tool and bundler | [Vite Docs](https://vitejs.dev/) |

**Build Process**:
1. TypeScript compilation (`tsc`)
2. Vite bundling and optimization
3. Output to `dist/` directory

**Features**:
- Code splitting
- Tree shaking
- Minification
- Source maps (development)

### Backend Build

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **TypeScript Compiler** | 5.0 | TypeScript to JavaScript compilation | [TypeScript Docs](https://www.typescriptlang.org/) |

**Build Process**:
1. TypeScript compilation (`tsc`)
2. Output to `backend/dist/` directory
3. Run with Node.js: `node dist/index.js`

---

## Testing Framework

### Testing Libraries

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|----------------|
| **Jest** | ^30.2.0 | JavaScript testing framework | [Jest Docs](https://jestjs.io/) |
| **ts-jest** | ^29.4.5 | TypeScript preprocessor for Jest | [ts-jest](https://github.com/kulshekhar/ts-jest) |
| **@testing-library/react** | ^16.3.0 | React component testing utilities | [React Testing Library](https://testing-library.com/react) |
| **@testing-library/jest-dom** | ^6.9.1 | Custom Jest matchers for DOM | [jest-dom](https://github.com/testing-library/jest-dom) |
| **@testing-library/user-event** | ^14.6.1 | User interaction simulation | [user-event](https://github.com/testing-library/user-event) |
| **supertest** | ^7.1.4 | HTTP assertion library for API testing | [Supertest](https://github.com/visionmedia/supertest) |
| **jest-environment-jsdom** | ^30.2.0 | JSDOM environment for Jest (frontend tests) | - |
| **identity-obj-proxy** | ^3.0.0 | CSS module mocking for Jest | - |

### Testing Structure

**Frontend Tests**:
- Component tests: `src/components/__tests__/`
- Hook tests: `src/hooks/__tests__/`
- Service tests: `src/services/__tests__/`
- Store tests: `src/store/__tests__/`

**Backend Tests**:
- Service tests: `backend/src/services/__tests__/`
- Controller tests: `backend/src/controllers/__tests__/`
- Route tests: `backend/src/routes/__tests__/`
- Integration tests: `backend/src/__tests__/`

**Test Commands**:
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

---

## Package Versions

### Frontend package.json

```json
{
  "dependencies": {
    "@tanstack/react-table": "^8.21.3",
    "axios": "^1.13.2",
    "papaparse": "^5.5.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-dropzone": "^14.3.8",
    "react-router-dom": "^7.9.5",
    "recharts": "^3.3.0",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/jest": "^30.0.0",
    "@types/papaparse": "^5.5.0",
    "@types/react": "^18.3.26",
    "@types/react-dom": "^18.3.7",
    "@types/react-router-dom": "^5.3.3",
    "@vitejs/plugin-react": "^5.1.0",
    "identity-obj-proxy": "^3.0.0",
    "jest": "^30.2.0",
    "jest-environment-jsdom": "^30.2.0",
    "ts-jest": "^29.4.5",
    "ts-node": "^10.9.2",
    "typescript": "5.0",
    "vite": "^7.1.12"
  }
}
```

### Backend package.json

```json
{
  "dependencies": {
    "axios": "^1.13.2",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "google-ads-api": "^21.0.1",
    "multer": "^2.0.2",
    "papaparse": "^5.5.3"
  },
  "devDependencies": {
    "@types/axios": "^0.9.36",
    "@types/cookie-parser": "^1.4.10",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.5",
    "@types/jest": "^30.0.0",
    "@types/multer": "^2.0.0",
    "@types/node": "^24.10.0",
    "@types/supertest": "^6.0.3",
    "jest": "^30.2.0",
    "supertest": "^7.1.4",
    "ts-jest": "^29.4.5",
    "ts-node-dev": "^2.0.0",
    "typescript": "5.0"
  }
}
```

### Optional LLM Dependencies

**For OpenAI**:
```json
{
  "dependencies": {
    "openai": "^4.0.0"
  }
}
```

**For Anthropic Claude**:
```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0"
  }
}
```

---

## Dependencies Overview

### Critical Dependencies

| Dependency | Purpose | Required For |
|------------|---------|--------------|
| **React** | UI framework | All frontend components |
| **Express** | Backend framework | All API endpoints |
| **TypeScript** | Type safety | Entire codebase |
| **Zustand** | State management | Frontend state |
| **Axios** | HTTP client | API communication |
| **PapaParse** | CSV parsing | CSV upload feature |
| **@tanstack/react-table** | Table component | Spreadsheet preview |
| **google-ads-api** | Google Ads integration | Pattern learning |
| **openai** or **@anthropic-ai/sdk** | AI generation | Keyword & ad copy generation |

### Optional Dependencies

| Dependency | Purpose | When Needed |
|------------|---------|-------------|
| **recharts** | Charting | Performance visualization (if added) |
| **react-dropzone** | File upload | CSV drag-and-drop (already included) |

---

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
VITE_OPENAI_API_KEY=your_openai_api_key (optional, for direct frontend calls)
```

### Backend (.env)

```env
# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

# Google Ads API
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CUSTOMER_ID=your_customer_id

# LLM API (Choose one)
OPENAI_API_KEY=your_openai_api_key
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key

# OAuth (if separate)
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
```

---

## Browser Support

### Supported Browsers

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| **Chrome** | Latest | Primary development target |
| **Firefox** | Latest | Full support |
| **Safari** | Latest | Full support |
| **Edge** | Latest | Full support |

### Required Features

- ES6+ support
- Fetch API (or Axios polyfill)
- CSS Grid & Flexbox
- IndexedDB (for offline support, if implemented)

---

## Node.js Requirements

### Minimum Version

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or use yarn/pnpm)

### Recommended Version

- **Node.js**: 20.x LTS
- **npm**: 10.x

---

## Development Workflow

### Setup Commands

```bash
# Frontend
cd Module-Agentic_Campaign_Manager
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

### Build Commands

```bash
# Frontend
npm run build          # Production build
npm run preview        # Preview production build
npm run type-check     # Type checking only

# Backend
npm run build          # Compile TypeScript
npm start              # Run production build
```

### Test Commands

```bash
# Frontend
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report

# Backend
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

---

## Technology Decisions

### Why React 18?

- **Modern Hooks API**: Functional components with hooks
- **Concurrent Features**: Better performance for complex UIs
- **Large Ecosystem**: Extensive library support
- **TypeScript Support**: Excellent type definitions

### Why TypeScript?

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete and refactoring
- **Documentation**: Types serve as inline documentation
- **Maintainability**: Easier to maintain large codebases

### Why Vite?

- **Fast Dev Server**: Near-instant HMR
- **Optimized Builds**: Fast production builds
- **Modern Tooling**: ES modules, native ESM support
- **Plugin Ecosystem**: Extensive plugin support

### Why Zustand?

- **Lightweight**: Minimal bundle size
- **Simple API**: Easy to learn and use
- **TypeScript Support**: Excellent type inference
- **No Boilerplate**: Less code than Redux

### Why Express?

- **Mature**: Battle-tested framework
- **Flexible**: Unopinionated, easy to customize
- **Middleware**: Rich middleware ecosystem
- **TypeScript Support**: Good type definitions

### Why Jest?

- **Zero Configuration**: Works out of the box
- **Fast**: Parallel test execution
- **Snapshot Testing**: Great for UI components
- **Mocking**: Built-in mocking capabilities

---

## Future Considerations

### Potential Additions

| Technology | Purpose | When Needed |
|------------|---------|-------------|
| **React Query** | Server state management | If API caching becomes complex |
| **Zod** | Runtime validation | If schema validation needed |
| **React Hook Form** | Form management | If complex forms added |
| **Docker** | Containerization | For deployment |
| **Redis** | Caching | If performance optimization needed |
| **PostgreSQL** | Database | If persistent storage needed |

---

## Version Compatibility Matrix

| Component | Version | Compatible With |
|-----------|---------|-----------------|
| React | 18.3.1 | React DOM 18.3.1+ |
| TypeScript | 5.0 | Node.js 18+ |
| Vite | 7.1.12 | Node.js 18+ |
| Express | 5.1.0 | Node.js 18+ |
| Jest | 30.2.0 | Node.js 18+ |

---

## Security Considerations

### Package Security

- **Regular Updates**: Keep dependencies updated
- **Audit**: Run `npm audit` regularly
- **Lock Files**: Commit `package-lock.json`
- **Dependency Scanning**: Use tools like Snyk or Dependabot

### API Security

- **Environment Variables**: Never commit API keys
- **OAuth Tokens**: Store securely, refresh automatically
- **CORS**: Configure properly for production
- **Input Validation**: Validate all user inputs
- **Rate Limiting**: Implement for external APIs

---

*Document Version: 1.0*  
*Created: January 2025*  
*Project: CSV/URL-Based Campaign Generation MVP*  
*Integration: Agentic Campaign Manager Module*

