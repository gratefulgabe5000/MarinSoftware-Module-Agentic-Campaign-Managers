import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Spinner } from './ui/spinner';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col gap-2 p-4 border-t border-border bg-background">
      <div className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe your campaign goals... (Press Enter to send, Shift+Enter for new line)"
          disabled={disabled}
          rows={1}
          className="min-h-[40px] max-h-[200px] resize-none"
        />
        <Button
          onClick={handleSend}
          disabled={isSendDisabled}
          aria-label="Send message"
          size="icon"
          className="shrink-0"
        >
          {isLoading ? (
            <Spinner className="size-4" />
          ) : (
            <span className="text-lg">→</span>
          )}
        </Button>
      </div>
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>
          Press Enter to send, Shift+Enter for new line
        </span>
        {message.length > 0 && (
          <span>{message.length} characters</span>
        )}
      </div>
    </div>
  );
};

export default MessageInput;

