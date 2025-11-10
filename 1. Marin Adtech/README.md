# Agentic Campaign Manager Module

AI-powered campaign creation and management for performance marketers. This module provides an intuitive conversational interface for creating, managing, and monitoring advertising campaigns across multiple platforms.

## Features

### Core Functionality
- **Conversational Campaign Creation**: Natural language interface with intelligent AI response extraction
- **Multi-Platform Support**: Google Ads, Meta, Microsoft Advertising
- **Campaign Management**: Create, view, edit, pause, resume, and delete campaigns
- **Campaign Plan Editing**: Full editor for modifying campaign plans before creation
- **Performance Dashboard**: Real-time metrics, time series analysis, and goal tracking
- **Offline Support**: Cached data with offline viewing capabilities
- **Export Functionality**: CSV export for metrics and time series data
- **Mock Data Indicators**: Clear badges showing when data is simulated vs. from API

### Technical Features
- **TypeScript**: Full type safety across the codebase
- **React 18**: Modern React with hooks and functional components
- **Responsive Design**: Mobile-first design with breakpoints for all screen sizes
- **Error Handling**: Comprehensive error boundaries, toast notifications, and user feedback
- **Performance Optimized**: Code splitting, tree shaking, and lazy loading
- **ADE Integration**: Ready for Ad Development Environment integration with toolbar, sidebar, and lifecycle hooks
- **Mock Data Support**: Intelligent mock data extraction with clear indicators
- **Offline Support**: IndexedDB caching with sync queue for offline requests

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API server running on port 3001

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

```bash
# Start dev server (frontend on port 3000)
npm run dev

# Type checking
npm run type-check

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
Module-Agentic_Campaign_Manager/
├── src/
│   ├── components/          # React components
│   │   ├── CampaignDashboard.tsx
│   │   ├── CampaignCreation.tsx
│   │   ├── CampaignDetail.tsx
│   │   ├── PerformanceDashboard.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ToastContainer.tsx
│   │   └── ...
│   ├── services/            # API services
│   │   ├── campaignService.ts
│   │   ├── performanceService.ts
│   │   └── ...
│   ├── store/               # Zustand state management
│   │   └── campaignStore.ts
│   ├── utils/               # Utility functions
│   │   ├── indexedDB.ts
│   │   ├── toastService.ts
│   │   └── ...
│   ├── types/               # TypeScript type definitions
│   │   ├── campaign.types.ts
│   │   ├── performance.types.ts
│   │   └── ade.types.ts
│   ├── config/              # Configuration
│   │   └── module.config.ts
│   ├── styles/              # CSS styles
│   │   └── responsive.css
│   ├── App.tsx              # Main app component
│   ├── AgenticCampaignManagerModule.tsx
│   └── main.tsx             # Entry point
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   └── package.json
├── public/                  # Static assets
├── dist/                    # Production build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## API Endpoints

### Campaign Endpoints
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign by ID
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/launch` - Launch campaign
- `POST /api/campaigns/:id/pause` - Pause campaign
- `POST /api/campaigns/:id/resume` - Resume campaign

### Performance Endpoints
- `GET /api/campaigns/:id/performance` - Get campaign performance metrics
  - Query params: `timeRange` (today|7d|30d|90d|custom), `startDate`, `endDate`, `includeTimeSeries`

### OAuth Endpoints
- `GET /api/oauth/:platform/auth` - Initiate OAuth flow
- `GET /api/oauth/:platform/callback` - OAuth callback handler
- `GET /api/oauth/:platform/status` - Check OAuth connection status
- `POST /api/oauth/:platform/disconnect` - Disconnect OAuth account

## Usage

### Creating a Campaign

1. Navigate to the Campaign Dashboard
2. Click "Create Campaign"
3. Use the conversational interface to describe your campaign:
   - Campaign objective
   - Target audience
   - Budget and timeline
   - Platforms (Google Ads, Meta, Microsoft)
4. Review the generated campaign plan
5. Launch the campaign

### Viewing Performance

1. Navigate to a campaign's detail page
2. Click "View Performance" or navigate to the Performance Dashboard
3. Select a time range (Today, 7 days, 30 days, 90 days, or Custom)
4. View metrics, charts, and goal comparisons
5. Export data as CSV if needed

### Managing Campaigns

- **Create**: Create new campaigns via conversational interface
- **Edit Plan**: Modify campaign plans before creation using the editor
- **View**: View campaign details and performance metrics
- **Pause**: Temporarily stop a campaign
- **Resume**: Restart a paused campaign
- **Delete**: Remove a campaign from the dashboard (with confirmation)

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Module Configuration

The module can be configured in `src/config/module.config.ts`:

```typescript
export const moduleConfig: Partial<ADEModule> = {
  id: 'agentic-campaign-manager',
  name: 'Agentic Campaign Manager',
  version: '1.0.0',
  // ...
};
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build:analyze
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mock Data Mode

When no OpenAI API key is configured, the module operates in **Mock Data Mode**:
- Intelligent extraction of campaign details from user input
- Always uses USD currency (regardless of mentioned currency)
- Clear "Mock Data" badges displayed in UI
- Simulated responses for demonstration purposes

**Note:** Mock data is clearly labeled with warning badges to distinguish it from real API responses.

## Performance

- **Code Splitting**: Automatic chunk splitting for optimal loading
- **Tree Shaking**: Unused code elimination
- **Lazy Loading**: Route-based code splitting
- **Caching**: IndexedDB caching for offline support
- **Optimization**: Minified and compressed production builds

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

ISC

## Recent Updates

### November 10, 2025 - Marin Dispatcher Integration Phase 2.1 Complete

**Marin Dispatcher Integration**:
- ✅ **Phase 0**: Project Setup & Configuration - COMPLETE
  - Environment variables configured
  - Dependencies installed (`aws-xray-sdk-core`, `axios`)
  - Development environment setup
- ✅ **Phase 1**: Type Definitions & Configuration - COMPLETE
  - All type definitions created (campaigns, ads, keywords, batch jobs)
  - Type validation utilities implemented
  - 81 automated tests passing (46 type tests + 35 validator tests)
  - `PlatformCampaignIds` interface updated with `marin` property
- ✅ **Phase 2.1**: Base Service Structure - COMPLETE
  - `MarinDispatcherService` class created
  - Constructor with configuration loading
  - `isAuthenticated()` method implemented
  - Helper methods implemented (`buildApiPath`, `mapCampaignPlanToRequest`, `mapResponseToPlatformResponse`)
  - X-Ray tracing integrated
  - 8 manual test suites passing
  - All placeholder methods return expected errors

**Implementation Statistics**:
- **Files Created**: 7 files (types, validators, service, tests)
- **Lines of Code**: 2,400+ lines
- **Test Coverage**: 89 tests, all passing (81 automated + 8 manual)
- **Commits**: b471ed0 (Phase 2.1 complete)

**Next Phase**: Phase 2.2 - Campaign CRUD Methods (estimated 2 hours)

For detailed progress, see `2. Artifacts/2. Integrated MVP/PROGRESS-SUMMARY.md` and `TASKLIST-Marin-Dispatcher-Integration.md`.

### November 9, 2025 - Merge Conflict Resolution, Configuration Integration & Development Workflow

**Merge Conflict Resolution**:
- ✅ Resolved merge conflict in `backend/src/config/env.ts` between `feat-Phase0-Gabe` and `develop` branches
- ✅ Successfully merged Meta Ads configuration (`metaAppId`, `metaAppSecret`) with Marin Dispatcher configuration
- ✅ Successfully merged Microsoft Ads configuration (`microsoftAdsClientId`, `microsoftAdsClientSecret`) with Marin Dispatcher configuration
- ✅ Preserved all configuration from both branches (no data loss)
- ✅ Updated TypeScript `Config` interface to include all merged configuration fields

**Configuration Integration**:
- ✅ Integrated `marinDispatcher` configuration object with existing ad platform configurations
- ✅ Maintained backward compatibility with existing environment variable patterns
- ✅ All configuration fields now properly typed in TypeScript interface
- ✅ Configuration validation updated to include Marin Dispatcher checks

**Testing & Quality Assurance**:
- ✅ Ran full test suite before committing merge
- ✅ Verified no TypeScript compilation errors after conflict resolution
- ✅ Confirmed all configuration fields accessible in codebase
- ✅ Tests executed successfully (pre-existing test failures unrelated to merge)

**Git Workflow**:
- ✅ Successfully committed merge with descriptive commit message
- ✅ Working tree clean after merge completion
- ✅ Branch ahead of `origin/develop` by 3 commits, ready for push

**Development Scripts**:
- ✅ Evaluated and improved all three development workflow scripts (Good-Morning, Mid-Day, Good-Night)
- ✅ Fixed critical syntax errors and missing error handling
- ✅ Standardized script behavior across all three files
- ✅ Converted bash scripts to PowerShell (.ps1) for Windows compatibility
- ✅ Added comprehensive error handling and user feedback
- ✅ Standardized status file naming and directory structure
- ✅ Made scripts executable in WSL/Git Bash environment

**Script Improvements**:
- ✅ Added branch validation and auto-detection of feature/bug branches
- ✅ Merge conflict detection with helpful error messages
- ✅ Stash existence verification before operations
- ✅ File existence checks before file operations
- ✅ Confirmation prompts for destructive operations
- ✅ Consistent status file management (saves to `3. Status/` directory)

**Status**: Development workflow scripts are now ready for use with both bash and PowerShell versions available.

### November 7, 2025 - Bug Tracking and Fixing

**Testing & Bug Identification**:
- ✅ Completed comprehensive testing of CSV/URL Campaign Generation MVP
- ✅ Identified and logged 20 bugs (5 High Priority, 15 Medium Priority)
- ✅ Fixed 11 bugs total (BUG-001, BUG-002, BUG-003, BUG-004, BUG-006, BUG-009, BUG-016, BUG-017, BUG-018, BUG-019, BUG-020)
- ✅ Merged 6 bug fixes from remote branch (BUG-001, BUG-002, BUG-003, BUG-004, BUG-006, BUG-009)
- ✅ Fixed 5 additional bugs locally (BUG-016, BUG-017, BUG-018, BUG-019, BUG-020) on November 7-8, 2025
- ✅ Created comprehensive test documentation and test files

**Bug Status**: 11 bugs fixed, 9 bugs remaining (2 High Priority, 7 Medium Priority)

### November 5, 2025 - MVP Enhancements

**Enhancements**:
- ✅ Intelligent AI response extraction (parses budget, duration, platforms, objectives from user input)
- ✅ Campaign plan editor with full editing capabilities
- ✅ Delete campaigns from dashboard
- ✅ Mock data badges for transparency
- ✅ Always USD for mock responses
- ✅ Action buttons (View Preview, Create Campaign) after AI responses
- ✅ Improved error handling and user feedback
- ✅ Complete responsive design
- ✅ Production build optimization

**Bug Fixes**:
- ✅ Fixed duplicate "Create Campaign" button
- ✅ Fixed budget extraction ($4,000 now correctly parsed)
- ✅ Fixed duration extraction (weeks to days conversion)
- ✅ Improved objective detection for events/conferences

## Support

For issues and questions, please contact the development team or create an issue in the repository.
