import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CSVUploadComponent from './CSVUploadComponent';
import URLListInput from './URLListInput';
import ProductPreview from './ProductPreview';
import {
  ProductInput,
  ProductParsingResult,
  ProductValidationError,
} from '../../types/product.types';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { FileTextIcon, LinkIcon, AlertTriangleIcon, ArrowLeftIcon, SparklesIcon } from 'lucide-react';

/**
 * CSV Upload Screen Component
 * Main screen for CSV/URL-based campaign generation workflow
 */
const CSVUploadScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'csv' | 'urls'>('csv');
  const [products, setProducts] = useState<ProductInput[]>([]);
  const [errors, setErrors] = useState<ProductValidationError[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  const handleParseComplete = (result: ProductParsingResult) => {
    setProducts(result.products);
    setErrors(result.errors);
    setWarnings(result.warnings);
    // Auto-validate products after parsing if no errors
    if (result.products.length > 0 && result.errors.length === 0) {
      setIsValid(true);
    }
  };

  const handleError = (error: string) => {
    setErrors([{ field: 'general', message: error }]);
    setProducts([]);
  };

  const handleClear = () => {
    setProducts([]);
    setErrors([]);
    setWarnings([]);
    setIsValid(false);
  };

  const handleProductsChange = (updatedProducts: ProductInput[]) => {
    // Limit to 10 products for MVP
    const limitedProducts = updatedProducts.length > 10 
      ? updatedProducts.slice(0, 10) 
      : updatedProducts;
    setProducts(limitedProducts);
    // Auto-validate if products are valid
    if (limitedProducts.length > 0) {
      const allValid = limitedProducts.every(p => 
        p.name && p.name.trim().length > 0 && 
        p.url && p.url.trim().length > 0
      );
      if (allValid) {
        setIsValid(true);
      }
    }
  };

  const handleValidationChange = (valid: boolean) => {
    setIsValid(valid);
  };

  const handleGenerateCampaign = () => {
    if (products.length === 0) {
      return;
    }

    // Validate products before navigating
    const validProducts = products.filter(p => 
      p.name && p.name.trim().length > 0 && 
      p.url && p.url.trim().length > 0
    );

    if (validProducts.length === 0) {
      setErrors([{ field: 'general', message: 'Please ensure all products have a name and URL' }]);
      return;
    }

    // Navigate to pattern learning screen with products
    navigate('/campaigns/pattern-learning', {
      state: { products: validProducts },
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/campaigns')}
              type="button"
              className="mb-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Bulk Campaign Generation</h1>
            <p className="text-muted-foreground">
              Upload a CSV file or paste URLs to generate campaigns for multiple products
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'csv' | 'urls')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="csv">
              <FileTextIcon className="h-4 w-4 mr-2" />
              Upload CSV
            </TabsTrigger>
            <TabsTrigger value="urls">
              <LinkIcon className="h-4 w-4 mr-2" />
              Paste URLs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-6">
            <CSVUploadComponent
              onParseComplete={handleParseComplete}
              onError={handleError}
              onClear={handleClear}
            />
          </TabsContent>

          <TabsContent value="urls" className="space-y-6">
            <URLListInput
              onParseComplete={handleParseComplete}
              onError={handleError}
            />
          </TabsContent>
        </Tabs>

        {/* Warnings */}
        {warnings.length > 0 && (
          <Alert>
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Warnings</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc pl-4 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Product Preview */}
        {products.length > 0 && (
          <div className="space-y-4">
            <ProductPreview
              products={products}
              errors={errors}
              onProductsChange={handleProductsChange}
              onValidationChange={handleValidationChange}
            />
          </div>
        )}

        {/* Footer */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              {products.length > 0 && (
                <Badge variant="secondary" className="text-base">
                  {products.length} product{products.length !== 1 ? 's' : ''} ready
                  {products.length >= 10 && ' (max reached)'}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/campaigns')}
                type="button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateCampaign}
                disabled={products.length === 0}
                type="button"
              >
                <SparklesIcon className="h-4 w-4" />
                Generate Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CSVUploadScreen;

