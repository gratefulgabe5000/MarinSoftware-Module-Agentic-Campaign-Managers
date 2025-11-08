import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PatternViewer from './PatternViewer';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ArrowLeftIcon, SparklesIcon, AlertCircleIcon, Loader2Icon, BrainCircuitIcon, PackageIcon } from 'lucide-react';
import { CampaignPatterns } from '../../types/campaign-patterns.types';

/**
 * Pattern Learning Screen Component
 * Main screen for learning patterns from existing campaigns
 */
const PatternLearningScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [accountId] = useState<string>('mock-account-id'); // For MVP, use mock
  const [skipPatternLearning, setSkipPatternLearning] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState<string>('0');
  const [productPatterns, setProductPatterns] = useState<CampaignPatterns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  // Get products from previous step (passed via location state)
  const products = location.state?.products || [];

  // Fetch product-specific patterns for each product
  useEffect(() => {
    const fetchAllProductPatterns = async () => {
      if (products.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch patterns for each product in parallel
        const axios = (await import('axios')).default;
        const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001/api';

        const patternPromises = products.map(async (product: any) => {
          try {
            const response = await axios.get(`${API_BASE_URL}/campaigns/query-patterns`, {
              params: {
                accountId,
                productName: product.name,
              },
              timeout: 30000,
            });

            if (response.data.success) {
              return {
                ...response.data.patterns,
                productId: product.id,
                productName: product.name,
              };
            }
            return null;
          } catch (err) {
            console.error(`Error fetching patterns for ${product.name}:`, err);
            return null;
          }
        });

        const results = await Promise.all(patternPromises);
        const validPatterns = results.filter((p): p is CampaignPatterns => p !== null);

        setProductPatterns(validPatterns);
        setIsMockData(true); // Using mock data for MVP
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product patterns:', err);
        setError('Failed to fetch campaign patterns');
        setLoading(false);
      }
    };

    fetchAllProductPatterns();
  }, [products, accountId]);

  const handleContinue = () => {
    // Navigate to generation screen with products and product-specific patterns
    navigate('/campaigns/generate', {
      state: {
        products,
        productPatterns: productPatterns.length > 0 ? productPatterns : undefined,
      },
    });
  };

  const handleSkip = () => {
    // Navigate to generation with default patterns
    navigate('/campaigns/generate', {
      state: {
        products,
        productPatterns: undefined, // Use defaults
      },
    });
  };

  const refresh = () => {
    // Trigger a re-fetch by forcing useEffect to run again
    setProductPatterns([]);
    setLoading(true);
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

  if (skipPatternLearning || productPatterns.length === 0) {
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
                    refresh();
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
            We've analyzed your existing campaigns and extracted patterns for each product
          </p>
        </div>

        {/* Product tabs for segmented patterns */}
        {products.length > 0 && productPatterns.length > 0 && (
          <Tabs value={activeProductTab} onValueChange={setActiveProductTab}>
            <TabsList className="grid w-full sticky top-0 z-10 bg-background" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}>
              {products.map((product: any, index: number) => (
                <TabsTrigger key={product.id} value={String(index)}>
                  <PackageIcon className="h-4 w-4 mr-2" />
                  <span className="truncate max-w-[150px]">{product.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {productPatterns.map((productPattern: CampaignPatterns, index: number) => (
              <TabsContent key={products[index].id} value={String(index)} className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2 mb-4">
                      <h2 className="text-xl font-semibold">{products[index].name}</h2>
                      {products[index].category && (
                        <p className="text-sm text-muted-foreground">Category: {products[index].category}</p>
                      )}
                      {products[index].url && (
                        <p className="text-sm text-muted-foreground truncate">URL: {products[index].url}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <PatternViewer
                  patterns={productPattern}
                  isMockData={isMockData}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}

        <Card>
          <CardContent className="flex justify-between items-center p-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              type="button"
            >
              Skip & Use Defaults
            </Button>
            <Button
              onClick={handleContinue}
              type="button"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Continue to Generation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatternLearningScreen;

