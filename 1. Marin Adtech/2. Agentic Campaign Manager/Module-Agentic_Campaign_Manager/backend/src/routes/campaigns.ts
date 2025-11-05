import { Router } from 'express';
import { CampaignController } from '../controllers/campaignController';
import { CampaignCreationController } from '../controllers/campaignCreationController';
import { StatusController } from '../controllers/statusController';
import { PerformanceController } from '../controllers/performanceController';
<<<<<<< HEAD
import { PatternExtractionController } from '../controllers/patternExtractionController';
import { AdGroupGenerationController } from '../controllers/adGroupGenerationController';
import { KeywordGenerationController } from '../controllers/keywordGenerationController';
import { RSAGenerationController } from '../controllers/rsaGenerationController';
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

/**
 * Campaign Routes
 * Handles all campaign-related API endpoints
 */
const router = Router();
const campaignController = new CampaignController();
const campaignCreationController = new CampaignCreationController();
const statusController = new StatusController();
const performanceController = new PerformanceController();
<<<<<<< HEAD
const patternExtractionController = new PatternExtractionController();
const adGroupGenerationController = new AdGroupGenerationController();
const keywordGenerationController = new KeywordGenerationController();
const rsaGenerationController = new RSAGenerationController();
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

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

<<<<<<< HEAD
// Pattern extraction endpoints
router.get('/query-patterns', patternExtractionController.queryPatterns);
router.get('/high-performing-keywords', patternExtractionController.getHighPerformingKeywords);
router.get('/ad-copy-patterns', patternExtractionController.getAdCopyPatterns);

// Ad group generation endpoints
router.post('/adgroups/generate', adGroupGenerationController.generateAdGroups);

// Keyword generation endpoints
router.post('/keywords/generate', keywordGenerationController.generateKeywords);
router.post('/keywords/validate', keywordGenerationController.validateKeywords);

// RSA generation endpoints
router.post('/ads/generate-rsa', rsaGenerationController.generateRSA);
router.post('/ads/validate', rsaGenerationController.validateAdCopy);

=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
export default router;

