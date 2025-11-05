import React from 'react';
import { Message } from '../types/message.types';
import CampaignPlanActions from './CampaignPlanActions';

/**
 * MessageList Component Props
 */
interface MessageListProps {
  messages: Message[];
}

/**
 * MessageList Component
 * Displays list of messages in the conversation
 */
const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="message-list empty">
        <p>No messages yet. Start a conversation to begin creating your campaign.</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message message-${message.role}`}
        >
          <div className="message-content">
            {message.isLoading ? (
              <div className="message-loading">
                <span className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <span className="loading-text">Thinking...</span>
              </div>
            ) : (
              <>
                {message.isMockData && (
                  <div className="mock-data-badge">
                    <span className="badge-icon">⚠️</span>
                    <span className="badge-text">Mock Data - Simulated Response</span>
                  </div>
                )}
                <div className="message-text">{message.content}</div>
                {(message as any).hasCampaignPlan && (
                  <div className="message-actions">
                    <CampaignPlanActions />
                  </div>
                )}
              </>
            )}
          </div>
          <div className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;

