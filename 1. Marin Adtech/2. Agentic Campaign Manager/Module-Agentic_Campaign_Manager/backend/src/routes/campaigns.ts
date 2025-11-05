import { Router } from 'express';
import { CampaignController } from '../controllers/campaignController';
import { CampaignCreationController } from '../controllers/campaignCreationController';
import { StatusController } from '../controllers/statusController';
import { PerformanceController } from '../controllers/performanceController';
import { PatternExtractionController } from '../controllers/patternExtractionController';

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

// Campaign creation endpoints
router.post('/create', campaignCreationController.createCampaign);
router.post('/create-with-progress', campaignCreationController.createCampaignWithProgress);

// Campaign status endpoints
router.get('/:id/status', statusController.getCampaignStatus);
router.get('/:id/status/history', statusController.getCampaignStatusHistory);

// Campaign performance endpoints
router.get('/:id/performance', performanceController.getCampaignPerformance);

// Campaign CRUD operations
router.get('/', campaignController.getAllCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/', campaignController.createCampaign);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

// Campaign actions
router.post('/:id/launch', campaignController.launchCampaign);
router.post('/:id/pause', campaignController.pauseCampaign);
router.post('/:id/resume', campaignController.resumeCampaign);

// Pattern extraction endpoints
router.get('/query-patterns', patternExtractionController.queryPatterns);
router.get('/high-performing-keywords', patternExtractionController.getHighPerformingKeywords);
router.get('/ad-copy-patterns', patternExtractionController.getAdCopyPatterns);

export default router;

