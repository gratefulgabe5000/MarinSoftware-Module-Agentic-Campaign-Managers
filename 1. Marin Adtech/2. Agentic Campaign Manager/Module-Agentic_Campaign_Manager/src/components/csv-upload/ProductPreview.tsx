import React, { useState } from 'react';
import { ProductInput, ProductValidationError } from '../../types/product.types';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XIcon, ExternalLinkIcon, AlertCircleIcon } from 'lucide-react';

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
    if (products.length === 0) {
      onValidationChange(false);
      return;
    }
    const allValid = products.every((p) => {
      const errors = validateProduct(p);
      return errors.length === 0;
    });
    onValidationChange(allValid);
  }, [products, onValidationChange]);

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">
            No products to preview. Upload a CSV or paste URLs to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>Products Preview</CardTitle>
            <Badge variant="secondary">
              {products.length}/10
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            type="button"
            disabled={products.length >= 10}
          >
            <PlusIcon className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Validation Errors</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc pl-4 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>
                    {error.row && `Row ${error.row}: `}
                    {error.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[200px]">URL</TableHead>
                <TableHead className="min-w-[120px]">Category</TableHead>
                <TableHead className="min-w-[100px]">Price</TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead className="min-w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const isEditing = editingId === product.id;
                const productErrors = validationErrors;

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            type="text"
                            value={editValues.name || ''}
                            onChange={(e) =>
                              handleFieldChange('name', e.target.value)
                            }
                            className={productErrors.name ? 'border-destructive' : ''}
                          />
                          {productErrors.name && (
                            <span className="text-xs text-destructive">Required</span>
                          )}
                        </div>
                      ) : (
                        <span className="font-medium">{product.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            type="url"
                            value={editValues.url || ''}
                            onChange={(e) =>
                              handleFieldChange('url', e.target.value)
                            }
                            className={productErrors.url ? 'border-destructive' : ''}
                          />
                          {productErrors.url && (
                            <span className="text-xs text-destructive">Invalid URL</span>
                          )}
                        </div>
                      ) : (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                        >
                          {product.url.length > 40
                            ? `${product.url.substring(0, 40)}...`
                            : product.url}
                          <ExternalLinkIcon className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editValues.category || ''}
                          onChange={(e) =>
                            handleFieldChange('category', e.target.value)
                          }
                        />
                      ) : (
                        <span className="text-muted-foreground">{product.category || '-'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
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
                          className={productErrors.price ? 'border-destructive' : ''}
                        />
                      ) : (
                        <span className="text-muted-foreground">
                          {product.price ? `$${product.price.toFixed(2)}` : '-'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Textarea
                          value={editValues.description || ''}
                          onChange={(e) =>
                            handleFieldChange('description', e.target.value)
                          }
                          rows={2}
                          className="resize-none"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {product.description || '-'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleSave(product.id)}
                            type="button"
                          >
                            <CheckIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            type="button"
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(product)}
                            type="button"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemove(product.id)}
                            type="button"
                            className="text-destructive hover:text-destructive"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPreview;

