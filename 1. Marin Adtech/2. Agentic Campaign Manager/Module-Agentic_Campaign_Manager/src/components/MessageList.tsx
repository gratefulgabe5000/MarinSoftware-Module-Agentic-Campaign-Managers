import React from 'react';
import { Message } from '../types/message.types';

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
              <div className="message-text">{message.content}</div>
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

