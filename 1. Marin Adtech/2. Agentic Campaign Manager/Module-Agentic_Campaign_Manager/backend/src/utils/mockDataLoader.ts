import * as fs from 'fs';
import * as path from 'path';

/**
 * Mock Data Loader Utility
 * Loads mock data files for testing and development when live APIs are unavailable
 */

const MOCK_DATA_DIR = path.join(__dirname, '../data/mock');

/**
 * Load campaigns mock data
 */
export function loadMockCampaigns(): any {
  try {
    const filePath = path.join(MOCK_DATA_DIR, 'campaigns.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading mock campaigns:', error);
    return { campaigns: [] };
  }
}

/**
 * Load keywords mock data
 */
export function loadMockKeywords(): any {
  try {
    const filePath = path.join(MOCK_DATA_DIR, 'keywords.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading mock keywords:', error);
    return { keywords: [] };
  }
}

/**
 * Load ads mock data
 */
export function loadMockAds(): any {
  try {
    const filePath = path.join(MOCK_DATA_DIR, 'ads.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading mock ads:', error);
    return { ads: [] };
  }
}

/**
 * Load products CSV mock data
 */
export function loadMockProducts(): string {
  try {
    const filePath = path.join(MOCK_DATA_DIR, 'products.csv');
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error('Error loading mock products:', error);
    return '';
  }
}

/**
 * Check if mock data directory exists
 */
export function mockDataAvailable(): boolean {
  return fs.existsSync(MOCK_DATA_DIR);
}

/**
 * Get all mock data
 */
export function loadAllMockData() {
  return {
    campaigns: loadMockCampaigns(),
    keywords: loadMockKeywords(),
    ads: loadMockAds(),
    products: loadMockProducts(),
  };
}

