import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCampaignPatterns } from '../../hooks/useCampaignPatterns';
import PatternViewer from './PatternViewer';
import LoadingSpinner from '../LoadingSpinner';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeftIcon, SparklesIcon, AlertCircleIcon, Loader2Icon, BrainCircuitIcon } from 'lucide-react';

/**
 * Pattern Learning Screen Component
 * Main screen for learning patterns from existing campaigns
 */
const PatternLearningScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [accountId] = useState<string>('mock-account-id'); // For MVP, use mock
  const [skipPatternLearning, setSkipPatternLearning] = useState(false);

  // Get products from previous step (passed via location state)
  const products = location.state?.products || [];

  const {
    patterns,
    loading,
    error,
    isMockData,
    fetchPatterns,
    refresh,
  } = useCampaignPatterns(accountId, {
    autoFetch: true,
  });

  const handleContinue = () => {
    // Navigate to generation screen with products and patterns
    navigate('/campaigns/generate', {
      state: {
        products,
        patterns: patterns || undefined,
      },
    });
  };

  const handleSkip = () => {
    // Navigate to generation with default patterns
    navigate('/campaigns/generate', {
      state: {
        products,
        patterns: undefined, // Use defaults
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-5xl">
          <Card className="border-none shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="rounded-full bg-primary/10 p-6">
                <BrainCircuitIcon className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Learning from Your Campaigns</h2>
                <p className="text-muted-foreground">Analyzing patterns to optimize your new campaigns</p>
              </div>
              <div className="space-y-3 w-full max-w-md">
                <div className="flex items-center gap-3">
                  <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Querying existing campaigns...</p>
                </div>
                <div className="flex items-center gap-3">
                  <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Extracting patterns...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/campaigns/csv-upload')}
            type="button"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>

          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Error Loading Patterns</h3>
                  <p className="text-sm">{error}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refresh}
                    type="button"
                  >
                    Retry
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSkip}
                    type="button"
                  >
                    Skip & Use Defaults
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (skipPatternLearning || !patterns) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/campaigns/csv-upload')}
            type="button"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Using Default Patterns</h2>
                <p className="text-muted-foreground">
                  You can proceed with default patterns or go back to learn from your campaigns.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSkipPatternLearning(false);
                    fetchPatterns();
                  }}
                  type="button"
                >
                  Learn from Campaigns
                </Button>
                <Button
                  onClick={handleContinue}
                  type="button"
                >
                  <SparklesIcon className="h-4 w-4" />
                  Continue with Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/campaigns/csv-upload')}
            type="button"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Pattern Learning</h1>
          <p className="text-muted-foreground">
            We've analyzed your existing campaigns and extracted these patterns
          </p>
        </div>

        <PatternViewer patterns={patterns} isMockData={isMockData} onContinue={handleContinue} />

        <Card>
          <CardContent className="flex justify-center items-center p-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              type="button"
            >
              Skip & Use Defaults
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatternLearningScreen;

