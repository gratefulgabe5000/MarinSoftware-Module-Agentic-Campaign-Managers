# Testing Plan: CSV/URL-Based Campaign Generation MVP

**Document Version**: 1.0  
**Created**: January 2025  
**Last Updated**: January 2025  
**Project**: CSV/URL-Based Campaign Generation MVP

---

## Overview

This document outlines the testing plan for the CSV/URL-Based Campaign Generation MVP. The testing covers all phases of the implementation, from CSV upload to campaign export.

---

## Testing Scope

### Phase 0: Foundation & Setup
- [x] Environment setup
- [x] Dependencies installation
- [x] Basic routing

### Phase 1: CSV/URL Input Processing
- [ ] CSV file upload
- [ ] CSV parsing and validation
- [ ] Product data extraction
- [ ] URL validation
- [ ] Error handling

### Phase 2: Pattern Learning & Campaign Generation
- [ ] Pattern extraction from existing campaigns
- [ ] Ad group generation
- [ ] Keyword generation
- [ ] RSA ad generation
- [ ] Generation progress tracking

### Phase 3: Preview & Export
- [ ] Campaign preview display
- [ ] Inline editing (ad groups, keywords, ads)
- [ ] Validation
- [ ] CSV export to Google Ads Editor
- [ ] Export validation

---

## Test Cases

### 1. CSV Upload & Parsing

#### Test Case 1.1: Valid CSV Upload
**Objective**: Verify that a valid CSV file is uploaded and parsed correctly.

**Steps**:
1. Navigate to CSV upload screen
2. Select a valid CSV file (e.g., `sample-products.csv`)
3. Click "Upload" button
4. Verify file is parsed correctly
5. Verify product data is displayed

**Expected Result**: CSV file is uploaded, parsed, and product data is displayed correctly.

**Status**: ⏳ Pending

---

#### Test Case 1.2: Invalid CSV Format
**Objective**: Verify that invalid CSV files are rejected with appropriate error messages.

**Steps**:
1. Navigate to CSV upload screen
2. Select an invalid CSV file (wrong format, missing columns)
3. Click "Upload" button
4. Verify error message is displayed

**Expected Result**: Error message is displayed indicating the CSV format is invalid.

**Status**: ⏳ Pending

---

#### Test Case 1.3: Empty CSV File
**Objective**: Verify that empty CSV files are handled correctly.

**Steps**:
1. Navigate to CSV upload screen
2. Select an empty CSV file
3. Click "Upload" button
4. Verify error message is displayed

**Expected Result**: Error message is displayed indicating the CSV file is empty.

**Status**: ⏳ Pending

---

### 2. Campaign Generation

#### Test Case 2.1: Single Product Campaign Generation
**Objective**: Verify that a campaign is generated for a single product.

**Steps**:
1. Upload a CSV with one product
2. Click "Generate Campaigns" button
3. Monitor generation progress
4. Verify campaign is generated successfully
5. Verify ad groups, keywords, and ads are created

**Expected Result**: Campaign is generated with ad groups, keywords, and ads.

**Status**: ⏳ Pending

---

#### Test Case 2.2: Multiple Products Campaign Generation
**Objective**: Verify that campaigns are generated for multiple products.

**Steps**:
1. Upload a CSV with multiple products
2. Click "Generate Campaigns" button
3. Monitor generation progress
4. Verify campaigns are generated for each product
5. Verify all ad groups, keywords, and ads are created

**Expected Result**: Campaigns are generated for all products with ad groups, keywords, and ads.

**Status**: ⏳ Pending

---

#### Test Case 2.3: Generation Error Handling
**Objective**: Verify that generation errors are handled gracefully.

**Steps**:
1. Upload a CSV with invalid product data
2. Click "Generate Campaigns" button
3. Verify error is caught and displayed
4. Verify user can retry or go back

**Expected Result**: Error is displayed and user can retry or go back.

**Status**: ⏳ Pending

---

### 3. Campaign Preview & Editing

#### Test Case 3.1: Preview Display
**Objective**: Verify that the campaign preview is displayed correctly.

**Steps**:
1. Generate a campaign
2. Navigate to preview screen
3. Verify campaign structure is displayed
4. Verify ad groups, keywords, and ads are shown

**Expected Result**: Campaign preview is displayed with all ad groups, keywords, and ads.

**Status**: ⏳ Pending

---

#### Test Case 3.2: Inline Editing - Ad Group Name
**Objective**: Verify that ad group names can be edited inline.

**Steps**:
1. Navigate to preview screen
2. Click on an ad group name
3. Edit the name
4. Save the changes
5. Verify changes are saved

**Expected Result**: Ad group name is updated and saved.

**Status**: ⏳ Pending

---

#### Test Case 3.3: Inline Editing - Keywords
**Objective**: Verify that keywords can be edited inline.

**Steps**:
1. Navigate to preview screen
2. Click on a keyword
3. Edit the keyword text or match type
4. Save the changes
5. Verify changes are saved

**Expected Result**: Keyword is updated and saved.

**Status**: ⏳ Pending

---

#### Test Case 3.4: Inline Editing - Ad Copy
**Objective**: Verify that ad copy (headlines, descriptions, URLs) can be edited.

**Steps**:
1. Navigate to preview screen
2. Expand an ad row
3. Edit headlines, descriptions, or URLs
4. Save the changes
5. Verify changes are saved

**Expected Result**: Ad copy is updated and saved.

**Status**: ⏳ Pending

---

#### Test Case 3.5: Validation - Character Limits
**Objective**: Verify that character limits are enforced during editing.

**Steps**:
1. Navigate to preview screen
2. Edit a headline to exceed 30 characters
3. Verify validation error is displayed
4. Edit a description to exceed 90 characters
5. Verify validation error is displayed

**Expected Result**: Validation errors are displayed for character limit violations.

**Status**: ⏳ Pending

---

#### Test Case 3.6: Delete Keyword
**Objective**: Verify that keywords can be deleted.

**Steps**:
1. Navigate to preview screen
2. Click delete button on a keyword
3. Confirm deletion
4. Verify keyword is removed

**Expected Result**: Keyword is deleted and removed from the preview.

**Status**: ⏳ Pending

---

#### Test Case 3.7: Delete Ad
**Objective**: Verify that ads can be deleted.

**Steps**:
1. Navigate to preview screen
2. Click delete button on an ad
3. Confirm deletion
4. Verify ad is removed

**Expected Result**: Ad is deleted and removed from the preview.

**Status**: ⏳ Pending

---

### 4. CSV Export

#### Test Case 4.1: Export Valid Campaign
**Objective**: Verify that a valid campaign can be exported to CSV.

**Steps**:
1. Generate a campaign
2. Navigate to preview screen
3. Click "Export to Google Ads Editor" button
4. Verify CSV file is downloaded
5. Verify CSV format is correct

**Expected Result**: CSV file is downloaded with correct Google Ads Editor format.

**Status**: ⏳ Pending

---

#### Test Case 4.2: Export Validation
**Objective**: Verify that export validation prevents invalid exports.

**Steps**:
1. Generate a campaign
2. Edit campaign to create validation errors (e.g., empty headlines)
3. Click "Export to Google Ads Editor" button
4. Verify validation errors are displayed
5. Verify export is blocked

**Expected Result**: Validation errors are displayed and export is blocked.

**Status**: ⏳ Pending

---

#### Test Case 4.3: Export Edited Campaign
**Objective**: Verify that edited campaigns are exported correctly.

**Steps**:
1. Generate a campaign
2. Edit ad group names, keywords, and ad copy
3. Click "Export to Google Ads Editor" button
4. Verify CSV contains edited data

**Expected Result**: CSV file contains the edited campaign data.

**Status**: ⏳ Pending

---

## Test Execution Log

### Test Run 1: [Date]
**Tester**: [Name]  
**Environment**: Development  
**Results**: [Results]

---

## Known Issues

### Issue 1: [Description]
**Severity**: [High/Medium/Low]  
**Status**: [Open/In Progress/Resolved]  
**Notes**: [Notes]

---

## Test Coverage

### Frontend Components
- [ ] CSVUploadScreen
- [ ] CampaignGenerationScreen
- [ ] CampaignPreviewScreen
- [ ] CampaignPreviewTable
- [ ] AdGroupRow
- [ ] KeywordRow
- [ ] AdRow
- [ ] AdCopyEditor
- [ ] ExportButton
- [ ] ExportInstructions

### Backend Services
- [ ] CSV parsing service
- [ ] Pattern extraction service
- [ ] Ad group generation service
- [ ] Keyword generation service
- [ ] RSA generation service
- [ ] CSV export service
- [ ] Validation service

### API Endpoints
- [ ] POST /api/products/upload
- [ ] POST /api/campaigns/generate
- [ ] POST /api/campaigns/adgroups/generate
- [ ] POST /api/campaigns/keywords/generate
- [ ] POST /api/campaigns/ads/generate-rsa
- [ ] POST /api/campaigns/export
- [ ] POST /api/campaigns/export/validate

---

## Test Data

### Sample CSV Files
- `sample-products.csv` - Valid CSV with multiple products
- `sample-products-empty.csv` - Empty CSV file
- `sample-products-invalid.csv` - Invalid CSV format

---

## Next Steps

1. Execute test cases systematically
2. Document test results
3. Report bugs and issues
4. Verify fixes
5. Re-test after fixes

---

*Document Version: 1.0*  
*Created: January 2025*  
*Project: CSV/URL-Based Campaign Generation MVP*

