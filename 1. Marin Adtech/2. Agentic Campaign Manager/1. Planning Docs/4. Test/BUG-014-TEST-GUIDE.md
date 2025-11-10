# BUG-014 Testing Guide: Keyword Deletion Deletes Incorrect Item

**Bug Fixed:** Keyword deletion now uses index-based deletion instead of ID/text comparison  
**Date:** November 9, 2025  
**Status:** Ready for Testing

---

## 📋 Prerequisites

### 1. Start Development Servers

```powershell
# Terminal 1: Start Backend Server
cd "C:\Users\grate\Documents\Cursor\GratefulGabe5000\4b. MarinSoftware-Module-Agentic-Campaign-Manager-CSV-Update\1. Marin Adtech\2. Agentic Campaign Manager\Module-Agentic_Campaign_Manager\backend"
npm run dev

# Terminal 2: Start Frontend Server
cd "C:\Users\grate\Documents\Cursor\GratefulGabe5000\4b. MarinSoftware-Module-Agentic-Campaign-Manager-CSV-Update\1. Marin Adtech\2. Agentic Campaign Manager\Module-Agentic_Campaign_Manager"
npm run dev
```

**Verify servers are running:**
- Backend: http://localhost:3001/health
- Frontend: http://localhost:5173

### 2. Prepare Test Data

You need a campaign with multiple keywords in at least one ad group to test deletion.

---

## 🧪 Test Scenarios

### **Test Scenario 1: Delete Middle Keyword (Primary Test)**

**Purpose:** Verify that deleting a keyword in the middle of the list removes the correct item

#### Steps:

1. **Open Application**
   - Navigate to: http://localhost:5173
   - You should see the Campaign Dashboard

2. **Navigate to Campaign Preview**
   - If you have an existing campaign, click on it to view preview
   - Or create a new campaign:
     - Upload a CSV file or paste URLs
     - Generate campaigns
     - Click "Preview" on a generated campaign

3. **Expand an Ad Group**
   - Find an ad group with multiple keywords (at least 3)
   - Click the expand/collapse button to show keywords
   - Note the keywords in order (e.g., "keyword 1", "keyword 2", "keyword 3")

4. **Delete Middle Keyword**
   - Identify the keyword in the middle position (e.g., "keyword 2" if there are 3 keywords)
   - Click the delete button (trash icon) on that specific keyword
   - Confirm deletion in the dialog

5. **Verify Correct Deletion**
   - **Expected:** The keyword you clicked delete on should be removed
   - **Expected:** Other keywords should remain in their correct positions
   - **Expected:** Keyword count should decrease by 1
   - **❌ Before Fix:** The keyword at index +1 (next position) was deleted instead
   - **✅ After Fix:** The correct keyword (at the clicked index) is deleted

#### Success Criteria:
- ✅ The keyword you clicked delete on is removed
- ✅ Other keywords remain intact
- ✅ No other keywords are affected
- ✅ Keyword count is correct

---

### **Test Scenario 2: Delete First Keyword**

**Purpose:** Verify deletion works correctly for the first item in the list

#### Steps:

1. **Navigate to Campaign Preview** (same as Test 1)

2. **Expand an Ad Group with Multiple Keywords**

3. **Delete First Keyword**
   - Click delete on the first keyword in the list
   - Confirm deletion

4. **Verify Correct Deletion**
   - **Expected:** The first keyword is removed
   - **Expected:** The second keyword becomes the new first keyword
   - **Expected:** All other keywords shift up by one position

#### Success Criteria:
- ✅ First keyword is removed
- ✅ Remaining keywords are in correct order
- ✅ No keywords are duplicated or missing

---

### **Test Scenario 3: Delete Last Keyword**

**Purpose:** Verify deletion works correctly for the last item in the list

#### Steps:

1. **Navigate to Campaign Preview** (same as Test 1)

2. **Expand an Ad Group with Multiple Keywords**

3. **Delete Last Keyword**
   - Scroll to the last keyword in the list
   - Click delete on the last keyword
   - Confirm deletion

4. **Verify Correct Deletion**
   - **Expected:** The last keyword is removed
   - **Expected:** All other keywords remain in their positions
   - **Expected:** The list ends with the second-to-last keyword

#### Success Criteria:
- ✅ Last keyword is removed
- ✅ Other keywords remain unchanged
- ✅ List ends correctly

---

### **Test Scenario 4: Delete Multiple Keywords Sequentially**

**Purpose:** Verify that deleting multiple keywords works correctly when done in sequence

#### Steps:

1. **Navigate to Campaign Preview** (same as Test 1)

2. **Expand an Ad Group with 5+ Keywords**

3. **Delete First Keyword**
   - Delete the first keyword
   - Verify it's removed

4. **Delete New First Keyword**
   - The second keyword should now be first
   - Delete it
   - Verify it's removed

5. **Delete Middle Keyword**
   - Delete a keyword from the middle
   - Verify it's removed

6. **Verify Final State**
   - **Expected:** Only the keywords you didn't delete remain
   - **Expected:** All remaining keywords are in correct order
   - **Expected:** Keyword count matches remaining keywords

#### Success Criteria:
- ✅ Each deletion removes the correct keyword
- ✅ Remaining keywords are in correct order
- ✅ No keywords are accidentally deleted

---

### **Test Scenario 5: Delete Keywords with Duplicate Text**

**Purpose:** Verify deletion works correctly even when keywords have the same text (if possible)

#### Steps:

1. **Navigate to Campaign Preview**

2. **Find or Create Ad Group with Duplicate Keyword Text**
   - If keywords can have duplicate text, test with those
   - Or manually edit keywords to have same text temporarily

3. **Delete Specific Keyword**
   - Note the position of the keyword you want to delete
   - Click delete on that specific keyword
   - Confirm deletion

4. **Verify Correct Deletion**
   - **Expected:** Only the keyword at the clicked position is removed
   - **Expected:** Other keywords with same text remain
   - **❌ Before Fix:** Wrong keyword might be deleted due to text comparison
   - **✅ After Fix:** Correct keyword is deleted using index

#### Success Criteria:
- ✅ Correct keyword is deleted (by position, not text)
- ✅ Other keywords with same text remain
- ✅ Index-based deletion works correctly

---

## 🔍 What to Look For

### ✅ **Correct Behavior (After Fix):**
- The keyword you click delete on is removed
- Other keywords remain in correct positions
- Keyword count decreases by exactly 1
- No unexpected deletions occur

### ❌ **Incorrect Behavior (Before Fix):**
- Keyword at index +1 (next position) is deleted instead
- Wrong keyword is removed
- Multiple keywords might be affected
- Keyword count doesn't match remaining keywords

---

## 🐛 Known Issues (Before Fix)

1. **Index Mismatch:** The `keywordIndex` prop was passed but not used in deletion logic
2. **ID Mismatch:** Keywords may not have unique IDs, causing deletion to target wrong item
3. **Array Filtering Issue:** The filter logic removed wrong item due to ID/text comparison
4. **React Key Issue:** Using index for React keys may cause component mismatch

---

## ✅ Fix Implementation

### Changes Made:

1. **Store Interface (`campaignPreviewStore.ts`):**
   - Changed `deleteKeyword` signature from `(keywordId: string, adGroupId: string)` to `(adGroupId: string, keywordIndex: number)`

2. **Store Implementation (`campaignPreviewStore.ts`):**
   - Switched from ID/text-based filtering to index-based deletion
   - Uses `splice(keywordIndex, 1)` to remove item at correct index
   - Added bounds checking to ensure `keywordIndex` is valid

3. **KeywordRow Component (`KeywordRow.tsx`):**
   - Updated `handleDelete` to pass `keywordIndex` instead of `keywordId`
   - Uses the `keywordIndex` prop that was already available but unused

### Why This Fixes the Bug:

- **Before:** Used ID/text comparison which could match wrong item or fail if IDs weren't unique
- **After:** Uses array index which directly targets the correct item

---

## 📝 Test Results Template

```
Test Date: __________
Tester: __________

Test Scenario 1 (Delete Middle Keyword):
- Result: [ ] PASS [ ] FAIL
- Notes: __________

Test Scenario 2 (Delete First Keyword):
- Result: [ ] PASS [ ] FAIL
- Notes: __________

Test Scenario 3 (Delete Last Keyword):
- Result: [ ] PASS [ ] FAIL
- Notes: __________

Test Scenario 4 (Delete Multiple Keywords):
- Result: [ ] PASS [ ] FAIL
- Notes: __________

Test Scenario 5 (Delete with Duplicate Text):
- Result: [ ] PASS [ ] FAIL
- Notes: __________

Overall Result: [ ] PASS [ ] FAIL
```

---

## 🎯 Expected Outcome

After testing, you should be able to:
- ✅ Delete any keyword and have the correct one removed
- ✅ Delete keywords in any order without issues
- ✅ Delete keywords at any position (first, middle, last)
- ✅ Have confidence that keyword deletion works reliably

---

**Ready to test!** Open http://localhost:5173 and follow the test scenarios above.

