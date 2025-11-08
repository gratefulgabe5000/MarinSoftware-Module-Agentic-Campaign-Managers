import * as fs from 'fs';
import * as path from 'path';

/**
 * Mock Data Loader Utility
 * Loads mock data files for testing and development when live APIs are unavailable
 */

const MOCK_DATA_DIR = path.join(__dirname, '../data/mock');

/**
 * Map product names to their corresponding mock data files
 */
const PRODUCT_FILE_MAP: { [key: string]: string } = {
  // Running Shoes
  'nike air zoom pegasus 41': 'nike-air-zoom-pegasus-41.json',
  'nike air zoom pegasus': 'nike-air-zoom-pegasus-41.json',
  'adidas ultraboost light': 'adidas-ultraboost-light.json',
  'adidas ultraboost': 'adidas-ultraboost-light.json',
  'asics gel-nimbus 26': 'asics-gel-nimbus-26.json',
  'asics gel nimbus': 'asics-gel-nimbus-26.json',
  'brooks ghost 16': 'brooks-ghost-16.json',
  'brooks ghost': 'brooks-ghost-16.json',
  'hoka clifton 9': 'hoka-clifton-9.json',
  'hoka clifton': 'hoka-clifton-9.json',
  'new balance fresh foam x 1080v13': 'new-balance-fresh-foam-1080v13.json',
  'new balance fresh foam': 'new-balance-fresh-foam-1080v13.json',
  // Motorcycles (legacy support)
  'yamaha sr400': 'yamaha-sr400.json',
  'honda cb350': 'honda-cb350.json',
  'triumph thruxton': 'triumph-thruxton.json',
  'triumph street twin': 'triumph-street-twin.json',
  'harley-davidson dyna': 'harley-davidson-dyna.json',
  'harley davidson dyna': 'harley-davidson-dyna.json',
  'harley-davidson low rider': 'harley-davidson-low-rider.json',
  'harley davidson low rider': 'harley-davidson-low-rider.json',
};

/**
 * Load campaigns mock data (general aggregated data)
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
 * Load product-specific campaigns mock data
 */
export function loadProductMockCampaigns(productName: string): any {
  try {
    const normalizedName = productName.toLowerCase().trim();
    const fileName = PRODUCT_FILE_MAP[normalizedName];

    if (!fileName) {
      console.warn(`No mock data file found for product: ${productName}, falling back to general data`);
      return loadMockCampaigns();
    }

    const filePath = path.join(MOCK_DATA_DIR, 'products', fileName);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading mock campaigns for product ${productName}:`, error);
    return loadMockCampaigns(); // Fallback to general data
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

