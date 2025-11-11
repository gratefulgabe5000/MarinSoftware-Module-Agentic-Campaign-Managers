import { create } from 'zustand';
import { Message, ConversationState } from '../types/message.types';
import {
  saveConversation,
  loadConversation,
  clearConversation,
} from '../utils/indexedDB';

/**
 * Conversation Store Interface
 */
interface ConversationStore extends ConversationState {
  // Actions
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearConversation: () => void;
  loadConversationFromDB: (conversationId: string) => Promise<void>;
  saveConversationToDB: () => Promise<void>;
  
  // Selectors (computed values)
  getMessages: () => Message[];
  getLastMessage: () => Message | null;
  getLoadingState: () => boolean;
  hasError: () => boolean;
}

/**
 * Generate a unique conversation ID
 */
const generateConversationId = (): string => {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Conversation Store
 * Manages conversation state using Zustand
 */
export const useConversationStore = create<ConversationStore>((set, get) => ({
  // Initial state
  messages: [],
  isLoading: false,
  error: null,
  conversationId: null,

  // Actions
  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
    
    // Auto-save to IndexedDB after adding message
    get().saveConversationToDB().catch(console.error);
  },

  setMessages: (messages: Message[]) => {
    set({ messages });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearConversation: () => {
    const conversationId = get().conversationId;
    
    set({
      messages: [],
      isLoading: false,
      error: null,
      conversationId: null,
    });

    // Clear from IndexedDB if conversation ID exists
    if (conversationId) {
      clearConversation(conversationId).catch(console.error);
    }
  },

  loadConversationFromDB: async (conversationId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const messages = await loadConversation(conversationId);
      
      if (messages) {
        // Convert timestamp strings back to Date objects
        const parsedMessages = messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        
        set({
          messages: parsedMessages,
          conversationId,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: 'Conversation not found',
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load conversation',
      });
    }
  },

  saveConversationToDB: async () => {
    try {
      const state = get();
      let conversationId = state.conversationId;

      // Generate conversation ID if it doesn't exist
      if (!conversationId) {
        conversationId = generateConversationId();
        set({ conversationId });
      }

      // Convert messages to serializable format
      const serializableMessages = state.messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      }));

      await saveConversation(conversationId, serializableMessages);
    } catch (error) {
      console.error('Failed to save conversation to IndexedDB:', error);
      // Don't throw error - just log it, as persistence is not critical
    }
  },

  // Selectors
  getMessages: () => {
    return get().messages;
  },

  getLastMessage: () => {
    const messages = get().messages;
    return messages.length > 0 ? messages[messages.length - 1] : null;
  },

  getLoadingState: () => {
    return get().isLoading;
  },

  hasError: () => {
    return get().error !== null;
  },
}));

