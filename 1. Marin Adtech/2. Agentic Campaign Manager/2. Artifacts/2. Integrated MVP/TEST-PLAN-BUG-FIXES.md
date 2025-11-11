# Test Plan: Bug Fixes Verification

**Date**: 2025-11-11  
**Bugs to Test**: BUG-010, BUG-013, BUG-014  
**Status**: Ready for Testing

---

## BUG-010: Performance Dashboard Header Should Remain Static

### Test Steps:
1. Navigate to Performance Dashboard (`/campaigns/:id/performance`)
2. Verify header is visible at the top (title, time range selector, export button, status indicators)
3. Scroll down through performance metrics
4. Verify header remains fixed at the top while scrolling
5. Verify header doesn't overlap content
6. Test on different screen sizes:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

### Expected Results:
- ✅ Header remains visible at the top while scrolling
- ✅ Header doesn't overlap content
- ✅ All header elements (time range selector, export button) remain accessible
- ✅ Works on all screen sizes

### Test Status:
- [ ] Desktop - Header sticky
- [ ] Desktop - No content overlap
- [ ] Desktop - All elements accessible
- [ ] Tablet - Header sticky
- [ ] Tablet - No content overlap
- [ ] Mobile - Header sticky
- [ ] Mobile - No content overlap

---

## BUG-013: RSA Ad Headlines Display Not Optimized

### Test Steps:
1. Navigate to Campaign Preview (`/campaigns/preview`)
2. Expand an ad group to see keywords and ads
3. Expand an RSA Ad row
4. Verify headlines are displayed in a table format with:
   - Column headers: #, Headline, Length, Status, Actions
   - Each headline in a table row
   - Status badges (Empty, Valid, Too Long)
   - Length badges showing character count
   - Delete buttons in Actions column
5. Compare with keyword display format (should be similar)
6. Test with multiple headlines (3, 5, 10, 15)
7. Test adding new headlines
8. Test deleting headlines
9. Test editing headlines inline

### Expected Results:
- ✅ Headlines displayed in organized table format
- ✅ Table structure matches keyword display format
- ✅ Visual consistency with keyword section
- ✅ Easy to scan and compare multiple headlines
- ✅ All functionality (add, edit, delete) works correctly

### Test Status:
- [ ] Table format displayed correctly
- [ ] Headers visible (#, Headline, Length, Status, Actions)
- [ ] Status badges work correctly
- [ ] Length badges show correct counts
- [ ] Delete buttons work
- [ ] Visual consistency with keywords
- [ ] Add headline works
- [ ] Edit headline works
- [ ] Delete headline works
- [ ] Works with 3 headlines
- [ ] Works with 15 headlines

---

## BUG-014: Keyword Deletion Deletes Incorrect Item

### Test Steps:
1. Navigate to Campaign Preview (`/campaigns/preview`)
2. Expand an ad group with multiple keywords
3. **Test Case 1: Delete First Keyword**
   - Note the first keyword text
   - Click delete on the first keyword
   - Confirm deletion
   - Verify the first keyword is deleted (not the second)
   - Verify other keywords remain in correct positions
4. **Test Case 2: Delete Middle Keyword**
   - Note a middle keyword text (e.g., keyword at index 3)
   - Click delete on that keyword
   - Confirm deletion
   - Verify the correct keyword is deleted
   - Verify other keywords remain in correct positions
5. **Test Case 3: Delete Last Keyword**
   - Note the last keyword text
   - Click delete on the last keyword
   - Confirm deletion
   - Verify the last keyword is deleted (not the second-to-last)
   - Verify other keywords remain in correct positions
6. **Test Case 4: Delete with Duplicate Text**
   - Create keywords with same text but different match types
   - Delete one of them
   - Verify only the selected keyword is deleted
7. **Test Case 5: Delete Single Keyword**
   - If only one keyword exists, verify deletion works
   - Verify ad group still exists after deletion

### Expected Results:
- ✅ Correct keyword is deleted (by position/index, not text)
- ✅ Other keywords remain in correct positions
- ✅ No off-by-one errors (deleting index N doesn't delete index N+1)
- ✅ Works with duplicate text (deletes by position, not text)
- ✅ Works with single keyword

### Test Status:
- [ ] Delete first keyword - correct item deleted
- [ ] Delete middle keyword - correct item deleted
- [ ] Delete last keyword - correct item deleted
- [ ] Delete with duplicate text - correct item deleted
- [ ] Delete single keyword - works correctly
- [ ] Other keywords remain in correct positions
- [ ] No off-by-one errors

---

## Code Review: BUG-014 Implementation

### Current Implementation Analysis:

**KeywordRow.tsx (lines 79-112):**
- `handleDelete` function uses complex logic:
  1. First tries to match at expected index
  2. If no match, finds by text and matchType
  3. Falls back to using passed index
- This should work correctly, but the fallback logic might be unnecessary

**campaignPreviewStore.ts (lines 201-220):**
- `deleteKeyword` function uses index-based deletion:
  - Takes `adGroupId` and `keywordIndex`
  - Uses `splice(keywordIndex, 1)` to remove item
  - Has bounds checking
- ✅ This is the correct implementation

### Potential Issues:
- The complex matching logic in `handleDelete` might cause issues if keywords are reordered
- The fallback to text matching could potentially delete wrong item if there are duplicates
- However, the final fallback uses `keywordIndex` which should be correct

### Recommendation:
The implementation looks correct, but we should verify it works in all scenarios. The test cases above will help identify any remaining issues.

---

## Test Execution Checklist

### Pre-Test Setup:
- [ ] Application is running
- [ ] Test data is available (campaigns with keywords and ads)
- [ ] Browser developer tools are open for debugging

### Test Execution:
- [ ] BUG-010: Performance Dashboard Header
- [ ] BUG-013: RSA Headlines Display
- [ ] BUG-014: Keyword Deletion

### Post-Test:
- [ ] Document any issues found
- [ ] Update bug tracker with test results
- [ ] Mark bugs as fixed if all tests pass

---

## Notes

- All three bugs should be tested in the same session for efficiency
- Screenshots/videos can be helpful for documenting test results
- If any test fails, document the exact steps to reproduce

---

**Last Updated**: 2025-11-11  
**Status**: Ready for Testing

