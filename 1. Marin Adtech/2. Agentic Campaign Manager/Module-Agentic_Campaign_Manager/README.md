# Agentic Campaign Manager Module

AI-powered campaign creation and management for performance marketers. This module provides an intuitive conversational interface for creating, managing, and monitoring advertising campaigns across multiple platforms.

## Features

### Core Functionality
- **Conversational Campaign Creation**: Natural language interface with intelligent AI response extraction
- **CSV/URL-Based Campaign Generation**: Generate complete Google Ads campaigns from CSV files or product URL lists
- **Multi-Platform Support**: Google Ads, Meta, Microsoft Advertising
- **Campaign Management**: Create, view, edit, pause, resume, and delete campaigns
- **Campaign Plan Editing**: Full editor for modifying campaign plans before creation
- **Campaign Preview & Editing**: Spreadsheet-like interface for reviewing and editing generated campaigns
- **Performance Dashboard**: Real-time metrics, time series analysis, and goal tracking
- **Google Ads Editor Export**: Export campaigns to CSV format compatible with Google Ads Editor
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
│   │   ├── csv-upload/       # CSV/URL upload components
│   │   │   ├── CSVUploadScreen.tsx
│   │   │   ├── CSVUploadComponent.tsx
│   │   │   ├── URLListInput.tsx
│   │   │   └── ProductPreview.tsx
│   │   ├── pattern-learning/ # Pattern learning components
│   │   │   ├── PatternLearningScreen.tsx
│   │   │   └── PatternViewer.tsx
│   │   ├── campaign-generation/ # Campaign generation components
│   │   │   └── CampaignGenerationScreen.tsx
│   │   ├── campaign-preview/ # Campaign preview & editing
│   │   │   ├── CampaignPreviewScreen.tsx
│   │   │   ├── CampaignPreviewTable.tsx
│   │   │   ├── AdGroupRow.tsx
│   │   │   ├── KeywordRow.tsx
│   │   │   ├── AdRow.tsx
│   │   │   ├── AdCopyEditor.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   └── ExportInstructions.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ToastContainer.tsx
│   │   └── ...
│   ├── services/            # API services
│   │   ├── campaignService.ts
│   │   ├── performanceService.ts
│   │   ├── productService.ts
│   │   ├── validationService.ts
│   │   └── ...
│   ├── store/               # Zustand state management
│   │   ├── campaignStore.ts
│   │   └── campaignPreviewStore.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useCampaignPatterns.ts
│   │   ├── useAdGroupGeneration.ts
│   │   ├── useKeywordGeneration.ts
│   │   ├── useRSAGeneration.ts
│   │   ├── useCSVExport.ts
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── indexedDB.ts
│   │   ├── toastService.ts
│   │   ├── inlineEditing.ts
│   │   └── ...
│   ├── types/               # TypeScript type definitions
│   │   ├── campaign.types.ts
│   │   ├── performance.types.ts
│   │   ├── product.types.ts
│   │   ├── campaign-patterns.types.ts
│   │   ├── campaign-preview.types.ts
│   │   ├── adgroup-generation.types.ts
│   │   ├── keyword-generation.types.ts
│   │   ├── rsa-generation.types.ts
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
│   │   │   ├── csvExportController.ts
│   │   │   ├── adGroupGenerationController.ts
│   │   │   ├── keywordGenerationController.ts
│   │   │   ├── rsaGenerationController.ts
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── campaigns.ts
│   │   │   ├── products.ts
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── productParsingService.ts
│   │   │   ├── patternExtractionService.ts
│   │   │   ├── adGroupGenerationService.ts
│   │   │   ├── keywordGenerationService.ts
│   │   │   ├── rsaGenerationService.ts
│   │   │   ├── csvExportService.ts
│   │   │   └── ...
│   │   └── ...
│   └── package.json
├── public/                  # Static assets
├── dist/                    # Production build output
├── sample-products.csv      # Sample CSV file for testing
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

### CSV/URL Campaign Generation Endpoints
- `POST /api/products/parse-csv` - Parse CSV file and extract products
- `POST /api/products/parse-urls` - Parse URL list and extract products
- `GET /api/campaigns/query-patterns` - Query existing campaigns and extract patterns
- `POST /api/campaigns/adgroups/generate` - Generate ad groups for products
- `POST /api/campaigns/keywords/generate` - Generate keywords for a product
- `POST /api/campaigns/keywords/validate` - Validate keywords
- `POST /api/campaigns/ads/generate-rsa` - Generate responsive search ads
- `POST /api/campaigns/ads/validate` - Validate ad copy
- `POST /api/campaigns/export` - Export campaign to Google Ads Editor CSV
- `POST /api/campaigns/export/validate` - Validate campaign before export

### Performance Endpoints
- `GET /api/campaigns/:id/performance` - Get campaign performance metrics
  - Query params: `timeRange` (today|7d|30d|90d|custom), `startDate`, `endDate`, `includeTimeSeries`

### OAuth Endpoints
- `GET /api/oauth/:platform/auth` - Initiate OAuth flow
- `GET /api/oauth/:platform/callback` - OAuth callback handler
- `GET /api/oauth/:platform/status` - Check OAuth connection status
- `POST /api/oauth/:platform/disconnect` - Disconnect OAuth account

## Usage

### Creating a Campaign (Conversational)

1. Navigate to the Campaign Dashboard
2. Click "Create Campaign"
3. Use the conversational interface to describe your campaign:
   - Campaign objective
   - Target audience
   - Budget and timeline
   - Platforms (Google Ads, Meta, Microsoft)
4. Review the generated campaign plan
5. Launch the campaign

### Generating Campaigns from CSV/URL List

1. Navigate to the Campaign Dashboard
2. Click "Generate Campaigns from CSV" or "CSV/URL Campaign Generation"
3. **Upload CSV File** (or enter URL list):
   - Drag and drop a CSV file, or click to browse
   - CSV format: Product Name, URL, Category, Price, Description
   - Maximum 10 products per batch (MVP)
4. **Review Products**:
   - Verify parsed products in the preview table
   - Edit product names or URLs if needed
   - Click "Generate Campaigns" when ready
5. **Pattern Learning** (Optional):
   - Review extracted patterns from existing campaigns
   - Learn from high-performing keywords and ad copy
   - Click "Skip & Use Defaults" to proceed without patterns
6. **Campaign Generation**:
   - Watch progress as ad groups, keywords, and ads are generated
   - System automatically creates campaigns for each product
7. **Preview & Edit**:
   - Review generated campaign structure in spreadsheet-like interface
   - Edit ad group names, keywords, headlines, descriptions, and URLs inline
   - See real-time validation and character counts
   - Filter and sort campaign data
8. **Export to Google Ads Editor**:
   - Click "Export to Google Ads Editor" button
   - Download CSV file in Google Ads Editor format
   - Import into Google Ads Editor to upload campaigns

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

### January 6, 2025 - CSV/URL Campaign Generation MVP Complete

#### New Features
- ✅ **CSV/URL-Based Campaign Generation**: Complete workflow from CSV upload to Google Ads Editor export
- ✅ **Pattern Learning**: Extract patterns from existing high-performing campaigns
- ✅ **Automatic Campaign Generation**: Generate ad groups, keywords, and responsive search ads automatically
- ✅ **Campaign Preview & Editing**: Spreadsheet-like interface with inline editing
- ✅ **Google Ads Editor Export**: Export campaigns to CSV format compatible with Google Ads Editor
- ✅ **Real-time Validation**: Character limits, required fields, and format validation
- ✅ **Filtering & Sorting**: Filter by ad group/keywords, sort by various criteria
- ✅ **Comprehensive Testing Documentation**: Test plans, execution logs, and testing guides

#### Technical Enhancements
- ✅ Campaign preview store (Zustand) for managing editable campaign state
- ✅ Validation service for comprehensive data validation
- ✅ CSV export service with Google Ads Editor format compliance
- ✅ Inline editing utilities for seamless editing experience
- ✅ Enhanced components with filtering, sorting, and validation

### November 5, 2025

#### Enhancements
- ✅ Intelligent AI response extraction (parses budget, duration, platforms, objectives from user input)
- ✅ Campaign plan editor with full editing capabilities
- ✅ Delete campaigns from dashboard
- ✅ Mock data badges for transparency
- ✅ Always USD for mock responses
- ✅ Action buttons (View Preview, Create Campaign) after AI responses
- ✅ Improved error handling and user feedback
- ✅ Complete responsive design
- ✅ Production build optimization

#### Bug Fixes
- ✅ Fixed duplicate "Create Campaign" button
- ✅ Fixed budget extraction ($4,000 now correctly parsed)
- ✅ Fixed duration extraction (weeks to days conversion)
- ✅ Improved objective detection for events/conferences

## Support

For issues and questions, please contact the development team or create an issue in the repository.
