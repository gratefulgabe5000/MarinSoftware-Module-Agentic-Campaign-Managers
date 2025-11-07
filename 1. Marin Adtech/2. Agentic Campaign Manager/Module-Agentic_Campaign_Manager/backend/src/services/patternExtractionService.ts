import {
  CampaignPatterns,
  AdGroupStructures,
  HighPerformingKeyword,
  AdCopyPatterns,
  BiddingPatterns,
} from '../types/campaign-patterns.types';

/**
 * Pattern Extraction Service
 * Analyzes existing campaign data to extract reusable patterns
 */

/**
 * Extract ad group structures from ad group data
 */
export function extractAdGroupStructures(adGroups: any[]): AdGroupStructures {
  if (!adGroups || adGroups.length === 0) {
    return {
      namingConvention: 'Product Name',
      themes: [],
      averageKeywordsPerGroup: 15,
    };
  }

  // Analyze naming conventions
  const namingPatterns: string[] = [];
  adGroups.forEach((ag) => {
    const name = ag.name || '';
    // Detect common patterns
    if (name.includes(' - ')) {
      namingPatterns.push('Brand - Category');
    } else if (name.includes(' + ')) {
      namingPatterns.push('Brand + Feature');
    } else if (name.includes(' ')) {
      namingPatterns.push('Product Type - Model');
    }
  });

  // Determine most common naming convention
  const namingConvention = namingPatterns.length > 0
    ? namingPatterns.reduce((a, b) =>
        namingPatterns.filter((v) => v === a).length >=
        namingPatterns.filter((v) => v === b).length
          ? a
          : b
      )
    : 'Product Name';

  // Extract themes from ad group names
  const themes: string[] = [];
  const themeWords: { [key: string]: number } = {};
  
  adGroups.forEach((ag) => {
    const name = ag.name || '';
    const words = name.toLowerCase().split(/[\s\-+]+/).filter((w: string) => w.length > 2);
    words.forEach((word: string) => {
      themeWords[word] = (themeWords[word] || 0) + 1;
    });
  });

  // Get most common theme words
  const sortedThemes = Object.entries(themeWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  themes.push(...sortedThemes);

  // Calculate average keywords per group (default to 15 if not available)
  const averageKeywordsPerGroup = 15; // Will be calculated when keywords are available

  return {
    namingConvention,
    themes,
    averageKeywordsPerGroup,
  };
}

/**
 * Extract high-performing keywords from keyword data
 */
export function extractHighPerformingKeywords(
  keywords: any[],
  minCTR: number = 2.0,
  minConversions: number = 0
): HighPerformingKeyword[] {
  if (!keywords || keywords.length === 0) {
    return [];
  }

  // Filter and sort keywords by performance
  const highPerforming: HighPerformingKeyword[] = keywords
    .filter((kw) => {
      const ctr = kw.ctr || 0;
      const conversions = kw.conversions || 0;
      return ctr >= minCTR && conversions >= minConversions;
    })
    .map((kw) => {
      const roas = kw.conversionsValue && kw.cost
        ? kw.conversionsValue / kw.cost
        : undefined;

      return {
        keyword: kw.text || '',
        matchType: kw.matchType || 'BROAD',
        ctr: kw.ctr || 0,
        conversions: kw.conversions || 0,
        roas,
        impressions: kw.impressions,
        clicks: kw.clicks,
        cost: kw.cost,
        averageCpc: kw.averageCpc,
      };
    })
    .sort((a, b) => {
      // Sort by CTR first, then conversions
      if (b.ctr !== a.ctr) {
        return b.ctr - a.ctr;
      }
      return b.conversions - a.conversions;
    })
    .slice(0, 20); // Return top 20

  return highPerforming;
}

/**
 * Extract ad copy patterns from ad data
 */
export function extractAdCopyPatterns(ads: any[]): AdCopyPatterns {
  if (!ads || ads.length === 0) {
    return {
      headlineTemplates: [],
      descriptionTemplates: [],
      commonCTAs: [],
      averageHeadlinesPerAd: 15,
      averageDescriptionsPerAd: 4,
    };
  }

  const allHeadlines: string[] = [];
  const allDescriptions: string[] = [];
  const ctaWords: { [key: string]: number } = {};
  let totalHeadlines = 0;
  let totalDescriptions = 0;

  ads.forEach((ad) => {
    // Collect headlines
    if (ad.headlines && Array.isArray(ad.headlines)) {
      allHeadlines.push(...ad.headlines);
      totalHeadlines += ad.headlines.length;
    }

    // Collect descriptions
    if (ad.descriptions && Array.isArray(ad.descriptions)) {
      allDescriptions.push(...ad.descriptions);
      totalDescriptions += ad.descriptions.length;
    }

    // Extract CTAs from headlines and descriptions
    const allText = [...(ad.headlines || []), ...(ad.descriptions || [])].join(' ');
    const ctaPatterns = [
      'shop now',
      'buy now',
      'learn more',
      'get started',
      'sign up',
      'download',
      'order now',
      'try now',
      'view more',
      'discover',
    ];

    ctaPatterns.forEach((cta) => {
      if (allText.toLowerCase().includes(cta)) {
        ctaWords[cta] = (ctaWords[cta] || 0) + 1;
      }
    });
  });

  // Extract headline templates (common patterns)
  const headlineTemplates = extractTemplates(allHeadlines, 10);

  // Extract description templates
  const descriptionTemplates = extractTemplates(allDescriptions, 5);

  // Get common CTAs
  const commonCTAs = Object.entries(ctaWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cta]) => cta);

  const averageHeadlinesPerAd = totalHeadlines / ads.length;
  const averageDescriptionsPerAd = totalDescriptions / ads.length;

  return {
    headlineTemplates,
    descriptionTemplates,
    commonCTAs,
    averageHeadlinesPerAd: Math.round(averageHeadlinesPerAd),
    averageDescriptionsPerAd: Math.round(averageDescriptionsPerAd),
  };
}

/**
 * Extract templates from text array
 * Returns actual ad copy examples (deduplicated and sorted by frequency)
 */
function extractTemplates(texts: string[], maxTemplates: number): string[] {
  if (texts.length === 0) {
    return [];
  }

  // Count frequency of each text
  const textFrequency: { [key: string]: number } = {};

  texts.forEach((text) => {
    const cleaned = text.trim();
    if (cleaned.length > 0) {
      textFrequency[cleaned] = (textFrequency[cleaned] || 0) + 1;
    }
  });

  // Sort by frequency (most common first) and return unique texts
  const sortedTexts = Object.entries(textFrequency)
    .sort((a, b) => b[1] - a[1]) // Sort by frequency descending
    .map(([text]) => text)
    .slice(0, maxTemplates);

  return sortedTexts;
}

/**
 * Extract bidding patterns from campaign and keyword data
 */
export function extractBiddingPatterns(
  campaigns: any[],
  keywords: any[]
): BiddingPatterns {
  if (!keywords || keywords.length === 0) {
    return {
      averageCPC: 1.50,
      bidStrategy: 'MANUAL_CPC',
    };
  }

  // Calculate average CPC
  const totalCost = keywords.reduce((sum, kw) => sum + (kw.cost || 0), 0);
  const totalClicks = keywords.reduce((sum, kw) => sum + (kw.clicks || 0), 0);
  const averageCPC = totalClicks > 0 ? totalCost / totalClicks : 1.50;

  // Determine bid strategy (default to MANUAL_CPC for MVP)
  const bidStrategy = 'MANUAL_CPC';

  // Calculate average CPM if impressions available
  const totalImpressions = keywords.reduce(
    (sum, kw) => sum + (kw.impressions || 0),
    0
  );
  const averageCPM =
    totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : undefined;

  // Calculate average CPA if conversions available
  const totalConversions = keywords.reduce(
    (sum, kw) => sum + (kw.conversions || 0),
    0
  );
  const averageCPA =
    totalConversions > 0 ? totalCost / totalConversions : undefined;

  return {
    averageCPC: Math.round(averageCPC * 100) / 100, // Round to 2 decimals
    bidStrategy,
    averageCPM: averageCPM ? Math.round(averageCPM * 100) / 100 : undefined,
    averageCPA: averageCPA ? Math.round(averageCPA * 100) / 100 : undefined,
  };
}

/**
 * Extract all patterns from campaign data
 */
export async function extractAllPatterns(
  campaigns: any[],
  adGroups: any[],
  keywords: any[],
  ads: any[],
  options?: {
    minCTR?: number;
    minConversions?: number;
  }
): Promise<CampaignPatterns> {
  const adGroupStructures = extractAdGroupStructures(adGroups);
  
  // Update average keywords per group based on actual data
  const keywordsByGroup: { [key: string]: number } = {};
  keywords.forEach((kw) => {
    const adGroupId = kw.adGroupId || '';
    keywordsByGroup[adGroupId] = (keywordsByGroup[adGroupId] || 0) + 1;
  });
  
  const keywordCounts = Object.values(keywordsByGroup);
  if (keywordCounts.length > 0) {
    const avgKeywords =
      keywordCounts.reduce((a, b) => a + b, 0) / keywordCounts.length;
    adGroupStructures.averageKeywordsPerGroup = Math.round(avgKeywords);
  }

  const highPerformingKeywords = extractHighPerformingKeywords(
    keywords,
    options?.minCTR || 2.0,
    options?.minConversions || 0
  );

  const adCopyPatterns = extractAdCopyPatterns(ads);

  const biddingPatterns = extractBiddingPatterns(campaigns, keywords);

  return {
    adGroupStructures,
    highPerformingKeywords,
    adCopyPatterns,
    biddingPatterns,
  };
}

