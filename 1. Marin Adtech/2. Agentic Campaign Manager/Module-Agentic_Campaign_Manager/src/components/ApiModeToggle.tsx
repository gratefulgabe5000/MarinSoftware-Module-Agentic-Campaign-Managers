import React from 'react';
import { useApiModeStore } from '../store/apiModeStore';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { InfoIcon } from 'lucide-react';
import { toast } from 'sonner';

/**
 * API Mode Toggle Component
 * Allows users to switch between Zilkr Dispatcher and Direct Google Ads API
 */
const ApiModeToggle: React.FC = () => {
  const useZilkr = useApiModeStore((state) => state.useZilkrDispatcher);
  const setUseZilkr = useApiModeStore((state) => state.setUseZilkrDispatcher);

  const handleToggle = () => {
    const newValue = !useZilkr;
    setUseZilkr(newValue);
    toast.success(
      `Switched to ${newValue ? 'Zilkr Dispatcher' : 'Direct Google Ads API'}`,
      {
        description: 'This setting will be used for all campaign operations.',
      }
    );
  };

  return (
    <div className="flex items-center gap-3 p-2 border rounded-lg bg-background">
      <div className="flex items-center gap-2">
        <Label htmlFor="api-mode-toggle" className="text-sm font-medium">
          API Mode:
        </Label>
        <Button
          id="api-mode-toggle"
          variant={useZilkr ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggle}
          aria-label="Toggle API mode"
          className="min-w-[80px]"
        >
          {useZilkr ? 'Zilkr' : 'Direct'}
        </Button>
      </div>
      <Badge 
        variant={useZilkr ? 'default' : 'secondary'}
        className="text-xs"
      >
        {useZilkr ? 'Zilkr Dispatcher' : 'Direct Google Ads'}
      </Badge>
      <div
        className="relative group"
        title={
          useZilkr 
            ? 'Using Zilkr Dispatcher for campaign operations. Switch to Direct Google Ads API for direct integration.'
            : 'Using Direct Google Ads API for campaign operations. Switch to Zilkr Dispatcher for managed integration.'
        }
      >
        <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
      </div>
    </div>
  );
};

export default ApiModeToggle;

