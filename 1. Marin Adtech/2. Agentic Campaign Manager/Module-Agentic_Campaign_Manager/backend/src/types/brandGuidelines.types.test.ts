/**
 * Brand Guidelines Types Tests
 * Tests type safety and provides example usage for brand guidelines types
 */

import {
  BrandGuidelines,
  HighLevelGuidelines,
  FullStyleGuide,
  Color,
  ColorPalette,
  FontFamily,
  TypographyScale,
  TypographyGuidelines,
  Logo,
  LogoGuidelines,
  VoiceGuidelines,
  ImageryGuidelines,
  SpacingGuidelines,
  IconGuidelines,
  TemplateGuidelines,
  DoAndDonts,
  BrandGuidelinesCreationRequest,
  BrandGuidelinesUpdateRequest,
  GuidelinesDetailLevel,
} from './brandGuidelines.types';

describe('Brand Guidelines Types', () => {
  describe('Color Types', () => {
    it('should create a valid Color object', () => {
      const color: Color = {
        name: 'Primary Blue',
        hex: '#0066CC',
        rgb: { r: 0, g: 102, b: 204 },
        cmyk: { c: 100, m: 50, y: 0, k: 20 },
        pantone: 'PMS 285',
        usage: 'Use for primary CTAs and headers',
        accessibility: {
          wcagLevel: 'AA',
          contrastRatio: 4.5,
        },
      };

      expect(color.name).toBe('Primary Blue');
      expect(color.hex).toBe('#0066CC');
      expect(color.accessibility?.wcagLevel).toBe('AA');
    });

    it('should create a valid ColorPalette', () => {
      const palette: ColorPalette = {
        primary: [
          {
            name: 'Brand Blue',
            hex: '#0066CC',
            usage: 'Primary brand color',
          },
        ],
        secondary: [
          {
            name: 'Accent Orange',
            hex: '#FF6600',
            usage: 'Secondary accent color',
          },
        ],
        neutrals: [
          {
            name: 'Charcoal',
            hex: '#333333',
            usage: 'Body text',
          },
        ],
        stateColors: {
          error: { name: 'Error Red', hex: '#DC3545' },
          success: { name: 'Success Green', hex: '#28A745' },
          warning: { name: 'Warning Yellow', hex: '#FFC107' },
          info: { name: 'Info Blue', hex: '#17A2B8' },
        },
      };

      expect(palette.primary).toHaveLength(1);
      expect(palette.stateColors?.error?.hex).toBe('#DC3545');
    });
  });

  describe('Typography Types', () => {
    it('should create a valid FontFamily', () => {
      const font: FontFamily = {
        name: 'Inter',
        category: 'sans-serif',
        source: 'https://fonts.google.com/specimen/Inter',
        weights: [400, 500, 600, 700],
        styles: ['normal', 'italic'],
        fallbacks: ['Helvetica', 'Arial', 'sans-serif'],
        license: 'SIL Open Font License',
        usage: 'Primary font for all text',
      };

      expect(font.name).toBe('Inter');
      expect(font.category).toBe('sans-serif');
      expect(font.weights).toContain(700);
    });

    it('should create a valid TypographyScale', () => {
      const scale: TypographyScale = {
        name: 'Heading 1',
        fontFamily: 'Inter',
        fontSize: '48px',
        fontWeight: 700,
        lineHeight: '1.2',
        letterSpacing: '-0.02em',
        textTransform: 'none',
        usage: 'Main page headings',
      };

      expect(scale.name).toBe('Heading 1');
      expect(scale.fontWeight).toBe(700);
    });

    it('should create a valid TypographyGuidelines', () => {
      const typography: TypographyGuidelines = {
        primaryFont: {
          name: 'Inter',
          category: 'sans-serif',
          weights: [400, 600, 700],
          styles: ['normal'],
        },
        secondaryFont: {
          name: 'Roboto Mono',
          category: 'monospace',
          weights: [400],
          styles: ['normal'],
        },
        typeScale: [
          {
            name: 'H1',
            fontFamily: 'Inter',
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: '1.2',
          },
          {
            name: 'Body',
            fontFamily: 'Inter',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '1.5',
          },
        ],
      };

      expect(typography.primaryFont.name).toBe('Inter');
      expect(typography.typeScale).toHaveLength(2);
    });
  });

  describe('Logo Types', () => {
    it('should create a valid Logo', () => {
      const logo: Logo = {
        variant: 'primary',
        description: 'Main company logo',
        files: [
          {
            format: 'svg',
            url: 'https://cdn.example.com/logo.svg',
            size: 12345,
            dimensions: { width: 200, height: 50 },
          },
          {
            format: 'png',
            url: 'https://cdn.example.com/logo@2x.png',
            dimensions: { width: 400, height: 100 },
          },
        ],
        usage: 'Use in all standard applications',
        useCases: ['Website header', 'Marketing materials', 'Email signatures'],
        avoidCases: ['Backgrounds with low contrast', 'Sizes below 100px width'],
      };

      expect(logo.variant).toBe('primary');
      expect(logo.files).toHaveLength(2);
      expect(logo.useCases).toContain('Website header');
    });

    it('should create valid LogoGuidelines', () => {
      const primaryLogo: Logo = {
        variant: 'primary',
        description: 'Primary logo',
        files: [{ format: 'svg', url: 'logo.svg' }],
        usage: 'Default logo',
      };

      const guidelines: LogoGuidelines = {
        logos: [primaryLogo],
        primaryLogo: primaryLogo,
        clearSpace: '2x logo height',
        minimumSize: { width: 100, height: 25 },
        approvedBackgrounds: ['white', 'light gray', 'brand blue'],
        prohibitedBackgrounds: ['red', 'patterns'],
        placementRules: ['Always maintain clear space', 'Do not rotate'],
        prohibitedUses: ['Never stretch', 'Never add effects'],
      };

      expect(guidelines.primaryLogo.variant).toBe('primary');
      expect(guidelines.minimumSize.width).toBe(100);
    });
  });

  describe('Voice Guidelines Types', () => {
    it('should create valid VoiceGuidelines', () => {
      const voice: VoiceGuidelines = {
        brandVoice: 'Professional yet approachable, innovative, and trustworthy',
        personalityTraits: ['authentic', 'innovative', 'trustworthy', 'helpful'],
        primaryTone: ['professional', 'friendly', 'educational'],
        tonesToAvoid: ['casual', 'playful'],
        messagingPillars: [
          'Innovation in advertising',
          'Customer success focus',
          'Data-driven results',
        ],
        tagline: 'Smarter Advertising, Better Results',
        keyMessages: [
          'We help businesses optimize their ad campaigns',
          'Data-driven insights for better ROI',
        ],
        preferredLanguage: ['optimize', 'enhance', 'improve', 'results'],
        prohibitedLanguage: ['cheap', 'easy money', 'guaranteed'],
        grammarStyle: {
          oxfordComma: true,
          preferredPerson: 'second',
          voicePreference: 'active',
          contractions: 'situational',
        },
        examples: [
          {
            category: 'Email Subject Line',
            good: 'Increase Your ROI with Smart Campaign Optimization',
            bad: 'Make Easy Money with Our Tool!',
            explanation: 'Focus on value and professionalism, not hype',
          },
        ],
      };

      expect(voice.brandVoice).toContain('Professional');
      expect(voice.primaryTone).toContain('professional');
      expect(voice.grammarStyle?.oxfordComma).toBe(true);
      expect(voice.examples).toHaveLength(1);
    });
  });

  describe('High-Level Guidelines', () => {
    it('should create valid HighLevelGuidelines', () => {
      const highLevel: HighLevelGuidelines = {
        logo: {
          primaryLogoUrl: 'https://cdn.example.com/logo.svg',
          alternativeLogos: ['logo-white.svg', 'logo-icon.svg'],
          usageRules: ['Maintain clear space', 'Use approved colors only'],
        },
        colors: {
          primary: [
            { name: 'Brand Blue', hex: '#0066CC' },
            { name: 'Brand Orange', hex: '#FF6600' },
          ],
          supporting: [{ name: 'Neutral Gray', hex: '#666666' }],
        },
        typography: {
          primaryFont: 'Inter',
          secondaryFont: 'Roboto',
          typeSizes: ['48px', '32px', '24px', '16px', '14px'],
        },
        voice: {
          description: 'Professional and approachable',
          traits: ['trustworthy', 'innovative', 'helpful'],
          quickTips: ['Use active voice', 'Be concise', 'Focus on benefits'],
        },
        imagery: {
          style: 'Clean, modern photography with authentic people',
          requirements: [
            'High resolution (300 DPI minimum)',
            'Bright, natural lighting',
            'Include diverse representation',
          ],
        },
      };

      expect(highLevel.logo?.primaryLogoUrl).toContain('logo.svg');
      expect(highLevel.colors?.primary).toHaveLength(2);
      expect(highLevel.typography?.primaryFont).toBe('Inter');
    });
  });

  describe('Full Style Guide', () => {
    it('should create valid FullStyleGuide', () => {
      const primaryLogo: Logo = {
        variant: 'primary',
        description: 'Primary logo',
        files: [{ format: 'svg', url: 'logo.svg' }],
        usage: 'Default',
      };

      const fullGuide: FullStyleGuide = {
        logoGuidelines: {
          logos: [primaryLogo],
          primaryLogo,
          clearSpace: '2x height',
          minimumSize: { width: 100, height: 25 },
        },
        colorPalette: {
          primary: [{ name: 'Blue', hex: '#0066CC' }],
        },
        typographyGuidelines: {
          primaryFont: {
            name: 'Inter',
            category: 'sans-serif',
          },
          typeScale: [
            {
              name: 'H1',
              fontFamily: 'Inter',
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: '1.2',
            },
          ],
        },
        voiceGuidelines: {
          brandVoice: 'Professional and innovative',
          primaryTone: ['professional', 'educational'],
        },
        spacingGuidelines: {
          spacingSystem: {
            baseUnit: '8px',
            scale: {
              xs: '4px',
              sm: '8px',
              md: '16px',
              lg: '24px',
              xl: '32px',
            },
          },
        },
      };

      expect(fullGuide.logoGuidelines.primaryLogo.variant).toBe('primary');
      expect(fullGuide.colorPalette.primary).toHaveLength(1);
      expect(fullGuide.spacingGuidelines?.spacingSystem.baseUnit).toBe('8px');
    });
  });

  describe('Complete BrandGuidelines', () => {
    it('should create valid high-level BrandGuidelines', () => {
      const guidelines: BrandGuidelines = {
        id: 'brand-001',
        brandName: 'Marin Software',
        brandDescription: 'Leading provider of digital advertising solutions',
        accountId: 'acct-123',
        detailLevel: 'high-level',
        highLevelGuidelines: {
          logo: {
            primaryLogoUrl: 'https://cdn.example.com/logo.svg',
            usageRules: ['Maintain clear space'],
          },
          colors: {
            primary: [{ name: 'Blue', hex: '#0066CC' }],
          },
          typography: {
            primaryFont: 'Inter',
            typeSizes: ['48px', '32px', '16px'],
          },
          voice: {
            description: 'Professional and innovative',
            traits: ['trustworthy', 'innovative'],
          },
        },
        version: 1,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      expect(guidelines.id).toBe('brand-001');
      expect(guidelines.detailLevel).toBe('high-level');
      expect(guidelines.highLevelGuidelines).toBeDefined();
    });

    it('should create valid full BrandGuidelines', () => {
      const primaryLogo: Logo = {
        variant: 'primary',
        description: 'Primary',
        files: [{ format: 'svg', url: 'logo.svg' }],
        usage: 'Default',
      };

      const guidelines: BrandGuidelines = {
        id: 'brand-002',
        brandName: 'Zilkr',
        accountId: 'acct-456',
        detailLevel: 'full',
        fullStyleGuide: {
          logoGuidelines: {
            logos: [primaryLogo],
            primaryLogo,
            clearSpace: '2x',
            minimumSize: { width: 100, height: 25 },
          },
          colorPalette: {
            primary: [{ name: 'Purple', hex: '#6B46C1' }],
          },
          typographyGuidelines: {
            primaryFont: { name: 'Poppins', category: 'sans-serif' },
            typeScale: [
              {
                name: 'H1',
                fontFamily: 'Poppins',
                fontSize: '48px',
                fontWeight: 700,
                lineHeight: '1.2',
              },
            ],
          },
          voiceGuidelines: {
            brandVoice: 'Bold and innovative',
            primaryTone: ['friendly', 'inspiring'],
          },
        },
        industry: 'Technology',
        targetAudience: 'Digital marketers and agencies',
        brandValues: ['Innovation', 'Transparency', 'Results'],
        version: 2,
        isActive: true,
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-20'),
        metadata: {
          tags: ['2025-rebrand', 'primary'],
          notes: 'Updated brand guidelines following company rebrand',
          source: 'canva_import',
        },
      };

      expect(guidelines.detailLevel).toBe('full');
      expect(guidelines.fullStyleGuide).toBeDefined();
      expect(guidelines.brandValues).toContain('Innovation');
      expect(guidelines.metadata?.tags).toContain('2025-rebrand');
    });
  });

  describe('Request Types', () => {
    it('should create valid BrandGuidelinesCreationRequest', () => {
      const request: BrandGuidelinesCreationRequest = {
        brandName: 'New Brand',
        accountId: 'acct-789',
        detailLevel: 'high-level',
        highLevelGuidelines: {
          logo: {
            primaryLogoUrl: 'logo.svg',
            usageRules: ['Use responsibly'],
          },
        },
        industry: 'Retail',
        isActive: true,
        metadata: {
          tags: ['draft'],
          source: 'manual',
        },
      };

      expect(request.brandName).toBe('New Brand');
      expect(request.detailLevel).toBe('high-level');
    });

    it('should create valid BrandGuidelinesUpdateRequest', () => {
      const update: BrandGuidelinesUpdateRequest = {
        brandName: 'Updated Brand Name',
        isActive: false,
        metadata: {
          tags: ['archived'],
          lastReviewedAt: new Date('2025-01-20'),
        },
      };

      expect(update.brandName).toBe('Updated Brand Name');
      expect(update.isActive).toBe(false);
    });
  });

  describe('Type Safety', () => {
    it('should enforce GuidelinesDetailLevel type', () => {
      const level1: GuidelinesDetailLevel = 'high-level';
      const level2: GuidelinesDetailLevel = 'full';

      expect(['high-level', 'full']).toContain(level1);
      expect(['high-level', 'full']).toContain(level2);
    });

    it('should enforce FontWeight types', () => {
      const guidelines: BrandGuidelines = {
        id: 'test',
        brandName: 'Test',
        accountId: 'test',
        detailLevel: 'full',
        fullStyleGuide: {
          logoGuidelines: {
            logos: [],
            primaryLogo: {
              variant: 'primary',
              description: 'Test',
              files: [],
              usage: 'Test',
            },
            clearSpace: '2x',
            minimumSize: { width: 100, height: 25 },
          },
          colorPalette: { primary: [] },
          typographyGuidelines: {
            primaryFont: { name: 'Test', category: 'sans-serif' },
            typeScale: [
              {
                name: 'H1',
                fontFamily: 'Test',
                fontSize: '48px',
                fontWeight: 'bold', // Testing string weight
                lineHeight: '1.2',
              },
              {
                name: 'H2',
                fontFamily: 'Test',
                fontSize: '32px',
                fontWeight: 700, // Testing numeric weight
                lineHeight: '1.3',
              },
            ],
          },
          voiceGuidelines: {
            brandVoice: 'Test',
            primaryTone: ['professional'],
          },
        },
        version: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const scale1 = guidelines.fullStyleGuide!.typographyGuidelines.typeScale[0];
      const scale2 = guidelines.fullStyleGuide!.typographyGuidelines.typeScale[1];

      expect(scale1.fontWeight).toBe('bold');
      expect(scale2.fontWeight).toBe(700);
    });
  });
});
