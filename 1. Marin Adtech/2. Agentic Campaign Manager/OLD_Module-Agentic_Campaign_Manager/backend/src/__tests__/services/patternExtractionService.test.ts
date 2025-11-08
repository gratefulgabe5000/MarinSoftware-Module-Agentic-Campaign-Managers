import {
  extractAdGroupStructures,
  extractHighPerformingKeywords,
  extractAdCopyPatterns,
  extractBiddingPatterns,
  extractAllPatterns,
} from '../../services/patternExtractionService';

describe('PatternExtractionService', () => {
  describe('extractAdGroupStructures', () => {
    it('should extract naming conventions from ad groups', () => {
      const adGroups = [
        { id: '1', name: 'Brand - Product Category', campaignId: 'c1' },
        { id: '2', name: 'Brand - Accessories', campaignId: 'c1' },
        { id: '3', name: 'Product Type - Model', campaignId: 'c1' },
      ];

      const result = extractAdGroupStructures(adGroups);

      expect(result.namingConvention).toBe('Brand - Category');
      expect(result.themes.length).toBeGreaterThan(0);
    });

    it('should handle empty ad groups array', () => {
      const result = extractAdGroupStructures([]);

      expect(result.namingConvention).toBe('Product Name');
      expect(result.themes).toEqual([]);
      expect(result.averageKeywordsPerGroup).toBe(15);
    });

    it('should extract themes from ad group names', () => {
      const adGroups = [
        { id: '1', name: 'Electronics - Laptops', campaignId: 'c1' },
        { id: '2', name: 'Electronics - Phones', campaignId: 'c1' },
        { id: '3', name: 'Electronics - Tablets', campaignId: 'c1' },
      ];

      const result = extractAdGroupStructures(adGroups);

      expect(result.themes).toContain('electronics');
    });

    it('should handle null/undefined ad groups', () => {
      const result = extractAdGroupStructures(null as any);

      expect(result.namingConvention).toBe('Product Name');
      expect(result.averageKeywordsPerGroup).toBe(15);
    });
  });

  describe('extractHighPerformingKeywords', () => {
    const mockKeywords = [
      {
        id: '1',
        text: 'buy product online',
        matchType: 'BROAD',
        ctr: 5.0,
        conversions: 25,
        cost: 750,
        clicks: 500,
        impressions: 10000,
        averageCpc: 1.50,
        conversionsValue: 2500,
      },
      {
        id: '2',
        text: 'product reviews',
        matchType: 'PHRASE',
        ctr: 4.0,
        conversions: 16,
        cost: 400,
        clicks: 320,
        impressions: 8000,
        averageCpc: 1.25,
        conversionsValue: 1600,
      },
      {
        id: '3',
        text: '[best product]',
        matchType: 'EXACT',
        ctr: 7.0,
        conversions: 20,
        cost: 700,
        clicks: 350,
        impressions: 5000,
        averageCpc: 2.00,
        conversionsValue: 2000,
      },
      {
        id: '4',
        text: 'low performing',
        matchType: 'BROAD',
        ctr: 1.0,
        conversions: 0,
        cost: 100,
        clicks: 50,
        impressions: 5000,
        averageCpc: 2.00,
      },
    ];

    it('should filter keywords by CTR threshold', () => {
      const result = extractHighPerformingKeywords(mockKeywords, 2.0, 0);

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((kw) => kw.ctr >= 2.0)).toBe(true);
    });

    it('should filter keywords by conversions threshold', () => {
      const result = extractHighPerformingKeywords(mockKeywords, 0, 10);

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((kw) => kw.conversions >= 10)).toBe(true);
    });

    it('should sort keywords by CTR and conversions', () => {
      const result = extractHighPerformingKeywords(mockKeywords, 2.0, 0);

      expect(result[0].ctr).toBeGreaterThanOrEqual(result[1].ctr);
    });

    it('should calculate ROAS when conversionsValue and cost are available', () => {
      const result = extractHighPerformingKeywords(mockKeywords, 2.0, 0);

      const keywordWithRoas = result.find((kw) => kw.keyword === 'buy product online');
      expect(keywordWithRoas?.roas).toBeCloseTo(2500 / 750, 2);
    });

    it('should limit to top 20 keywords', () => {
      const manyKeywords = Array.from({ length: 30 }, (_, i) => ({
        id: `kw_${i}`,
        text: `keyword ${i}`,
        matchType: 'BROAD',
        ctr: 5.0 + i,
        conversions: 10,
      }));

      const result = extractHighPerformingKeywords(manyKeywords, 2.0, 0);

      expect(result.length).toBe(20);
    });

    it('should handle empty keywords array', () => {
      const result = extractHighPerformingKeywords([], 2.0, 0);

      expect(result).toEqual([]);
    });

    it('should use default thresholds when not specified', () => {
      const result = extractHighPerformingKeywords(mockKeywords);

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((kw) => kw.ctr >= 2.0)).toBe(true);
    });
  });

  describe('extractAdCopyPatterns', () => {
    const mockAds = [
      {
        id: '1',
        adGroupId: 'ag1',
        headlines: [
          'Buy Our Amazing Product',
          'Best Product Online',
          'Quality Product Guaranteed',
        ],
        descriptions: [
          'Discover our amazing product with free shipping.',
          'Shop the best selection online today.',
        ],
      },
      {
        id: '2',
        adGroupId: 'ag2',
        headlines: [
          'Top Rated Product',
          'Best Deals Online',
          'Shop Quality Products',
        ],
        descriptions: [
          'Get the best deals on quality products.',
          'Join thousands of satisfied customers.',
        ],
      },
    ];

    it('should extract headline templates', () => {
      const result = extractAdCopyPatterns(mockAds);

      expect(result.headlineTemplates.length).toBeGreaterThan(0);
    });

    it('should extract description templates', () => {
      const result = extractAdCopyPatterns(mockAds);

      expect(result.descriptionTemplates.length).toBeGreaterThan(0);
    });

    it('should calculate average headlines per ad', () => {
      const result = extractAdCopyPatterns(mockAds);

      expect(result.averageHeadlinesPerAd).toBe(3);
    });

    it('should calculate average descriptions per ad', () => {
      const result = extractAdCopyPatterns(mockAds);

      expect(result.averageDescriptionsPerAd).toBe(2);
    });

    it('should extract common CTAs', () => {
      const result = extractAdCopyPatterns(mockAds);

      expect(Array.isArray(result.commonCTAs)).toBe(true);
    });

    it('should handle empty ads array', () => {
      const result = extractAdCopyPatterns([]);

      expect(result.headlineTemplates).toEqual([]);
      expect(result.descriptionTemplates).toEqual([]);
      expect(result.averageHeadlinesPerAd).toBe(15);
      expect(result.averageDescriptionsPerAd).toBe(4);
    });

    it('should handle ads without headlines', () => {
      const ads = [{ id: '1', adGroupId: 'ag1', descriptions: ['Test'] }];
      const result = extractAdCopyPatterns(ads);

      expect(result.headlineTemplates).toEqual([]);
    });
  });

  describe('extractBiddingPatterns', () => {
    const mockKeywords = [
      {
        id: '1',
        cost: 750,
        clicks: 500,
        impressions: 10000,
        conversions: 25,
      },
      {
        id: '2',
        cost: 400,
        clicks: 320,
        impressions: 8000,
        conversions: 16,
      },
    ];

    it('should calculate average CPC', () => {
      const result = extractBiddingPatterns([], mockKeywords);

      const expectedCPC = (750 + 400) / (500 + 320);
      expect(result.averageCPC).toBeCloseTo(expectedCPC, 2);
    });

    it('should calculate average CPM when impressions available', () => {
      const result = extractBiddingPatterns([], mockKeywords);

      const totalCost = 750 + 400;
      const totalImpressions = 10000 + 8000;
      const expectedCPM = (totalCost / totalImpressions) * 1000;
      
      expect(result.averageCPM).toBeCloseTo(expectedCPM, 2);
    });

    it('should calculate average CPA when conversions available', () => {
      const result = extractBiddingPatterns([], mockKeywords);

      const totalCost = 750 + 400;
      const totalConversions = 25 + 16;
      const expectedCPA = totalCost / totalConversions;

      expect(result.averageCPA).toBeCloseTo(expectedCPA, 2);
    });

    it('should use default values when no keywords', () => {
      const result = extractBiddingPatterns([], []);

      expect(result.averageCPC).toBe(1.50);
      expect(result.bidStrategy).toBe('MANUAL_CPC');
    });

    it('should handle keywords without cost', () => {
      const keywords = [{ id: '1', clicks: 100 }];
      const result = extractBiddingPatterns([], keywords);

      expect(result.averageCPC).toBe(1.50);
    });
  });

  describe('extractAllPatterns', () => {
    const mockCampaigns = [
      { id: 'c1', name: 'Campaign 1', status: 'ENABLED' },
    ];
    const mockAdGroups = [
      { id: 'ag1', name: 'Brand - Product', campaignId: 'c1' },
    ];
    const mockKeywords = [
      {
        id: 'kw1',
        adGroupId: 'ag1',
        text: 'test keyword',
        matchType: 'BROAD',
        ctr: 5.0,
        conversions: 10,
        cost: 100,
        clicks: 50,
      },
    ];
    const mockAds = [
      {
        id: 'ad1',
        adGroupId: 'ag1',
        headlines: ['Test Headline'],
        descriptions: ['Test Description'],
      },
    ];

    it('should extract all patterns', async () => {
      const result = await extractAllPatterns(
        mockCampaigns,
        mockAdGroups,
        mockKeywords,
        mockAds
      );

      expect(result.adGroupStructures).toBeDefined();
      expect(result.highPerformingKeywords).toBeDefined();
      expect(result.adCopyPatterns).toBeDefined();
      expect(result.biddingPatterns).toBeDefined();
    });

    it('should update average keywords per group from actual data', async () => {
      const keywordsWithMultipleGroups = [
        ...mockKeywords,
        { ...mockKeywords[0], id: 'kw2', adGroupId: 'ag1' },
        { ...mockKeywords[0], id: 'kw3', adGroupId: 'ag2' },
      ];
      const adGroupsWithMultiple = [
        ...mockAdGroups,
        { id: 'ag2', name: 'Brand - Another', campaignId: 'c1' },
      ];

      const result = await extractAllPatterns(
        mockCampaigns,
        adGroupsWithMultiple,
        keywordsWithMultipleGroups,
        mockAds
      );

      expect(result.adGroupStructures.averageKeywordsPerGroup).toBeGreaterThan(0);
    });

    it('should use default thresholds when not specified', async () => {
      const result = await extractAllPatterns(
        mockCampaigns,
        mockAdGroups,
        mockKeywords,
        mockAds
      );

      expect(result.highPerformingKeywords.length).toBeGreaterThanOrEqual(0);
    });

    it('should use custom thresholds when specified', async () => {
      const result = await extractAllPatterns(
        mockCampaigns,
        mockAdGroups,
        mockKeywords,
        mockAds,
        { minCTR: 10.0, minConversions: 20 }
      );

      // Should filter based on custom thresholds
      expect(result.highPerformingKeywords.every((kw) => kw.ctr >= 10.0 && kw.conversions >= 20)).toBe(true);
    });
  });
});

