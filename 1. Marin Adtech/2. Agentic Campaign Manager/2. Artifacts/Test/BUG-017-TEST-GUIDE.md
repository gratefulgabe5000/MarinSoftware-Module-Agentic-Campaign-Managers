# BUG-017 Testing Guide: Export Validation Fails with Empty Errors Array

**Bug Fixed:** Export validation now validates actual data being exported instead of store state  
**Date:** November 7, 2025  
**Status:** Ready for Testing

---

## 📋 Prerequisites

### 1. Start Development Servers

```powershell
# Terminal 1: Start Backend Server
cd "C:\Users\grate\Documents\Cursor\GratefulGabe5000\4b. MarinSoftware-Module-Agentic-Campaign-Manager-CSV-Update\1. Marin Adtech\2. Agentic Campaign Manager\Module-Agentic_Campaign_Manager"
npm run dev:backend

# Terminal 2: Start Frontend Server
cd "C:\Users\grate\Documents\Cursor\GratefulGabe5000\4b. MarinSoftware-Module-Agentic-Campaign-Manager-CSV-Update\1. Marin Adtech\2. Agentic Campaign Manager\Module-Agentic_Campaign_Manager"
npm run dev:frontend
```

**Verify servers are running:**
- Backend: http://localhost:3001/health
- Frontend: http://localhost:5173

### 2. Prepare Test CSV File

Create a test CSV file with valid product data:

**File:** `test-export-validation.csv`
```csv
Product Name,URL,Category,Price,Description
Running Shoes,https://example.com/running-shoes,Footwear,99.99,High-quality running shoes
Tennis Racket,https://example.com/tennis-racket,Sports,149.99,Professional tennis racket
```

**Save location:** Anywhere accessible (desktop or project folder)

---

## 🧪 Test Scenarios

### **Test Scenario 1: Export with Valid Campaign Data (Primary Test)**

**Purpose:** Verify export works when campaign data is valid and store state may be null

#### Steps:

1. **Open Application**
   - Navigate to: http://localhost:5173
   - You should see the Campaign Dashboard

2. **Upload CSV File**
   - Click "Generate Campaign" or navigate to `/campaigns/csv-upload`
   - Select the "CSV Upload" tab
   - Drag and drop `test-export-validation.csv` or click to browse
   - Wait for products to appear in the preview

3. **Generate Campaigns**
   - Click "Generate Campaign" button
   - Wait for campaign generation to complete
   - You should see "Campaign Generation Complete" screen

4. **Navigate to Preview**
   - Click "Preview & Edit" button
   - You should now be on the Campaign Preview screen (`/campaigns/preview`)

5. **Open Browser Console**
   - Press `F12` or `Ctrl+Shift+I` (Windows)
   - Go to "Console" tab
   - Clear console (click clear button or `Ctrl+L`)

6. **Attempt Export**
   - Look for "Export to Google Ads Editor" button
   - Click the button
   - **Watch console for any errors**

#### Expected Results:

✅ **SUCCESS:**
- Button shows "Validating..." then "Exporting..."
- No error toast appears
- CSV file downloads automatically
- Console shows no validation errors
- Success toast: "Campaign exported successfully! Check your downloads folder."

❌ **FAILURE (Old Bug):**
- Error toast: "Export validation failed:" with no specific errors
- Console shows: "Frontend validation failed: []" (empty errors array)
- Export is blocked

#### Verification:

- ✅ Check downloads folder for `google-ads-editor-export.csv` file
- ✅ Open CSV file and verify it contains campaign data
- ✅ Check console - should NOT show empty errors array
- ✅ Check toast notifications - should show success, not error

---

### **Test Scenario 2: Export with Invalid Campaign Data**

**Purpose:** Verify export shows specific error messages (not empty array) when data is invalid

#### Steps:

1. **Navigate to Campaign Preview**
   - Follow steps 1-4 from Test Scenario 1 to get to preview screen

2. **Make Data Invalid** (if possible)
   - Try to edit an ad group name to be empty
   - Or edit a keyword to be empty
   - Or remove all keywords from an ad group

3. **Attempt Export**
   - Click "Export to Google Ads Editor" button
   - **Watch for error messages**

#### Expected Results:

✅ **SUCCESS:**
- Error toast appears with **specific error messages**
- Example: "Export validation failed: Ad group 1 is missing a name"
- Console shows validation errors with details
- Export is blocked (correct behavior)

❌ **FAILURE:**
- Error toast: "Export validation failed:" with no specific errors
- Console shows empty errors array: `[]`
- No helpful error messages

#### Verification:

- ✅ Error messages should be specific and helpful
- ✅ Should NOT show empty errors array
- ✅ Should list actual validation errors (e.g., missing names, empty keywords)

---

### **Test Scenario 3: Export When Store State is Null**

**Purpose:** Verify export works even when store's preview data is null (the main bug fix)

#### Steps:

1. **Navigate to Campaign Preview**
   - Follow steps 1-4 from Test Scenario 1

2. **Check Store State** (Optional - for debugging)
   - Open browser console
   - Type: `window.__ZUSTAND_DEVTOOLS__` (if using Zustand DevTools)
   - Or check React DevTools → Components → CampaignPreviewStore
   - Verify `editedPreviewData` and `previewData` may be null

3. **Attempt Export**
   - Click "Export to Google Ads Editor" button
   - **This is the critical test** - export should work even if store state is null

#### Expected Results:

✅ **SUCCESS (Bug Fixed):**
- Export works even if store state is null
- Validation uses `previewData` prop (not store state)
- CSV file downloads successfully
- No empty errors array

❌ **FAILURE (Old Bug):**
- Export fails with empty errors array
- Error: "Export validation failed:" with no specific errors
- Console shows: "Frontend validation failed: []"

#### Verification:

- ✅ Export should succeed regardless of store state
- ✅ CSV file should download
- ✅ No empty errors array in console

---

### **Test Scenario 4: Export After Editing Campaign**

**Purpose:** Verify export uses edited data when available

#### Steps:

1. **Navigate to Campaign Preview**
   - Follow steps 1-4 from Test Scenario 1

2. **Edit Campaign Data**
   - Edit an ad group name
   - Edit a keyword
   - Make any changes to the campaign

3. **Attempt Export**
   - Click "Export to Google Ads Editor" button

#### Expected Results:

✅ **SUCCESS:**
- Export uses edited data (not original)
- CSV file contains edited values
- Export succeeds

#### Verification:

- ✅ Open downloaded CSV file
- ✅ Verify edited values appear in CSV
- ✅ Export should work with edited data

---

## 🔍 Debugging Checklist

If export fails, check:

1. **Browser Console**
   - Look for error messages
   - Check for "Frontend validation failed: []" (should NOT appear)
   - Check for specific validation errors

2. **Network Tab**
   - Check if API validation call succeeds
   - Look for `/api/campaigns/export/validate` request
   - Check response status and data

3. **React DevTools**
   - Check `ExportButton` component props
   - Verify `previewData` prop has data
   - Check `dataToExport` value

4. **Store State** (Optional)
   - Check if `editedPreviewData` is null
   - Check if `previewData` is null
   - **Export should work even if both are null** (uses prop)

---

## ✅ Success Criteria

The bug is **FIXED** if:

1. ✅ Export works with valid campaign data
2. ✅ Export shows specific error messages (not empty array) when data is invalid
3. ✅ Export works even when store state is null
4. ✅ Export uses edited data when available
5. ✅ No "Frontend validation failed: []" in console
6. ✅ CSV file downloads successfully
7. ✅ Error messages are specific and helpful

---

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________

Test Scenario 1 (Valid Data):
[ ] Pass [ ] Fail
Notes: _________________________________

Test Scenario 2 (Invalid Data):
[ ] Pass [ ] Fail
Notes: _________________________________

Test Scenario 3 (Null Store State):
[ ] Pass [ ] Fail
Notes: _________________________________

Test Scenario 4 (Edited Data):
[ ] Pass [ ] Fail
Notes: _________________________________

Overall Result: [ ] PASS [ ] FAIL

Issues Found:
_________________________________
_________________________________
```

---

## 🐛 Known Issues to Watch For

1. **Empty Errors Array** - Should NOT appear anymore
2. **Generic Error Messages** - Should show specific validation errors
3. **Export Blocked** - Should only block when data is actually invalid
4. **Store State Dependency** - Export should work regardless of store state

---

## 📞 Next Steps

If all tests pass:
- ✅ Mark BUG-017 as FIXED in bug tracker
- ✅ Update coordination document
- ✅ Commit changes with message: `fix(BUG-017): Validate export data directly instead of store state`

If tests fail:
- ❌ Document specific failure scenarios
- ❌ Check console for error details
- ❌ Verify fix was applied correctly
- ❌ Review code changes

---

**Last Updated:** November 7, 2025  
**Fix Version:** Option 1 - Direct Data Validation

