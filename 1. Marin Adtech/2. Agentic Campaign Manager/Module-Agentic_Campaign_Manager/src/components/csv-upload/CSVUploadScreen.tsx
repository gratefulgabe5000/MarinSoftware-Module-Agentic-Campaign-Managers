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
  };

  const handleError = (error: string) => {
    setErrors([{ field: 'general', message: error }]);
    setProducts([]);
  };

  const handleProductsChange = (updatedProducts: ProductInput[]) => {
    setProducts(updatedProducts);
    // Limit to 10 products for MVP
    if (updatedProducts.length > 10) {
      setProducts(updatedProducts.slice(0, 10));
    }
  };

  const handleValidationChange = (valid: boolean) => {
    setIsValid(valid);
  };

  const handleGenerateCampaign = () => {
    if (!isValid || products.length === 0) {
      return;
    }

    // Navigate to pattern learning screen with products
    navigate('/campaigns/pattern-learning', {
      state: { products },
    });
  };

  return (
    <div className="csv-upload-screen">
      <div className="csv-upload-header">
        <h1>Bulk Campaign Generation</h1>
        <p>Upload a CSV file or paste URLs to generate campaigns for multiple products</p>
      </div>

      <div className="csv-upload-tabs">
        <button
          className={`tab-button ${activeTab === 'csv' ? 'active' : ''}`}
          onClick={() => setActiveTab('csv')}
          type="button"
        >
          Upload CSV
        </button>
        <button
          className={`tab-button ${activeTab === 'urls' ? 'active' : ''}`}
          onClick={() => setActiveTab('urls')}
          type="button"
        >
          Paste URLs
        </button>
      </div>

      <div className="csv-upload-content">
        {activeTab === 'csv' ? (
          <CSVUploadComponent
            onParseComplete={handleParseComplete}
            onError={handleError}
          />
        ) : (
          <URLListInput
            onParseComplete={handleParseComplete}
            onError={handleError}
          />
        )}

        {warnings.length > 0 && (
          <div className="warnings-box">
            <h4>⚠️ Warnings:</h4>
            <ul>
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {products.length > 0 && (
          <div className="products-preview-section">
            <ProductPreview
              products={products}
              errors={errors}
              onProductsChange={handleProductsChange}
              onValidationChange={handleValidationChange}
            />
          </div>
        )}

        <div className="csv-upload-footer">
          <div className="product-count">
            {products.length > 0 && (
              <span>
                {products.length} product{products.length !== 1 ? 's' : ''} ready
                {products.length >= 10 && ' (max reached)'}
              </span>
            )}
          </div>
          <div className="action-buttons">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn btn-primary generate-campaign-button"
              onClick={handleGenerateCampaign}
              disabled={!isValid || products.length === 0}
              type="button"
            >
              Generate Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUploadScreen;

