/**
 * Campaign Preview Store
 * Manages state for campaign preview and editing
 */

import { create } from 'zustand';
import { CampaignPreviewData, PreviewEditOperation, PreviewValidationResult } from '../types/campaign-preview.types';
import { validateCampaignPreview } from '../services/validationService';

/**
 * Campaign Preview Store Interface
 */
interface CampaignPreviewStore {
  // State
  previewData: CampaignPreviewData | null;
  editedPreviewData: CampaignPreviewData | null;
  editHistory: PreviewEditOperation[];
  validationResult: PreviewValidationResult | null;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  currentEditIndex: number; // For undo/redo

  // Actions
  setPreviewData: (data: CampaignPreviewData) => void;
  updateAdGroup: (adGroupId: string, updates: Partial<any>) => void;
  updateKeyword: (keywordId: string, adGroupId: string, updates: Partial<any>) => void;
  updateRSA: (adId: string, adGroupId: string, updates: Partial<any>) => void;
  updateHeadline: (adId: string, adGroupId: string, headlineIndex: number, text: string) => void;
  updateDescription: (adId: string, adGroupId: string, descriptionIndex: number, text: string) => void;
  updateUrl: (adId: string, adGroupId: string, url: string) => void;
  deleteKeyword: (keywordId: string, adGroupId: string) => void;
  deleteRSA: (adId: string, adGroupId: string) => void;
  addHeadline: (adId: string, adGroupId: string, text: string) => void;
  addDescription: (adId: string, adGroupId: string, text: string) => void;
  deleteHeadline: (adId: string, adGroupId: string, headlineIndex: number) => void;
  deleteDescription: (adId: string, adGroupId: string, descriptionIndex: number) => void;
  validateCampaign: () => PreviewValidationResult;
  saveDraft: () => void;
  reset: () => void;
  undo: () => void;
  redo: () => void;
}

/**
 * Campaign Preview Store
 */
export const useCampaignPreviewStore = create<CampaignPreviewStore>((set, get) => ({
  // Initial state
  previewData: null,
  editedPreviewData: null,
  editHistory: [],
  validationResult: null,
  isEditing: false,
  hasUnsavedChanges: false,
  currentEditIndex: -1,

  // Set preview data
  setPreviewData: (data: CampaignPreviewData) => {
    set({
      previewData: data,
      editedPreviewData: JSON.parse(JSON.stringify(data)), // Deep copy
      editHistory: [],
      validationResult: null,
      isEditing: false,
      hasUnsavedChanges: false,
      currentEditIndex: -1,
    });
  },

  // Update ad group
  updateAdGroup: (adGroupId: string, updates: Partial<any>) => {
    const state = get();
    if (!state.editedPreviewData) return;

    const updatedData = { ...state.editedPreviewData };
    const adGroupIndex = updatedData.adGroups.findIndex((ag) => ag.id === adGroupId);
    if (adGroupIndex !== -1) {
      updatedData.adGroups[adGroupIndex] = {
        ...updatedData.adGroups[adGroupIndex],
        ...updates,
      };
      set({
        editedPreviewData: updatedData,
        hasUnsavedChanges: true,
      });
    }
  },

  // Update keyword
  updateKeyword: (keywordId: string, adGroupId: string, updates: Partial<any>) => {
    const state = get();
    if (!state.editedPreviewData) return;

    const updatedData = { ...state.editedPreviewData };
    const adGroupIndex = updatedData.adGroups.findIndex((ag) => ag.id === adGroupId);
    if (adGroupIndex !== -1) {
      const keywordIndex = updatedData.adGroups[adGroupIndex].keywords.findIndex(
        (kw) => kw.text === keywordId || (kw as any).id === keywordId
      );
      if (keywordIndex !== -1) {
        updatedData.adGroups[adGroupIndex].keywords[keywordIndex] = {
          ...updatedData.adGroups[adGroupIndex].keywords[keywordIndex],
          ...updates,
        };
        set({
          editedPreviewData: updatedData,
          hasUnsavedChanges: true,
        });
      }
    }
  },

  // Update RSA
  updateRSA: (adId: string, adGroupId: string, updates: Partial<any>) => {
    const state = get();
    if (!state.editedPreviewData) return;

    const updatedData = { ...state.editedPreviewData };
    const adGroupIndex = updatedData.adGroups.findIndex((ag) => ag.id === adGroupId);
    if (adGroupIndex !== -1) {
      const adIndex = updatedData.adGroups[adGroupIndex].ads.findIndex(
        (ad) => ad.id === adId
      );
      if (adIndex !== -1) {
        updatedData.adGroups[adGroupIndex].ads[adIndex] = {
          ...updatedData.adGroups[adGroupIndex].ads[adIndex],
          ...updates,
        };
        set({
          editedPreviewData: updatedData,
          hasUnsavedChanges: true,
        });
      }
    }
  },

  // Update headline
  updateHeadline: (adId: string, adGroupId: string, headlineIndex: number, text: string) => {
    const state = get();
    if (!state.editedPreviewData) return;

    const updatedData = { ...state.editedPreviewData };
    const adGroupIndex = updatedData.adGroups.findIndex((ag) => ag.id === adGroupId);
    if (adGroupIndex !== -1) {
      const adIndex = updatedData.adGroups[adGroupIndex].ads.findIndex((ad) => ad.id === adId);
      if (adIndex !== -1 && updatedData.adGroups[adGroupIndex].ads[adIndex].headlines[headlineIndex]) {
        updatedData.adGroups[adGroupIndex].ads[adIndex].headlines[headlineIndex] = {
          ...updatedData.adGroups[adGroupIndex].ads[adIndex].headlines[headlineIndex],
          text,
        };
        set({
          editedPreviewData: updatedData,
          hasUnsavedChanges: true,
        });
      }
    }
  },

  // Update description
  updateDescription: (adId: string, adGroupId: string, descriptionIndex: number, text: string) => {
    const state = get();
    if (!state.editedPreviewData) return;

    const updatedData = { ...state.editedPreviewData };
    const adGroupIndex = updatedData.adGroups.findIndex((ag) => ag.id === adGroupId);
    if (adGroupIndex !== -1) {
      const adIndex = updatedData.adGroups[adGroupIndex].ads.findIndex((ad) => ad.id === adId);
      if (adIndex !== -1 && updatedData.adGroups[adGroupIndex].ads[adIndex].descriptions[descriptionIndex]) {
        updatedData.adGroups[adGroupIndex].ads[adIndex].descriptions[descriptionIndex] = {
          ...updatedData.adGroups[adGroupIndex].ads[adIndex].descriptions[descriptionIndex],
          text,
        };
        set({
          editedPreviewData: updatedData,
          hasUnsavedChanges: true,
        });
      }
    }
  },

  // Update URL
  updateUrl: (adId: string, adGroupId: string, url: string) => {
    const state = get();
    if (!state.editedPreviewData) return;

    const updatedData = { ...state.editedPreviewData };
    const adGroupIndex = updatedData.adGroups.findIndex((ag) => ag.id === adGroupId);
    if (adGroupIndex !== -1) {
      const adIndex = updatedData.adGroups[adGroupIndex].ads.findIndex((ad) => ad.id === adId);
      if (adIndex !== -1) {
        updatedData.adGroups[adGroupIndex].ads[adIndex].finalUrl = url;
        set({
          editedPreviewData: updatedData,
          hasUnsavedChanges: true,
        });
      }
    }
  },

  // Delete keyword
  deleteKeyword: (keywordId: string, adGroupId: string) => {
    const state = get();
    if (!state.editedPreviewData) return;

    const updatedData = { ...state.editedPreviewData };
    const adGroupIndex = updatedData.adGroups.findIndex((ag) => ag.id === adGroupId);
    if (adGroupIndex !== -1) {
      updatedData.adGroups[adGroupIndex].keywords = updatedData.adGroups[adGroupIndex].keywords.filter(
        (kw) => kw.text !== keywordId && (kw as any).id !== keywordId
      );
      updatedData.totalKeywords = updatedData.adGroups.reduce((sum, ag) => sum + ag.keywords.length, 0);
      set({
        editedPreviewData: updatedData,
        hasUnsavedChanges: true,
      });
    }
  },

  // Delete RSA
  deleteRSA: (adId: string, adGroupId: string) => {
    const state = get();
    if (!state.editedPreviewData) return;

    const updatedData = { ...state.editedPreviewData };
    const adGroupIndex = updatedData.adGroups.findIndex((ag) => ag.id === adGroupId);
    if (adGroupIndex !== -1) {
      updatedData.adGroups[adGroupIndex].ads = updatedData.adGroups[adGroupIndex].ads.filter(
        (ad) => ad.id !== adId
      );
      updatedData.totalAds = updatedData.adGroups.reduce((sum, ag) => sum + ag.ads.length, 0);
      set({
        editedPreviewData: updatedData,
        hasUnsavedChanges: true,
      });
    }
  },

  // Add headline
  addHeadline: (adId: string, adGroupId: string, text: string) => {
    const state = get();
    if (!state.editedPreviewData) return;

    const updatedData = { ...state.editedPreviewData };
    const adGroupIndex = updatedData.adGroups.findIndex((ag) => ag.id === adGroupId);
    if (adGroupIndex !== -1) {
      const adIndex = updatedData.adGroups[adGroupIndex].ads.findIndex((ad) => ad.id === adId);
      if (adIndex !== -1) {
        updatedData.adGroups[adGroupIndex].ads[adIndex].headlines.push({
          text,
          pinned: false,
          position: updatedData.adGroups[adGroupIndex].ads[adIndex].headlines.length,
        });
        set({
          editedPreviewData: updatedData,
          hasUnsavedChanges: true,
        });
      }
    }
  },

  // Add description
  addDescription: (adId: string, adGroupId: string, text: string) => {
    const state = get();
    if (!state.editedPreviewData) return;

    const updatedData = { ...state.editedPreviewData };
    const adGroupIndex = updatedData.adGroups.findIndex((ag) => ag.id === adGroupId);
    if (adGroupIndex !== -1) {
      const adIndex = updatedData.adGroups[adGroupIndex].ads.findIndex((ad) => ad.id === adId);
      if (adIndex !== -1) {
        updatedData.adGroups[adGroupIndex].ads[adIndex].descriptions.push({ text });
        set({
          editedPreviewData: updatedData,
          hasUnsavedChanges: true,
        });
      }
    }
  },

  // Delete headline
  deleteHeadline: (adId: string, adGroupId: string, headlineIndex: number) => {
    const state = get();
    if (!state.editedPreviewData) return;

    const updatedData = { ...state.editedPreviewData };
    const adGroupIndex = updatedData.adGroups.findIndex((ag) => ag.id === adGroupId);
    if (adGroupIndex !== -1) {
      const adIndex = updatedData.adGroups[adGroupIndex].ads.findIndex((ad) => ad.id === adId);
      if (adIndex !== -1) {
        updatedData.adGroups[adGroupIndex].ads[adIndex].headlines.splice(headlineIndex, 1);
        set({
          editedPreviewData: updatedData,
          hasUnsavedChanges: true,
        });
      }
    }
  },

  // Delete description
  deleteDescription: (adId: string, adGroupId: string, descriptionIndex: number) => {
    const state = get();
    if (!state.editedPreviewData) return;

    const updatedData = { ...state.editedPreviewData };
    const adGroupIndex = updatedData.adGroups.findIndex((ag) => ag.id === adGroupId);
    if (adGroupIndex !== -1) {
      const adIndex = updatedData.adGroups[adGroupIndex].ads.findIndex((ad) => ad.id === adId);
      if (adIndex !== -1) {
        updatedData.adGroups[adGroupIndex].ads[adIndex].descriptions.splice(descriptionIndex, 1);
        set({
          editedPreviewData: updatedData,
          hasUnsavedChanges: true,
        });
      }
    }
  },

  // Validate campaign
  validateCampaign: () => {
    const state = get();
    if (!state.editedPreviewData) {
      return {
        isValid: false,
        errors: [],
        warnings: [],
      };
    }

    const validationResult = validateCampaignPreview(
      state.editedPreviewData,
      state.editedPreviewData.adGroups
    );

    set({ validationResult });
    return validationResult;
  },

  // Save draft
  saveDraft: () => {
    const state = get();
    if (state.editedPreviewData) {
      set({
        previewData: state.editedPreviewData,
        hasUnsavedChanges: false,
      });
    }
  },

  // Reset
  reset: () => {
    set({
      previewData: null,
      editedPreviewData: null,
      editHistory: [],
      validationResult: null,
      isEditing: false,
      hasUnsavedChanges: false,
      currentEditIndex: -1,
    });
  },

  // Undo (placeholder - can be implemented with edit history)
  undo: () => {
    // TODO: Implement undo functionality
    console.log('Undo not yet implemented');
  },

  // Redo (placeholder - can be implemented with edit history)
  redo: () => {
    // TODO: Implement redo functionality
    console.log('Redo not yet implemented');
  },
}));

