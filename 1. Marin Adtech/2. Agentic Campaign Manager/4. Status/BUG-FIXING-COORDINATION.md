# Bug Fixing Coordination Plan
**Date**: November 7, 2025 (2025.11.07)  
**Project**: MarinSoftware Module - Agentic Campaign Manager  
**Status**: Active Bug Fixing - Parallel Work

---

## 🎯 Coordination Strategy

**Approach**: Two developers working from opposite ends to avoid conflicts
- **Collaborator**: Starting from **TOP** (BUG-005) → Working **DOWN**
- **You**: Starting from **BOTTOM** (BUG-020) → Working **UP**
- **Meeting Point**: BUG-012 / BUG-013 (middle of list)

---

## 📋 Open Bugs List (14 Total)

| Bug ID | Title | Priority | Status | Assigned To | Estimated Time |
|--------|-------|----------|--------|-------------|----------------|
| BUG-005 | URLs Not Verified to Exist/Be Reachable During CSV Upload | 🟡 Medium | 🔴 Open | **Collaborator** | 1-2 hours |
| BUG-007 | Campaign Dashboard Enhancement: Hashtags, Tag Filtering, and Batch Actions | 🟡 Medium | 🔴 Open | **Collaborator** | 3-5 hours |
| BUG-008 | Campaign Dashboard Should Filter by Product Category with Batch Actions | 🟡 Medium | 🔴 Open | **Collaborator** | 2-3 hours |
| BUG-010 | Performance Dashboard Header Should Remain Static While Scrolling | 🟡 Medium | 🔴 Open | **Collaborator** | 30-45 min |
| BUG-011 | Performance Dashboard Export CSV Fails | 🟠 High | 🔴 Open | **Collaborator** | 30-60 min |
| BUG-012 | Inline Editing Behavior Issues in Campaign Preview | 🟡 Medium | 🔴 Open | **MEETING POINT** | 1-2 hours |
| BUG-013 | RSA Ad Headlines Display Not Optimized in Campaign Preview | 🟡 Medium | 🔴 Open | **MEETING POINT** | 1-2 hours |
| BUG-014 | Keyword Deletion Deletes Incorrect Item in Campaign Preview | 🟠 High | 🔴 Open | **You** | 1-2 hours |
| BUG-015 | Validation Errors Not Linked to Elements on Page in Campaign Preview | 🟡 Medium | 🔴 Open | **You** | 1-2 hours |
| BUG-016 | Ad Group Name Display Not Updated After Inline Edit | 🟡 Medium | 🔴 Open | **You** | 30-60 min |
| BUG-017 | Export Validation Fails with Empty Errors Array | 🟠 High | 🔴 Open | **You** | 30-60 min |
| BUG-018 | CSV Upload Errors Not Displayed in UI | 🟠 High | 🔴 Open | **You** | 30-60 min |
| BUG-019 | Empty CSV Files Not Detected and Rejected with Error Messages | 🟡 Medium | 🔴 Open | **You** | 30-45 min |
| BUG-020 | Missing Optional Columns Not Validated or Warned About | 🟡 Medium | 🔴 Open | **You** | 30-60 min |

---

## 👥 Work Assignment

### Collaborator's Queue (Top → Down)
1. ✅ **BUG-005** - URLs Not Verified (1-2 hours)
2. ✅ **BUG-007** - Campaign Dashboard Hashtags (3-5 hours)
3. ✅ **BUG-008** - Campaign Dashboard Category Filter (2-3 hours)
4. ✅ **BUG-010** - Performance Dashboard Header Sticky (30-45 min)
5. ✅ **BUG-011** - Performance Dashboard Export CSV (30-60 min)
6. ⚠️ **BUG-012** - Inline Editing Behavior (1-2 hours) - **MEETING POINT**
7. ⚠️ **BUG-013** - RSA Ad Headlines Display (1-2 hours) - **MEETING POINT**

**Total Estimated Time**: 8.5-13.5 hours

### Your Queue (Bottom → Up)
1. ✅ **BUG-020** - Missing Optional Columns Validation (45-60 min)
2. ✅ **BUG-019** - Empty CSV Detection (30-45 min)
3. ✅ **BUG-018** - CSV Upload Errors Not Displayed (30-60 min) - **HIGH PRIORITY**
4. ✅ **BUG-017** - Export Validation Fails (30-60 min) - **HIGH PRIORITY**
5. ✅ **BUG-016** - Ad Group Name Display Not Updated (30-60 min)
6. ✅ **BUG-015** - Validation Errors Not Linked (1-2 hours)
7. ✅ **BUG-014** - Keyword Deletion Deletes Wrong Item (1-2 hours) - **HIGH PRIORITY**
8. ⚠️ **BUG-013** - RSA Ad Headlines Display (1-2 hours) - **MEETING POINT**
9. ⚠️ **BUG-012** - Inline Editing Behavior (1-2 hours) - **MEETING POINT**

**Total Estimated Time**: 5.25-8.5 hours

---

## ⚠️ Conflict Prevention Rules

### Meeting Point Protocol
- **BUG-012** and **BUG-013** are the meeting point
- **Before starting BUG-012 or BUG-013**: Check with the other developer
- **Communication**: Use this document to update status before starting meeting point bugs
- **If one person reaches meeting point first**: Wait or coordinate before proceeding

### File Conflict Prevention
- **Different Areas**: Most bugs touch different files/components
- **Potential Overlaps**:
  - BUG-012 & BUG-014: Both touch `KeywordRow.tsx` and `AdGroupRow.tsx`
  - BUG-015 & BUG-016: Both touch `CampaignPreviewScreen.tsx` and preview components
  - BUG-017 & BUG-018: Both touch CSV/export validation

### Communication Checklist
- [ ] Update this document when starting a bug
- [ ] Update this document when completing a bug
- [ ] Check this document before starting meeting point bugs (BUG-012, BUG-013)
- [ ] Communicate if you need to work on a bug assigned to the other person

---

## 📊 Progress Tracking

### Collaborator's Progress
- [ ] BUG-005 - URLs Not Verified
- [ ] BUG-007 - Campaign Dashboard Hashtags
- [ ] BUG-008 - Campaign Dashboard Category Filter
- [ ] BUG-010 - Performance Dashboard Header Sticky
- [ ] BUG-011 - Performance Dashboard Export CSV
- [ ] BUG-012 - Inline Editing Behavior ⚠️ **MEETING POINT**
- [ ] BUG-013 - RSA Ad Headlines Display ⚠️ **MEETING POINT**

### Your Progress
- [x] BUG-020 - Missing Optional Columns Validation ✅ **COMPLETE**
- [ ] BUG-019 - Empty CSV Detection
- [ ] BUG-018 - CSV Upload Errors Not Displayed 🟠 **HIGH PRIORITY**
- [ ] BUG-017 - Export Validation Fails 🟠 **HIGH PRIORITY**
- [ ] BUG-016 - Ad Group Name Display Not Updated
- [ ] BUG-015 - Validation Errors Not Linked
- [ ] BUG-014 - Keyword Deletion Deletes Wrong Item 🟠 **HIGH PRIORITY**
- [ ] BUG-013 - RSA Ad Headlines Display ⚠️ **MEETING POINT**
- [ ] BUG-012 - Inline Editing Behavior ⚠️ **MEETING POINT**

---

## 🔍 Key Files by Bug

### Collaborator's Bugs
- **BUG-005**: `src/services/productService.ts`, `src/components/csv-upload/CSVUploadComponent.tsx`
- **BUG-007**: `src/components/CampaignDashboard.tsx`, `src/store/campaignStore.ts`
- **BUG-008**: `src/components/CampaignDashboard.tsx`, `src/store/campaignStore.ts`
- **BUG-010**: `src/components/PerformanceDashboard.tsx`
- **BUG-011**: `src/services/performanceService.ts` (line 259)

### Your Bugs
- **BUG-020**: `src/services/productService.ts`, `src/components/csv-upload/CSVUploadScreen.tsx`
- **BUG-019**: `src/services/productService.ts`, `src/components/csv-upload/CSVUploadComponent.tsx`
- **BUG-018**: `src/components/csv-upload/CSVUploadScreen.tsx`, `src/components/csv-upload/CSVUploadComponent.tsx`
- **BUG-017**: Export validation logic (check export service)
- **BUG-016**: `src/components/campaign-preview/AdGroupRow.tsx`, `src/store/campaignPreviewStore.ts`
- **BUG-015**: `src/components/campaign-preview/CampaignPreviewScreen.tsx`, validation components
- **BUG-014**: `src/components/campaign-preview/KeywordRow.tsx`, `src/store/campaignPreviewStore.ts`

### Meeting Point Bugs (Coordinate!)
- **BUG-012**: `src/components/campaign-preview/KeywordRow.tsx`, `src/components/campaign-preview/AdGroupRow.tsx`
- **BUG-013**: `src/components/campaign-preview/AdRow.tsx`, `src/components/campaign-preview/AdCopyEditor.tsx`

---

## 📝 Status Updates

### Last Updated
- **Date**: 2025.11.07
- **Status**: Coordination plan created
- **Next Check-in**: Before starting BUG-012 or BUG-013

### Notes
- Both developers should update this document when starting/completing bugs
- Use Git commits with clear messages: `fix(BUG-XXX): Description`
- Test fixes before marking complete
- Update bug tracker when fixes are complete

---

## ✅ Completion Checklist

When a bug is fixed:
1. [ ] Code changes committed with clear message
2. [ ] Bug tested and verified fixed
3. [ ] Bug tracker updated (status changed to Fixed)
4. [ ] This coordination document updated
5. [ ] Related files documented if needed

---

*Coordination document created: November 7, 2025*  
*Project: MarinSoftware Module - Agentic Campaign Manager*

