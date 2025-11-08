# Google Ads Editor CSV Format Documentation

**Document Version**: 1.0  
**Created**: January 2025  
**Last Updated**: January 2025  
**Project**: CSV/URL-Based Campaign Generation MVP

---

## Overview

This document describes the CSV format required for importing campaigns into Google Ads Editor. The format is based on Google Ads Editor's import requirements for Responsive Search Ads (RSA) with keywords.

---

## CSV Format Specification

### Required Columns

The Google Ads Editor CSV format requires the following columns (in order):

1. **Campaign** - Campaign name
2. **Campaign state** - Campaign status (Active, Paused, etc.)
3. **Ad group** - Ad group name
4. **Ad group state** - Ad group status (Active, Paused, etc.)
5. **Keyword** - Keyword text
6. **Match type** - Keyword match type: `[Broad]`, `[Phrase]`, or `[Exact]`
7. **Keyword state** - Keyword status (Active, Paused, etc.)
8. **Headline 1** through **Headline 15** - Up to 15 headlines (max 30 characters each)
9. **Description 1** through **Description 4** - Up to 4 descriptions (max 90 characters each)
10. **Final URL** - Landing page URL
11. **Display URL** - Display URL (optional)
12. **Path 1** - URL path 1 (optional)
13. **Path 2** - URL path 2 (optional)

### Column Order

```
Campaign, Campaign state, Ad group, Ad group state, Keyword, Match type, Keyword state,
Headline 1, Headline 2, Headline 3, ..., Headline 15,
Description 1, Description 2, Description 3, Description 4,
Final URL, Display URL, Path 1, Path 2
```

### Example CSV

```csv
Campaign,Campaign state,Ad group,Ad group state,Keyword,Match type,Keyword state,Headline 1,Headline 2,Headline 3,Headline 4,Headline 5,Headline 6,Headline 7,Headline 8,Headline 9,Headline 10,Headline 11,Headline 12,Headline 13,Headline 14,Headline 15,Description 1,Description 2,Description 3,Description 4,Final URL,Display URL,Path 1,Path 2
Motorcycle Campaign,Active,Triumph Bonneville T120,Active,triumph bonneville,[Broad],Active,Buy Triumph T120,Classic British Style,Modern Performance,Free Shipping,Shop Now,Description 1,Description 2,Description 3,Description 4,https://example.com/triumph-bonneville,example.com,,
Motorcycle Campaign,Active,Triumph Bonneville T120,Active,triumph t120,[Phrase],Active,Buy Triumph T120,Classic British Style,Modern Performance,Free Shipping,Shop Now,Description 1,Description 2,Description 3,Description 4,https://example.com/triumph-bonneville,example.com,,
```

---

## Format Requirements

### Match Type Format

Google Ads Editor requires match types to be formatted with square brackets:
- `[Broad]` - Broad match
- `[Phrase]` - Phrase match
- `[Exact]` - Exact match

### Character Limits

- **Headlines**: Maximum 30 characters each
- **Descriptions**: Maximum 90 characters each
- **Keywords**: Maximum 80 characters
- **Ad Group Names**: Maximum 255 characters
- **Campaign Names**: Maximum 255 characters

### URL Requirements

- **Final URL**: Must be a valid HTTP or HTTPS URL
- **Display URL**: Optional, typically the domain name (e.g., `example.com`)
- **Path 1, Path 2**: Optional URL paths for tracking

### State Values

- **Campaign state**: `Active`, `Paused`, `Removed`
- **Ad group state**: `Active`, `Paused`, `Removed`
- **Keyword state**: `Active`, `Paused`, `Removed`

---

## Data Structure

### One Row Per Keyword-Ad Combination

For each ad group:
- Each keyword gets its own row
- Each row includes all headlines and descriptions from the ad
- If multiple ads exist in an ad group, each keyword-ad combination gets a row

**Example:**
- Ad Group: "Triumph T120"
- Keywords: 3 (triumph, motorcycle, cruiser)
- Ads: 1 (with 15 headlines, 4 descriptions)
- **Result**: 3 rows (one per keyword, all with same ad content)

### Empty Values

- Empty headlines/descriptions should be left as empty strings
- Empty URLs should be left as empty strings
- All columns must be present (even if empty)

---

## Validation Rules

### Required Fields

1. Campaign name must be present
2. Ad group name must be present
3. At least one keyword per ad group
4. At least 3 headlines per ad (if ads are included)
5. At least 2 descriptions per ad (if ads are included)
6. Final URL must be valid (if ads are included)

### Format Validation

1. Headlines must be ≤ 30 characters
2. Descriptions must be ≤ 90 characters
3. Keywords must be ≤ 80 characters
4. Match type must be `[Broad]`, `[Phrase]`, or `[Exact]`
5. URLs must be valid HTTP/HTTPS format

---

## Implementation Notes

### CSV Generation

The export service generates CSV rows as follows:

1. For each ad group:
   - For each ad in the ad group:
     - For each keyword in the ad group:
       - Create one CSV row with:
         - Campaign name
         - Campaign state (Active)
         - Ad group name
         - Ad group state (Active)
         - Keyword text
         - Match type (formatted with brackets)
         - Keyword state (Active)
         - All 15 headlines (empty if not present)
         - All 4 descriptions (empty if not present)
         - Final URL
         - Display URL (extracted from Final URL if not provided)
         - Path 1, Path 2 (empty if not provided)

2. If no ads exist in an ad group:
   - Still create rows for keywords (with empty ad fields)

### Character Encoding

- CSV should be UTF-8 encoded
- Special characters should be properly escaped
- Quotes should be escaped with double quotes (`""`)

### File Naming

- Default filename: `google-ads-editor-{campaign-name}-{timestamp}.csv`
- Campaign name is sanitized (non-alphanumeric characters replaced with underscores)

---

## Testing

### Test Cases

1. **Basic Export**: Export campaign with 1 ad group, 5 keywords, 1 ad
2. **Multiple Ad Groups**: Export campaign with multiple ad groups
3. **Multiple Ads**: Export ad group with multiple ads
4. **No Ads**: Export ad group with keywords but no ads
5. **Edge Cases**:
   - Empty headlines/descriptions
   - Maximum character lengths
   - Special characters in names
   - Long URLs

### Import Testing

1. Export CSV from the application
2. Open Google Ads Editor
3. File → Import
4. Select exported CSV
5. Verify import preview shows correct data
6. Verify no import errors

---

## References

- [Google Ads Editor Help](https://support.google.com/google-ads/editor/answer/38657)
- [Google Ads Editor Import Format](https://support.google.com/google-ads/editor/answer/38657)

---

*Document Version: 1.0*  
*Created: January 2025*  
*Project: CSV/URL-Based Campaign Generation MVP*

