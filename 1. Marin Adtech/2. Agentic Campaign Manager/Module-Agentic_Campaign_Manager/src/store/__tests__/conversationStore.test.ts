import { useConversationStore } from '../conversationStore';
import { Message } from '../../types/message.types';
import * as indexedDB from '../../utils/indexedDB';

// Mock IndexedDB
jest.mock('../../utils/indexedDB', () => ({
  saveConversation: jest.fn().mockResolvedValue(undefined),
  loadConversation: jest.fn().mockResolvedValue(null),
  clearConversation: jest.fn().mockResolvedValue(undefined),
  clearAllConversations: jest.fn().mockResolvedValue(undefined),
}));

describe('ConversationStore', () => {
  beforeEach(() => {
    // Reset store state
    useConversationStore.setState({
      messages: [],
      isLoading: false,
      error: null,
      conversationId: null,
    });
    jest.clearAllMocks();
  });

  describe('addMessage', () => {
    it('should add a message to the store', () => {
      const message: Message = {
        id: 'test-1',
        role: 'user',
        content: 'Test message',
        timestamp: new Date(),
      };

      useConversationStore.getState().addMessage(message);

      const messages = useConversationStore.getState().getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
    });

    it('should auto-save to IndexedDB when adding message', async () => {
      const message: Message = {
        id: 'test-1',
        role: 'user',
        content: 'Test message',
        timestamp: new Date(),
      };

      useConversationStore.getState().addMessage(message);

      // Wait for async save
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(indexedDB.saveConversation).toHaveBeenCalled();
    });
  });

  describe('setMessages', () => {
    it('should set messages array', () => {
      const messages: Message[] = [
        {
          id: 'test-1',
          role: 'user',
          content: 'Test 1',
          timestamp: new Date(),
        },
        {
          id: 'test-2',
          role: 'assistant',
          content: 'Test 2',
          timestamp: new Date(),
        },
      ];

      useConversationStore.getState().setMessages(messages);

      const storedMessages = useConversationStore.getState().getMessages();
      expect(storedMessages).toHaveLength(2);
      expect(storedMessages).toEqual(messages);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      useConversationStore.getState().setLoading(true);
      expect(useConversationStore.getState().isLoading).toBe(true);

      useConversationStore.getState().setLoading(false);
      expect(useConversationStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      useConversationStore.getState().setError('Test error');
      expect(useConversationStore.getState().hasError()).toBe(true);
      expect(useConversationStore.getState().error).toBe('Test error');

      useConversationStore.getState().setError(null);
      expect(useConversationStore.getState().hasError()).toBe(false);
    });
  });

  describe('clearConversation', () => {
    it('should clear all messages and reset state', () => {
      // Add some messages
      useConversationStore.getState().addMessage({
        id: 'test-1',
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
      });

      useConversationStore.getState().clearConversation();

      expect(useConversationStore.getState().getMessages()).toHaveLength(0);
      expect(useConversationStore.getState().isLoading).toBe(false);
      expect(useConversationStore.getState().error).toBe(null);
      expect(useConversationStore.getState().conversationId).toBe(null);
    });
  });

  describe('getLastMessage', () => {
    it('should return last message when messages exist', () => {
      const messages: Message[] = [
        {
          id: 'test-1',
          role: 'user',
          content: 'First',
          timestamp: new Date(),
        },
        {
          id: 'test-2',
          role: 'assistant',
          content: 'Last',
          timestamp: new Date(),
        },
      ];

      useConversationStore.getState().setMessages(messages);

      const lastMessage = useConversationStore.getState().getLastMessage();
      expect(lastMessage).toEqual(messages[1]);
    });

    it('should return null when no messages', () => {
      const lastMessage = useConversationStore.getState().getLastMessage();
      expect(lastMessage).toBe(null);
    });
  });

  describe('saveConversationToDB', () => {
    it('should save conversation to IndexedDB', async () => {
      const message: Message = {
        id: 'test-1',
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
      };

      useConversationStore.getState().addMessage(message);
      await useConversationStore.getState().saveConversationToDB();

      expect(indexedDB.saveConversation).toHaveBeenCalled();
    });

    it('should generate conversation ID if not exists', async () => {
      const message: Message = {
        id: 'test-1',
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
      };

      useConversationStore.getState().addMessage(message);
      await useConversationStore.getState().saveConversationToDB();

      const conversationId = useConversationStore.getState().conversationId;
      expect(conversationId).toBeTruthy();
      expect(conversationId).toMatch(/^conv-/);
    });
  });

  describe('loadConversationFromDB', () => {
    it('should load conversation from IndexedDB', async () => {
      const mockMessages = [
        {
          id: 'test-1',
          role: 'user',
          content: 'Test',
          timestamp: new Date().toISOString(),
        },
      ];

      (indexedDB.loadConversation as jest.Mock).mockResolvedValue(mockMessages);

      await useConversationStore.getState().loadConversationFromDB('conv-123');

      const messages = useConversationStore.getState().getMessages();
      expect(messages).toHaveLength(1);
      expect(useConversationStore.getState().conversationId).toBe('conv-123');
    });

    it('should handle error when conversation not found', async () => {
      (indexedDB.loadConversation as jest.Mock).mockResolvedValue(null);

      await useConversationStore.getState().loadConversationFromDB('conv-123');

      expect(useConversationStore.getState().error).toBe('Conversation not found');
    });
  });
});

