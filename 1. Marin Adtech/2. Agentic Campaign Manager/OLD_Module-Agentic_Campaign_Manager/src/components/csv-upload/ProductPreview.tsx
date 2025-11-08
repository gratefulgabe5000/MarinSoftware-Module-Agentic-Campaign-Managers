import React, { useState } from 'react';
import { ProductInput, ProductValidationError } from '../../types/product.types';

/**
 * Product Preview Component Props
 */
interface ProductPreviewProps {
  products: ProductInput[];
  errors?: ProductValidationError[];
  onProductsChange: (products: ProductInput[]) => void;
  onValidationChange: (isValid: boolean) => void;
}

/**
 * Product Preview Component
 * Displays parsed products in a table with inline editing
 */
const ProductPreview: React.FC<ProductPreviewProps> = ({
  products,
  errors = [],
  onProductsChange,
  onValidationChange,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ProductInput>>({});
  const [validationErrors, setValidationErrors] = useState<
    { [key: string]: string }
  >({});

  const validateProduct = (product: Partial<ProductInput>): string[] => {
    const errors: string[] = [];

    if (!product.name || product.name.trim().length === 0) {
      errors.push('name');
    }

    if (!product.url || product.url.trim().length === 0) {
      errors.push('url');
    } else {
      try {
        new URL(product.url);
      } catch {
        errors.push('url');
      }
    }

    if (product.price !== undefined && product.price < 0) {
      errors.push('price');
    }

    return errors;
  };

  const handleEdit = (product: ProductInput) => {
    setEditingId(product.id);
    setEditValues({ ...product });
    setValidationErrors({});
  };

  const handleSave = (id: string) => {
    const errors = validateProduct(editValues);
    if (errors.length > 0) {
      const errorMap: { [key: string]: string } = {};
      errors.forEach((field) => {
        errorMap[field] = 'Invalid value';
      });
      setValidationErrors(errorMap);
      return;
    }

    const updatedProducts = products.map((p) =>
      p.id === id ? { ...p, ...editValues } : p
    );
    onProductsChange(updatedProducts);
    setEditingId(null);
    setEditValues({});
    setValidationErrors({});
    onValidationChange(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
    setValidationErrors({});
  };

  const handleRemove = (id: string) => {
    const updatedProducts = products.filter((p) => p.id !== id);
    onProductsChange(updatedProducts);
  };

  const handleAdd = () => {
    const newProduct: ProductInput = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      url: '',
      source: products[0]?.source || 'csv',
    };
    onProductsChange([...products, newProduct]);
    handleEdit(newProduct);
  };

  const handleFieldChange = (field: keyof ProductInput, value: any) => {
    setEditValues({ ...editValues, [field]: value });
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  // Check if all products are valid
  React.useEffect(() => {
    const allValid = products.every((p) => validateProduct(p).length === 0);
    onValidationChange(allValid && products.length > 0);
  }, [products, onValidationChange]);

  if (products.length === 0) {
    return (
      <div className="product-preview-empty">
        <p>No products to preview. Upload a CSV or paste URLs to get started.</p>
      </div>
    );
  }

  return (
    <div className="product-preview">
      <div className="product-preview-header">
        <h3>Products Preview ({products.length}/10)</h3>
        <button
          className="btn btn-secondary add-product-button"
          onClick={handleAdd}
          type="button"
          disabled={products.length >= 10}
        >
          + Add Product
        </button>
      </div>

      {errors.length > 0 && (
        <div className="product-preview-errors">
          <h4>Errors:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>
                {error.row && `Row ${error.row}: `}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="product-preview-table-container">
        <table className="product-preview-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>URL</th>
              <th>Category</th>
              <th>Price</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isEditing = editingId === product.id;
              const productErrors = validationErrors;

              return (
                <tr key={product.id} className={isEditing ? 'editing' : ''}>
                  <td>
                    {isEditing ? (
                      <div className="editable-field">
                        <input
                          type="text"
                          value={editValues.name || ''}
                          onChange={(e) =>
                            handleFieldChange('name', e.target.value)
                          }
                          className={
                            productErrors.name ? 'field-error' : ''
                          }
                        />
                        {productErrors.name && (
                          <span className="error-message">Required</span>
                        )}
                      </div>
                    ) : (
                      product.name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="editable-field">
                        <input
                          type="url"
                          value={editValues.url || ''}
                          onChange={(e) =>
                            handleFieldChange('url', e.target.value)
                          }
                          className={
                            productErrors.url ? 'field-error' : ''
                          }
                        />
                        {productErrors.url && (
                          <span className="error-message">Invalid URL</span>
                        )}
                      </div>
                    ) : (
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="product-url-link"
                      >
                        {product.url}
                      </a>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValues.category || ''}
                        onChange={(e) =>
                          handleFieldChange('category', e.target.value)
                        }
                      />
                    ) : (
                      product.category || '-'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editValues.price || ''}
                        onChange={(e) =>
                          handleFieldChange(
                            'price',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={
                          productErrors.price ? 'field-error' : ''
                        }
                      />
                    ) : (
                      product.price ? `$${product.price.toFixed(2)}` : '-'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <textarea
                        value={editValues.description || ''}
                        onChange={(e) =>
                          handleFieldChange('description', e.target.value)
                        }
                        rows={2}
                      />
                    ) : (
                      product.description || '-'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="edit-actions">
                        <button
                          className="btn btn-small btn-primary"
                          onClick={() => handleSave(product.id)}
                          type="button"
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={handleCancel}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="row-actions">
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => handleEdit(product)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleRemove(product.id)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductPreview;

