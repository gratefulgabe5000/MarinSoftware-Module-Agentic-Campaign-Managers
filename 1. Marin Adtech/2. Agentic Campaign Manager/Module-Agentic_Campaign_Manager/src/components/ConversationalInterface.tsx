import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ExamplePrompts from './ExamplePrompts';
import CampaignPlanActions from './CampaignPlanActions';
import { Message } from '../types/message.types';
import { useConversationStore } from '../store/conversationStore';
import { useCampaignStore } from '../store/campaignStore';
import { aiService } from '../services/aiService';

/**
 * ConversationalInterface Component
 * Main component for the conversational interface
 */
const ConversationalInterface: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get state and actions from store
  const messages = useConversationStore((state) => state.messages);
  const isLoading = useConversationStore((state) => state.isLoading);
  const error = useConversationStore((state) => state.error);
  const addMessage = useConversationStore((state) => state.addMessage);
  const setLoading = useConversationStore((state) => state.setLoading);
  const setError = useConversationStore((state) => state.setError);
  const clearConversation = useConversationStore((state) => state.clearConversation);
  const setMessages = useConversationStore((state) => state.setMessages);
  const setCampaignPlan = useCampaignStore((state) => state.setCampaignPlan);
  const navigate = useNavigate();

  const [showExamples, setShowExamples] = React.useState(true);

  /**
   * Scroll to bottom when new messages are added
   */
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  /**
   * Hide examples when first message is sent
   */
  useEffect(() => {
    if (messages.length > 0) {
      setShowExamples(false);
    }
  }, [messages]);

  /**
   * Handle message submission
   */
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setLoading(true);
    setError(null);

    // Add placeholder assistant message
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    addMessage(assistantMessage);

    try {
      // Get conversation history for context
      const currentMessages = useConversationStore.getState().messages;
      const conversationHistory = currentMessages
        .filter((msg) => msg.id !== assistantMessage.id)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Call AI service to understand goal
      const response = await aiService.understandGoal({
        message: content.trim(),
        conversationHistory,
      });

      // Build response message
      let responseContent = '';

      responseContent += `I've analyzed your campaign goal. Here's what I understand:\n\n`;
      responseContent += `**Objective:** ${response.campaignPlan.objective}\n\n`;
      
      if (response.campaignPlan.targetAudience.demographics || response.campaignPlan.targetAudience.psychographics) {
        responseContent += `**Target Audience:** `;
        if (response.campaignPlan.targetAudience.demographics) {
          const demo = response.campaignPlan.targetAudience.demographics;
          responseContent += `${demo.age || 'Any age'}, ${demo.location || 'Any location'}`;
          if (demo.interests && demo.interests.length > 0) {
            responseContent += ` interested in ${demo.interests.join(', ')}`;
          }
        }
        responseContent += `\n\n`;
      }

      responseContent += `**Budget:** ${response.campaignPlan.budget.currency} ${response.campaignPlan.budget.total}`;
      if (response.campaignPlan.budget.daily) {
        responseContent += ` (${response.campaignPlan.budget.currency} ${response.campaignPlan.budget.daily} per day)`;
      }
      responseContent += `\n\n`;

      responseContent += `**Timeline:** Starting ${response.campaignPlan.timeline.startDate} for ${response.campaignPlan.timeline.duration} days\n\n`;

      responseContent += `**Platforms:** ${response.campaignPlan.platforms.join(', ')}\n\n`;

      responseContent += `**Primary KPI:** ${response.campaignPlan.kpis.primary}\n\n`;

      if (response.clarifyingQuestions && response.clarifyingQuestions.length > 0) {
        responseContent += `I have a few questions to better understand your needs:\n\n`;
        response.clarifyingQuestions.forEach((q) => {
          responseContent += `- ${q.question}\n`;
        });
        responseContent += `\nPlease answer these questions so I can create a more accurate campaign plan.`;
      } else {
        responseContent += `Great! I've created a campaign plan for you. Use the buttons below to view the preview or create the campaign.`;
        
        // Store campaign plan in store with mock data flag
        setCampaignPlan(response.campaignPlan, response.isMockData || false);
      }

      // Get current messages from store and update assistant message
      const updatedMessages = useConversationStore.getState().messages.map((msg) =>
        msg.id === assistantMessage.id
          ? {
              ...msg,
              content: responseContent,
              isLoading: false,
              hasCampaignPlan: !response.clarifyingQuestions || response.clarifyingQuestions.length === 0,
              isMockData: response.isMockData || false,
            }
          : msg
      );
      
      // Replace messages with updated version
      setMessages(updatedMessages);
    } catch (error) {
      // Get current messages from store and update assistant message with error
      const currentMessages = useConversationStore.getState().messages;
      const updatedMessages = currentMessages.map((msg) =>
        msg.id === assistantMessage.id
          ? {
              ...msg,
              content: `Error: ${error instanceof Error ? error.message : 'Failed to get AI response'}`,
              isLoading: false,
            }
          : msg
      );
      
      setMessages(updatedMessages);
      setError(error instanceof Error ? error.message : 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle example prompt selection
   */
  const handleExamplePrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  /**
   * Clear conversation
   */
  const handleClearConversation = () => {
    clearConversation();
    setShowExamples(true);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Create Your Campaign</h2>
          <p className="text-muted-foreground">Describe your campaign goals and I'll help you create it</p>
          {messages.length > 0 && (
            <button
              onClick={handleClearConversation}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Clear Conversation
            </button>
          )}
        </div>

        <div className="space-y-6">
          {showExamples && messages.length === 0 && (
            <ExamplePrompts onSelectPrompt={handleExamplePrompt} />
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <span className="text-sm text-destructive">⚠️ {error}</span>
            </div>
          )}

          <MessageList messages={messages} />
          <div ref={messagesEndRef} />

          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ConversationalInterface;

