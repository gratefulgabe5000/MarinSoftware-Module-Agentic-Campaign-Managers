import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ConversationalInterface from '../ConversationalInterface';
import { useConversationStore } from '../../store/conversationStore';
import { aiService } from '../../services/aiService';

// Mock the AI service
jest.mock('../../services/aiService', () => ({
  aiService: {
    understandGoal: jest.fn(),
  },
}));

// Mock the conversation store
jest.mock('../../store/conversationStore', () => {
  const mockFn: any = jest.fn();
  mockFn.getState = jest.fn();
  return {
    useConversationStore: mockFn,
  };
});

describe('ConversationalInterface', () => {
  const mockAddMessage = jest.fn();
  const mockSetLoading = jest.fn();
  const mockSetError = jest.fn();
  const mockClearConversation = jest.fn();
  const mockSetMessages = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const state = {
      messages: [],
      isLoading: false,
      error: null,
      addMessage: mockAddMessage,
      setLoading: mockSetLoading,
      setError: mockSetError,
      clearConversation: mockClearConversation,
      setMessages: mockSetMessages,
    };

    // Mock the hook selector
    (useConversationStore as unknown as any).mockImplementation((selector: any) => {
      return selector ? selector(state) : state;
    });

    // Mock getState for direct store access
    (useConversationStore as unknown as any).getState.mockReturnValue(state);
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <ConversationalInterface />
      </BrowserRouter>
    );
  });

  it('displays header with title', () => {
    render(
      <BrowserRouter>
        <ConversationalInterface />
      </BrowserRouter>
    );

    expect(screen.getByText(/Create Your Campaign/i)).toBeInTheDocument();
  });

  it('displays example prompts when no messages', () => {
    render(
      <BrowserRouter>
        <ConversationalInterface />
      </BrowserRouter>
    );

    expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
  });

  it('hides example prompts when messages exist', () => {
    (useConversationStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        messages: [{ id: '1', role: 'user', content: 'Test', timestamp: new Date() }],
        isLoading: false,
        error: null,
        addMessage: mockAddMessage,
        setLoading: mockSetLoading,
        setError: mockSetError,
        clearConversation: mockClearConversation,
        setMessages: mockSetMessages,
      };
      return selector(state);
    });

    render(
      <BrowserRouter>
        <ConversationalInterface />
      </BrowserRouter>
    );

    expect(screen.queryByText(/Get Started/i)).not.toBeInTheDocument();
  });

  it('displays error message when error exists', () => {
    (useConversationStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        messages: [],
        isLoading: false,
        error: 'Test error',
        addMessage: mockAddMessage,
        setLoading: mockSetLoading,
        setError: mockSetError,
        clearConversation: mockClearConversation,
        setMessages: mockSetMessages,
      };
      return selector(state);
    });

    render(
      <BrowserRouter>
        <ConversationalInterface />
      </BrowserRouter>
    );

    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  it('handles message submission', async () => {
    const mockUnderstandGoal = aiService.understandGoal as jest.Mock;
    mockUnderstandGoal.mockResolvedValue({
      campaignPlan: {
        objective: 'Test objective',
        targetAudience: {},
        budget: { total: 1000, currency: 'USD' },
        timeline: { startDate: '2025-01-01', duration: 30 },
        platforms: ['Google Ads'],
        kpis: { primary: 'Conversions' },
      },
      confidence: 0.8,
      needsClarification: false,
    });

    render(
      <BrowserRouter>
        <ConversationalInterface />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/Describe your campaign goals/i);
    const sendButton = screen.getByLabelText(/Send message/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);
    });

    await waitFor(() => {
      expect(mockAddMessage).toHaveBeenCalled();
      expect(mockSetLoading).toHaveBeenCalledWith(true);
    });
  });
});

