import { Router } from 'express';
import { CampaignController } from '../controllers/campaignController';
import { CampaignCreationController } from '../controllers/campaignCreationController';
import { StatusController } from '../controllers/statusController';
import { PerformanceController } from '../controllers/performanceController';
import { PatternExtractionController } from '../controllers/patternExtractionController';
import { AdGroupGenerationController } from '../controllers/adGroupGenerationController';
import { KeywordGenerationController } from '../controllers/keywordGenerationController';
import { RSAGenerationController } from '../controllers/rsaGenerationController';
import { CSVExportController } from '../controllers/csvExportController';

/**
 * Campaign Routes
 * Handles all campaign-related API endpoints
 */
const router = Router();
const campaignController = new CampaignController();
const campaignCreationController = new CampaignCreationController();
const statusController = new StatusController();
const performanceController = new PerformanceController();
const patternExtractionController = new PatternExtractionController();
const adGroupGenerationController = new AdGroupGenerationController();
const keywordGenerationController = new KeywordGenerationController();
const rsaGenerationController = new RSAGenerationController();
const csvExportController = new CSVExportController();

// Pattern extraction endpoints (must come before parameterized routes)
router.get('/query-patterns', patternExtractionController.queryPatterns);
router.get('/high-performing-keywords', patternExtractionController.getHighPerformingKeywords);
router.get('/ad-copy-patterns', patternExtractionController.getAdCopyPatterns);

// Campaign creation endpoints
router.post('/create', campaignCreationController.createCampaign);
router.post('/create-with-progress', campaignCreationController.createCampaignWithProgress);

// Campaign CRUD operations (must come before parameterized routes)
router.get('/', campaignController.getAllCampaigns);

// Campaign status endpoints
router.get('/:id/status', statusController.getCampaignStatus);
router.get('/:id/status/history', statusController.getCampaignStatusHistory);

// Campaign performance endpoints
router.get('/:id/performance', performanceController.getCampaignPerformance);

// Campaign CRUD operations (continued)
router.get('/:id', campaignController.getCampaignById);
router.post('/', campaignController.createCampaign);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

// Campaign actions
router.post('/:id/launch', campaignController.launchCampaign);
router.post('/:id/pause', campaignController.pauseCampaign);
router.post('/:id/resume', campaignController.resumeCampaign);


// Ad group generation endpoints
router.post('/adgroups/generate', adGroupGenerationController.generateAdGroups);

// Keyword generation endpoints
router.post('/keywords/generate', keywordGenerationController.generateKeywords);
router.post('/keywords/validate', keywordGenerationController.validateKeywords);

// RSA generation endpoints
router.post('/ads/generate-rsa', rsaGenerationController.generateRSA);
router.post('/ads/validate', rsaGenerationController.validateAdCopy);

// CSV export endpoints
router.post('/export', csvExportController.exportCampaign);
router.post('/export/validate', csvExportController.validateExport);

export default router;

