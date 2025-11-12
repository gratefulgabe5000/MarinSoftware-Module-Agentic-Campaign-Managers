/**
 * Brand Guidelines Types (Frontend)
 * Comprehensive TypeScript type definitions for Brand Guidelines
 * Based on Canva brand guidelines format with support for both high-level
 * and comprehensive style guides
 */

/**
 * Color definition with hex, RGB, and metadata
 */
export interface Color {
  /** Color name (e.g., "Primary Blue", "Accent Red") */
  name: string;
  /** Hex color code (e.g., "#FF5733") */
  hex: string;
  /** RGB color values */
  rgb?: {
    r: number;
    g: number;
    b: number;
  };
  /** CMYK color values for print */
  cmyk?: {
    c: number;
    m: number;
    y: number;
    k: number;
  };
  /** Pantone color code if applicable */
  pantone?: string;
  /** Color usage description (e.g., "Use for primary CTAs and headers") */
  usage?: string;
  /** Accessibility contrast ratio information */
  accessibility?: {
    /** WCAG AA/AAA compliance level */
    wcagLevel: 'AA' | 'AAA' | 'Not Compliant';
    /** Contrast ratio for text on this background */
    contrastRatio?: number;
  };
}

/**
 * Color Palette Configuration
 * Defines primary, secondary, and accent colors for brand
 */
export interface ColorPalette {
  /** Primary brand colors (typically 1-3 colors) */
  primary: Color[];
  /** Secondary brand colors for variety and emphasis */
  secondary?: Color[];
  /** Accent colors for highlights and calls-to-action */
  accent?: Color[];
  /** Neutral colors (grays, whites, blacks) */
  neutrals?: Color[];
  /** Background colors for different contexts */
  backgrounds?: Color[];
  /** Text colors for various uses */
  textColors?: Color[];
  /** Error, warning, success, info state colors */
  stateColors?: {
    error?: Color;
    warning?: Color;
    success?: Color;
    info?: Color;
  };
  /** Gradient definitions if brand uses gradients */
  gradients?: Array<{
    name: string;
    colors: string[];
    direction?: string;
    usage?: string;
  }>;
}

/**
 * Font weight options
 */
export type FontWeight =
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

/**
 * Font Family Definition
 */
export interface FontFamily {
  /** Font family name (e.g., "Helvetica Neue", "Inter") */
  name: string;
  /** Font category (e.g., "sans-serif", "serif", "monospace") */
  category: 'sans-serif' | 'serif' | 'monospace' | 'display' | 'handwriting';
  /** Font source URL or file path */
  source?: string;
  /** Available font weights */
  weights?: FontWeight[];
  /** Available font styles */
  styles?: Array<'normal' | 'italic' | 'oblique'>;
  /** Fallback fonts */
  fallbacks?: string[];
  /** License information */
  license?: string;
  /** Usage description (e.g., "Use for headlines and titles") */
  usage?: string;
}

/**
 * Typography Scale Definition
 */
export interface TypographyScale {
  /** Scale name (e.g., "Heading 1", "Body", "Caption") */
  name: string;
  /** Font family to use */
  fontFamily: string;
  /** Font size in pixels or rems */
  fontSize: string;
  /** Font weight */
  fontWeight: FontWeight;
  /** Line height */
  lineHeight: string;
  /** Letter spacing */
  letterSpacing?: string;
  /** Text transform (e.g., "uppercase", "capitalize") */
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  /** Usage context (e.g., "Use for main page headings") */
  usage?: string;
}

/**
 * Typography Guidelines Configuration
 * Defines fonts, type scales, and typography rules
 */
export interface TypographyGuidelines {
  /** Primary font family for headings */
  primaryFont: FontFamily;
  /** Secondary font family for body text */
  secondaryFont?: FontFamily;
  /** Additional accent or display fonts */
  accentFonts?: FontFamily[];
  /** Typography scale definitions (h1-h6, body, caption, etc.) */
  typeScale: TypographyScale[];
  /** Paragraph styling guidelines */
  paragraphStyle?: {
    spacing: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
    maxWidth?: string;
  };
  /** Link styling guidelines */
  linkStyle?: {
    color: string;
    textDecoration?: 'none' | 'underline';
    hoverColor?: string;
  };
  /** General typography rules and best practices */
  rules?: string[];
}

/**
 * Logo Variant Type
 */
export type LogoVariant =
  | 'primary'
  | 'secondary'
  | 'icon'
  | 'wordmark'
  | 'stacked'
  | 'horizontal'
  | 'white'
  | 'black'
  | 'monochrome'
  | 'reversed';

/**
 * Logo File Format
 */
export interface LogoFile {
  /** File format (e.g., "svg", "png", "jpg") */
  format: 'svg' | 'png' | 'jpg' | 'pdf' | 'eps' | 'ai';
  /** File URL or path */
  url: string;
  /** File size in bytes */
  size?: number;
  /** Image dimensions if applicable */
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Logo Definition
 */
export interface Logo {
  /** Logo variant type */
  variant: LogoVariant;
  /** Logo description */
  description: string;
  /** Available file formats */
  files: LogoFile[];
  /** Usage guidelines for this variant */
  usage: string;
  /** When to use this variant */
  useCases?: string[];
  /** When NOT to use this variant */
  avoidCases?: string[];
}

/**
 * Logo Guidelines Configuration
 * Defines logo variations, clear space, sizing, and usage rules
 */
export interface LogoGuidelines {
  /** All logo variations */
  logos: Logo[];
  /** Primary logo to use in most cases */
  primaryLogo: Logo;
  /** Minimum clear space around logo (in pixels or multiplier of logo height) */
  clearSpace: string;
  /** Minimum size requirements */
  minimumSize: {
    /** Minimum width in pixels */
    width: number;
    /** Minimum height in pixels */
    height: number;
  };
  /** Maximum size recommendations */
  maximumSize?: {
    width: number;
    height: number;
  };
  /** Backgrounds the logo can appear on */
  approvedBackgrounds?: string[];
  /** Backgrounds to avoid */
  prohibitedBackgrounds?: string[];
  /** Logo placement rules */
  placementRules?: string[];
  /** Things never to do with the logo */
  prohibitedUses?: string[];
}

/**
 * Image Style Type
 */
export type ImageStyle =
  | 'photography'
  | 'illustration'
  | 'icon'
  | 'graphic'
  | 'mixed';

/**
 * Image Treatment Type
 */
export type ImageTreatment =
  | 'full-color'
  | 'black-and-white'
  | 'duotone'
  | 'filtered'
  | 'overlayed';

/**
 * Imagery Guidelines Configuration
 * Defines photography, illustration, and visual style guidelines
 */
export interface ImageryGuidelines {
  /** Primary image style for the brand */
  primaryStyle: ImageStyle;
  /** Allowed image treatments */
  allowedTreatments?: ImageTreatment[];
  /** Photography guidelines */
  photography?: {
    /** Photography style description */
    style: string;
    /** Subject matter guidance */
    subjectMatter?: string[];
    /** Composition guidelines */
    composition?: string[];
    /** Lighting preferences */
    lighting?: string;
    /** Color treatment */
    colorTreatment?: string;
    /** Example image URLs */
    examples?: string[];
  };
  /** Illustration guidelines */
  illustration?: {
    /** Illustration style description */
    style: string;
    /** Color usage in illustrations */
    colorUsage?: string;
    /** Line weight and style */
    lineStyle?: string;
    /** Example illustration URLs */
    examples?: string[];
  };
  /** Image quality requirements */
  qualityRequirements?: {
    /** Minimum resolution in DPI */
    minimumResolution: number;
    /** Preferred file formats */
    preferredFormats?: string[];
    /** Maximum file size */
    maxFileSize?: string;
  };
  /** Image usage rules */
  usageRules?: string[];
  /** Things to avoid in imagery */
  prohibitions?: string[];
}

/**
 * Spacing Unit System
 */
export interface SpacingSystem {
  /** Base spacing unit (e.g., "8px", "0.5rem") */
  baseUnit: string;
  /** Spacing scale (e.g., xs, sm, md, lg, xl) */
  scale: {
    [key: string]: string;
  };
}

/**
 * Spacing Guidelines Configuration
 * Defines spacing, padding, and layout grid systems
 */
export interface SpacingGuidelines {
  /** Spacing unit system */
  spacingSystem: SpacingSystem;
  /** Grid system configuration */
  gridSystem?: {
    /** Number of columns */
    columns: number;
    /** Gutter width between columns */
    gutterWidth: string;
    /** Maximum content width */
    maxWidth?: string;
    /** Breakpoints for responsive design */
    breakpoints?: {
      [key: string]: string;
    };
  };
  /** Layout margin guidelines */
  margins?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  /** Padding guidelines */
  padding?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  /** Spacing rules and best practices */
  rules?: string[];
}

/**
 * Icon Style Type
 */
export type IconStyle =
  | 'line'
  | 'filled'
  | 'outlined'
  | 'duotone'
  | 'flat'
  | '3d';

/**
 * Icon Guidelines Configuration
 * Defines icon style, size, and usage guidelines
 */
export interface IconGuidelines {
  /** Primary icon style */
  primaryStyle: IconStyle;
  /** Icon library or source */
  iconLibrary?: string;
  /** Available icon sizes */
  sizes?: string[];
  /** Icon color usage */
  colorUsage?: string;
  /** Stroke width for line icons */
  strokeWidth?: string;
  /** Corner radius for icons */
  cornerRadius?: string;
  /** Icon grid and padding */
  gridAndPadding?: string;
  /** File format recommendations */
  fileFormats?: string[];
  /** Usage guidelines */
  usageGuidelines?: string[];
  /** Example icon URLs */
  examples?: string[];
}

/**
 * Brand Voice Tone
 */
export type BrandTone =
  | 'professional'
  | 'casual'
  | 'friendly'
  | 'authoritative'
  | 'playful'
  | 'serious'
  | 'empathetic'
  | 'inspiring'
  | 'educational'
  | 'conversational';

/**
 * Voice Guidelines Configuration
 * Defines brand voice, tone, and messaging guidelines
 */
export interface VoiceGuidelines {
  /** Overall brand voice description */
  brandVoice: string;
  /** Brand personality traits (e.g., ["authentic", "innovative", "trustworthy"]) */
  personalityTraits?: string[];
  /** Primary tone(s) to use */
  primaryTone: BrandTone[];
  /** Tones to avoid */
  tonesToAvoid?: BrandTone[];
  /** Messaging pillars or key themes */
  messagingPillars?: string[];
  /** Brand tagline or slogan */
  tagline?: string;
  /** Key messaging points */
  keyMessages?: string[];
  /** Words and phrases to use */
  preferredLanguage?: string[];
  /** Words and phrases to avoid */
  prohibitedLanguage?: string[];
  /** Grammar and style preferences */
  grammarStyle?: {
    /** Use Oxford comma or not */
    oxfordComma?: boolean;
    /** Preferred person (first, second, third) */
    preferredPerson?: 'first' | 'second' | 'third';
    /** Active vs passive voice preference */
    voicePreference?: 'active' | 'passive' | 'mixed';
    /** Contraction usage */
    contractions?: 'always' | 'never' | 'situational';
  };
  /** Writing style examples */
  examples?: Array<{
    /** Example category (e.g., "Email Subject Line", "Social Media Post") */
    category: string;
    /** Good example */
    good: string;
    /** Bad example (what to avoid) */
    bad?: string;
    /** Explanation of why it works */
    explanation?: string;
  }>;
}

/**
 * Do and Don't Item
 */
export interface DoAndDontItem {
  /** Category (e.g., "Logo Usage", "Color Application") */
  category: string;
  /** What to do */
  do: string;
  /** What not to do */
  dont: string;
  /** Example image for "do" */
  doImageUrl?: string;
  /** Example image for "don't" */
  dontImageUrl?: string;
}

/**
 * Do's and Don'ts Configuration
 * Visual and textual examples of correct and incorrect brand usage
 */
export interface DoAndDonts {
  /** All do's and don'ts items */
  items: DoAndDontItem[];
  /** General best practices */
  bestPractices?: string[];
  /** Common mistakes to avoid */
  commonMistakes?: string[];
}

/**
 * Template Type
 */
export type TemplateType =
  | 'social_media'
  | 'presentation'
  | 'document'
  | 'email'
  | 'advertisement'
  | 'business_card'
  | 'flyer'
  | 'brochure'
  | 'infographic'
  | 'report';

/**
 * Template Definition
 */
export interface Template {
  /** Template name */
  name: string;
  /** Template type */
  type: TemplateType;
  /** Template description */
  description: string;
  /** Template file URL */
  url: string;
  /** File format */
  format: string;
  /** Dimensions if applicable */
  dimensions?: {
    width: number;
    height: number;
    unit: 'px' | 'in' | 'mm';
  };
  /** Preview image URL */
  previewUrl?: string;
  /** Usage instructions */
  usageInstructions?: string;
}

/**
 * Template Guidelines Configuration
 * Pre-designed templates for various brand applications
 */
export interface TemplateGuidelines {
  /** Available templates organized by type */
  templates: Template[];
  /** Social media templates */
  socialMediaTemplates?: Template[];
  /** Presentation templates */
  presentationTemplates?: Template[];
  /** Document templates */
  documentTemplates?: Template[];
  /** Email templates */
  emailTemplates?: Template[];
  /** Template usage guidelines */
  usageGuidelines?: string[];
  /** How to customize templates */
  customizationRules?: string[];
}

/**
 * Accessibility Guidelines
 */
export interface AccessibilityGuidelines {
  /** Color contrast requirements */
  colorContrast?: {
    /** Minimum contrast ratio */
    minimumRatio: number;
    /** WCAG compliance level */
    wcagLevel: 'AA' | 'AAA';
  };
  /** Alt text guidelines */
  altText?: string[];
  /** Keyboard navigation requirements */
  keyboardNavigation?: string[];
  /** Screen reader compatibility */
  screenReaderGuidelines?: string[];
  /** Other accessibility best practices */
  otherGuidelines?: string[];
}

/**
 * High-Level Brand Guidelines
 * Canva format - comprehensive but streamlined essentials
 * Suitable for quick reference and basic brand consistency
 */
export interface HighLevelGuidelines {
  /** Basic logo usage */
  logo?: {
    /** Primary logo file URL */
    primaryLogoUrl: string;
    /** Alternative logo variations */
    alternativeLogos?: string[];
    /** Simple usage rules */
    usageRules: string[];
  };
  /** Essential color palette */
  colors?: {
    /** Primary brand colors */
    primary: Color[];
    /** Supporting colors */
    supporting?: Color[];
  };
  /** Core typography */
  typography?: {
    /** Primary font */
    primaryFont: string;
    /** Secondary font */
    secondaryFont?: string;
    /** Basic type sizes */
    typeSizes?: string[];
  };
  /** Brand voice summary */
  voice?: {
    /** Brief voice description */
    description: string;
    /** Key personality traits */
    traits: string[];
    /** Quick dos and don'ts */
    quickTips?: string[];
  };
  /** Essential imagery guidelines */
  imagery?: {
    /** Image style description */
    style: string;
    /** Key requirements */
    requirements: string[];
  };
}

/**
 * Full Style Guide
 * Canva format - comprehensive brand guidelines
 * Complete reference for all brand applications and detailed specifications
 */
export interface FullStyleGuide {
  /** Comprehensive logo guidelines */
  logoGuidelines: LogoGuidelines;
  /** Complete color palette system */
  colorPalette: ColorPalette;
  /** Detailed typography guidelines */
  typographyGuidelines: TypographyGuidelines;
  /** Imagery and photography guidelines */
  imageryGuidelines?: ImageryGuidelines;
  /** Spacing and layout guidelines */
  spacingGuidelines?: SpacingGuidelines;
  /** Icon system guidelines */
  iconGuidelines?: IconGuidelines;
  /** Brand voice and messaging */
  voiceGuidelines: VoiceGuidelines;
  /** Pre-designed templates */
  templateGuidelines?: TemplateGuidelines;
  /** Visual and usage examples */
  doAndDonts?: DoAndDonts;
  /** Accessibility guidelines */
  accessibilityGuidelines?: AccessibilityGuidelines;
}

/**
 * Brand Guidelines Detail Level
 */
export type GuidelinesDetailLevel = 'high-level' | 'full';

/**
 * Brand Guidelines
 * Main interface for comprehensive brand guidelines with toggle
 * between high-level and full style guide formats
 */
export interface BrandGuidelines {
  /** Unique identifier for brand guidelines */
  id: string;
  /** Brand name */
  brandName: string;
  /** Brand description or mission statement */
  brandDescription?: string;
  /** Account ID these guidelines belong to */
  accountId: string;
  /** Detail level of guidelines */
  detailLevel: GuidelinesDetailLevel;
  /** High-level guidelines (quick reference) */
  highLevelGuidelines?: HighLevelGuidelines;
  /** Full style guide (comprehensive) */
  fullStyleGuide?: FullStyleGuide;
  /** Industry or category (e.g., "Technology", "Retail", "Healthcare") */
  industry?: string;
  /** Target audience description */
  targetAudience?: string;
  /** Brand values and principles */
  brandValues?: string[];
  /** Brand positioning statement */
  positioningStatement?: string;
  /** Competitor brands for reference */
  competitors?: string[];
  /** Version number for tracking changes */
  version: number;
  /** Whether these are the active guidelines */
  isActive: boolean;
  /** ISO 8601 timestamp when guidelines were created */
  createdAt: Date;
  /** ISO 8601 timestamp when guidelines were last updated */
  updatedAt: Date;
  /** User ID who created the guidelines */
  createdBy?: string;
  /** User ID who last updated the guidelines */
  updatedBy?: string;
  /** Additional metadata */
  metadata?: {
    /** Tags for organization (e.g., ["2025-rebrand", "primary"]) */
    tags?: string[];
    /** Internal notes */
    notes?: string;
    /** Source of guidelines (e.g., "manual", "canva_import", "llm_generated") */
    source?: string;
    /** Last review date */
    lastReviewedAt?: Date;
    /** Next scheduled review date */
    nextReviewDate?: Date;
  };
}

/**
 * Brand Guidelines Creation Request
 * Used when creating new brand guidelines
 */
export interface BrandGuidelinesCreationRequest {
  /** Brand name */
  brandName: string;
  /** Brand description or mission statement */
  brandDescription?: string;
  /** Account ID these guidelines belong to */
  accountId: string;
  /** Detail level of guidelines */
  detailLevel: GuidelinesDetailLevel;
  /** High-level guidelines (required if detailLevel is 'high-level') */
  highLevelGuidelines?: HighLevelGuidelines;
  /** Full style guide (required if detailLevel is 'full') */
  fullStyleGuide?: FullStyleGuide;
  /** Industry or category */
  industry?: string;
  /** Target audience description */
  targetAudience?: string;
  /** Brand values and principles */
  brandValues?: string[];
  /** Brand positioning statement */
  positioningStatement?: string;
  /** Competitor brands for reference */
  competitors?: string[];
  /** Whether these are the active guidelines */
  isActive?: boolean;
  /** Additional metadata */
  metadata?: {
    tags?: string[];
    notes?: string;
    source?: string;
  };
}

/**
 * Brand Guidelines Update Request
 * Used when updating existing brand guidelines
 */
export interface BrandGuidelinesUpdateRequest {
  /** Brand name */
  brandName?: string;
  /** Brand description or mission statement */
  brandDescription?: string;
  /** Detail level of guidelines */
  detailLevel?: GuidelinesDetailLevel;
  /** High-level guidelines */
  highLevelGuidelines?: HighLevelGuidelines;
  /** Full style guide */
  fullStyleGuide?: FullStyleGuide;
  /** Industry or category */
  industry?: string;
  /** Target audience description */
  targetAudience?: string;
  /** Brand values and principles */
  brandValues?: string[];
  /** Brand positioning statement */
  positioningStatement?: string;
  /** Competitor brands for reference */
  competitors?: string[];
  /** Whether these are the active guidelines */
  isActive?: boolean;
  /** Additional metadata */
  metadata?: {
    tags?: string[];
    notes?: string;
    lastReviewedAt?: Date;
    nextReviewDate?: Date;
  };
}

/**
 * Brand Guidelines Validation Error
 */
export interface BrandGuidelinesValidationError {
  /** Field that has the validation error */
  field: string;
  /** Error message describing the validation issue */
  message: string;
  /** Error code for programmatic handling */
  code?: string;
}

/**
 * Brand Guidelines Validation Result
 */
export interface BrandGuidelinesValidationResult {
  /** Whether the guidelines are valid */
  isValid: boolean;
  /** List of validation errors if invalid */
  errors?: BrandGuidelinesValidationError[];
  /** List of validation warnings (non-blocking issues) */
  warnings?: string[];
}

/**
 * Brand Asset Reference
 * Reference to external brand assets (files, images, documents)
 */
export interface BrandAssetReference {
  /** Asset ID */
  id: string;
  /** Asset name */
  name: string;
  /** Asset type (e.g., "logo", "font", "image", "document") */
  type: string;
  /** Asset URL */
  url: string;
  /** File format */
  format: string;
  /** File size in bytes */
  size?: number;
  /** Asset description */
  description?: string;
  /** ISO 8601 timestamp when asset was uploaded */
  uploadedAt?: Date;
}
