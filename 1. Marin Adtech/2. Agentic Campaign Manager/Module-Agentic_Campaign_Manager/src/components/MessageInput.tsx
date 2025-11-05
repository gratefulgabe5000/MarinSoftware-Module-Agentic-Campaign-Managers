import React, { useState, useRef, useEffect } from 'react';

/**
 * MessageInput Component Props
 */
interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * MessageInput Component
 * Input component for sending messages in the conversational interface
 */
const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-resize textarea based on content
   */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  /**
   * Handle send button click
   */
  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter allows new line
  };

  const isSendDisabled = !message.trim() || isLoading || disabled;

  return (
    <div className="message-input">
      <div className="message-input-wrapper">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe your campaign goals... (Press Enter to send, Shift+Enter for new line)"
          disabled={disabled}
          rows={1}
          className="message-input-textarea"
        />
        <button
          onClick={handleSend}
          disabled={isSendDisabled}
          className="message-input-send-btn"
          aria-label="Send message"
        >
          {isLoading ? (
            <span className="send-btn-loading">...</span>
          ) : (
            <span className="send-btn-icon">→</span>
          )}
        </button>
      </div>
      <div className="message-input-footer">
        <span className="message-input-hint">
          Press Enter to send, Shift+Enter for new line
        </span>
        {message.length > 0 && (
          <span className="message-input-count">{message.length} characters</span>
        )}
      </div>
    </div>
  );
};

export default MessageInput;

