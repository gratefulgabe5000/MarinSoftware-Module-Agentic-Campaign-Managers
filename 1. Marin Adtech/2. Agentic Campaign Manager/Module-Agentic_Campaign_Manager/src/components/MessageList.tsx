import React from 'react';
import { Message } from '../types/message.types';
import CampaignPlanActions from './CampaignPlanActions';
import { Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">No messages yet. Start a conversation to begin creating your campaign.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex flex-col gap-2",
            message.role === 'user' && "items-end"
          )}
        >
          <div
            className={cn(
              "rounded-lg px-4 py-3 max-w-[85%]",
              message.role === 'user'
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted"
            )}
          >
            {message.isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            ) : (
              <>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {(message as any).hasCampaignPlan && (
                  <div className="mt-4">
                    <CampaignPlanActions />
                  </div>
                )}
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground px-2">
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

