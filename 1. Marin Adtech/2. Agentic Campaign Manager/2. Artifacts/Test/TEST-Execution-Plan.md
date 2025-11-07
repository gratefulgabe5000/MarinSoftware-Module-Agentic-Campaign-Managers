# Testing Plan: CSV/URL-Based Campaign Generation MVP

**Document Version**: 1.1  
**Created**: January 2025  
**Last Updated**: January 2025  
**Project**: CSV/URL-Based Campaign Generation MVP  
**Project Status**: ✅ MVP Complete - All Phases Implemented  
**Version**: 1.0.0 (MVP)

---

## Overview

This document outlines the testing plan for the CSV/URL-Based Campaign Generation MVP. The testing covers all phases of the implementation, from CSV upload to campaign export.

**Project Status**: ✅ **MVP COMPLETE** - All phases implemented and ready for testing  
**Version**: 1.0.0 (MVP)  
**Completion Date**: January 6, 2025  
**Frontend URL**: http://localhost:5173/  
**Backend URL**: http://localhost:3001/

**Testing Status**: ✅ **READY TO BEGIN** - All implementation phases are complete. The system is ready for end-to-end testing.

---

## Pre-Test Checklist

### Environment Setup
- [x] Backend server is running (http://localhost:3001)
- [x] Frontend server is running (http://localhost:5173)
- [x] Sample CSV file exists (`sample-products.csv`)
- [x] All dependencies installed
- [x] No linting errors
- [x] TypeScript compilation successful
- [x] Build process working correctly

### Implementation Status
- [x] Phase 0: Foundation & Setup - COMPLETE
- [x] Phase 1: CSV/URL Input Processing - COMPLETE
- [x] Phase 2: Pattern Learning & Campaign Generation - COMPLETE
- [x] Phase 3: Preview & Export - COMPLETE

---

## Quick Start Testing Guide

### Step 1: Access the Application
1. Open browser to http://localhost:5173/
2. Navigate to "CSV/URL Campaign Generation" or click "Generate Campaigns from CSV"
3. Alternatively, navigate directly to `/campaigns/generate` route

### Step 2: Upload CSV File
1. Click "Upload CSV" or drag and drop `sample-products.csv`
2. Verify products are parsed and displayed in the product preview table
3. Review product data (Name, URL, Category, Price, Description)
4. Optionally edit product data inline before generation
5. Click "Generate Campaigns" button

### Step 3: Monitor Campaign Generation
1. Watch progress indicators for each step:
   - Ad Groups Generation (one per product)
   - Keywords Generation (15-20 keywords per ad group)
   - RSA Ads Generation (1-2 ads per ad group)
2. Monitor progress for each product/ad group
3. Wait for completion message with generation summary
4. Review generated campaign summary (Ad Groups, Keywords, Ads counts)
5. Click "Preview & Edit" button to proceed to preview screen

### Step 4: Test Preview & Editing
1. Verify campaign structure is displayed in spreadsheet-like interface
2. Test expandable/collapsible rows for ad groups
3. Test inline editing:
   - Click on ad group name to edit (save with Enter or blur)
   - Click on keyword text or match type to edit
   - Expand ad row to edit headlines (15 per ad, max 30 chars each)
   - Edit descriptions (4 per ad, max 90 chars each)
   - Edit final URLs
4. Test validation:
   - Try entering headline > 30 characters (should show error)
   - Try entering description > 90 characters (should show error)
   - Verify character count indicators work
   - Verify error messages appear in real-time
5. Test filtering and sorting:
   - Filter by ad group name
   - Filter by keywords
   - Sort by name, keyword count, or ad count
6. Test delete functionality:
   - Delete a keyword (confirm deletion)
   - Delete an ad (confirm deletion)
7. Review validation summary at top of preview

### Step 5: Test CSV Export
1. Review validation summary (should show no errors for valid campaign)
2. Click "Export to Google Ads Editor" button
3. Verify validation runs before export
4. Verify CSV file downloads automatically
5. Open CSV file in text editor or spreadsheet application
6. Verify format matches Google Ads Editor requirements:
   - One row per keyword-ad combination
   - Match types formatted as [Broad], [Phrase], or [Exact]
   - All required columns present
   - Headlines and descriptions properly formatted
7. (Optional) Import into Google Ads Editor to verify compatibility
8. Verify exported data matches edited preview data

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

## Test Scenarios

### Scenario 1: Happy Path - Single Product
**Objective**: Test complete workflow with one product

**Steps**:
1. Create CSV with one product
2. Upload CSV
3. Generate campaign
4. Preview campaign
5. Edit ad group name
6. Edit keyword
7. Edit ad copy
8. Export to CSV

**Expected Result**: All steps complete successfully, CSV exports correctly

---

### Scenario 2: Happy Path - Multiple Products
**Objective**: Test complete workflow with multiple products

**Steps**:
1. Use `sample-products.csv` (6 products)
2. Upload CSV
3. Generate campaigns
4. Preview campaigns
5. Edit multiple items
6. Export to CSV

**Expected Result**: All products generate campaigns, edits work, CSV exports correctly

---

### Scenario 3: Validation Testing
**Objective**: Test validation rules

**Steps**:
1. Generate campaign
2. Navigate to preview
3. Edit headline to exceed 30 characters
4. Edit description to exceed 90 characters
5. Try to export with validation errors

**Expected Result**: Validation errors displayed, export blocked

---

### Scenario 4: Error Handling
**Objective**: Test error handling

**Steps**:
1. Upload invalid CSV file
2. Upload empty CSV file
3. Upload CSV with missing required columns
4. Try to generate campaign with invalid data

**Expected Result**: Appropriate error messages displayed

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

### Issue #1: None Currently
**Status**: No known issues at this time

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
- [ ] POST /api/products/parse-csv - Parse CSV file
- [ ] POST /api/products/parse-url-list - Parse URL list (alternative input method)
- [ ] POST /api/campaigns/generate - Generate complete campaigns (orchestrates all steps)
- [ ] POST /api/campaigns/adgroups/generate - Generate ad groups for products
- [ ] POST /api/campaigns/keywords/generate - Generate keywords for ad groups
- [ ] POST /api/campaigns/ads/generate-rsa - Generate responsive search ads (RSA)
- [ ] POST /api/campaigns/export - Export campaign to Google Ads Editor CSV format
- [ ] POST /api/campaigns/export/validate - Validate campaign before export

---

## Key Features to Test

### CSV Upload
- [ ] Drag and drop file upload
- [ ] File picker upload
- [ ] File validation (type, size)
- [ ] CSV parsing
- [ ] Product data extraction
- [ ] Error handling

### Campaign Generation
- [ ] Progress tracking
- [ ] Ad group generation
- [ ] Keyword generation
- [ ] RSA ad generation
- [ ] Error handling
- [ ] Completion notification

### Preview & Editing
- [ ] Campaign structure display
- [ ] Inline editing (ad groups, keywords, ads)
- [ ] Validation (character limits, required fields)
- [ ] Delete functionality
- [ ] Save draft
- [ ] Filtering and sorting

### CSV Export
- [ ] Export button functionality
- [ ] Validation before export
- [ ] CSV file download
- [ ] CSV format correctness
- [ ] Google Ads Editor compatibility

---

## Test Data

### Sample CSV File
Location: `Module-Agentic_Campaign_Manager/sample-products.csv`

**Contents**:
- 6 motorcycle products
- Product Name, URL, Category, Price, Description columns
- Valid URLs
- Valid product data

### Sample CSV Files
- `sample-products.csv` - Valid CSV with multiple products (6 products)
- `sample-products-empty.csv` - Empty CSV file (for testing empty file handling)
- `sample-products-invalid.csv` - Invalid CSV format (for testing error handling)

---

## Browser Testing

### Recommended Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)

### Test Checklist
- [ ] Responsive design
- [ ] File upload works
- [ ] Drag and drop works
- [ ] CSV download works
- [ ] All buttons functional
- [ ] Error messages display correctly
- [ ] Loading states work

---

## Performance Testing

### Metrics to Monitor
- [ ] CSV upload time
- [ ] Campaign generation time
- [ ] Preview rendering time
- [ ] Export generation time
- [ ] API response times

### Expected Performance
- CSV upload: < 2 seconds
- Campaign generation: < 30 seconds (for 6 products)
- Preview rendering: < 1 second
- Export generation: < 2 seconds

---

## Testing Resources

### Documentation
- `TEST-EXECUTION-LOG.md` - Test execution log
- `GOOGLE-ADS-EDITOR-CSV-FORMAT.md` - CSV format documentation
- `PRD-CSV-URL-Campaign-Generation-MVP.md` - Product requirements
- `ARCHITECTURE-CSV-URL-Campaign-Generation-MVP.md` - Architecture documentation

### Test Files
- `sample-products.csv` - Sample CSV file for testing

---

## Support

If you encounter issues during testing:
1. Check browser console for errors
2. Check backend logs for API errors
3. Review documentation for expected behavior
4. Document issues in TEST-EXECUTION-LOG.md

---

## Next Steps

1. **Execute Manual Tests**: Follow the test scenarios and test cases above
2. **Document Results**: Update TEST-EXECUTION-LOG.md
3. **Report Issues**: Document any bugs or issues found
4. **Verify Fixes**: Re-test after fixes are applied
5. **User Acceptance Testing**: Get feedback from end users

---

*Document Version: 1.1*  
*Created: January 2025*  
*Last Updated: January 2025*  
*Project: CSV/URL-Based Campaign Generation MVP*  
*Project Status: ✅ MVP Complete - All Phases Implemented*

