import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductPreview from '../../csv-upload/ProductPreview';
import { ProductInput } from '../../../types/product.types';

describe('ProductPreview', () => {
  const mockProducts: ProductInput[] = [
    {
      id: 'prod_1',
      name: 'Test Product 1',
      url: 'https://example.com/product1',
      category: 'Electronics',
      price: 99.99,
      description: 'Great product',
      source: 'csv',
    },
    {
      id: 'prod_2',
      name: 'Test Product 2',
      url: 'https://example.com/product2',
      category: 'Books',
      price: 19.99,
      source: 'csv',
    },
  ];

  const mockOnProductsChange = jest.fn();
  const mockOnValidationChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no products', () => {
    render(
      <ProductPreview
        products={[]}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    expect(screen.getByText(/No products to preview/i)).toBeInTheDocument();
  });

  it('renders products table', () => {
    render(
      <ProductPreview
        products={mockProducts}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    expect(screen.getByText('Products Preview (2/10)')).toBeInTheDocument();
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
  });

  it('displays product information correctly', () => {
    render(
      <ProductPreview
        products={mockProducts}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('Great product')).toBeInTheDocument();
  });

  it('displays validation errors', () => {
    const errors = [
      { field: 'name', message: 'Product name is required', row: 1 },
      { field: 'url', message: 'Invalid URL format', row: 2 },
    ];

    render(
      <ProductPreview
        products={mockProducts}
        errors={errors}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    expect(screen.getByText(/Errors:/i)).toBeInTheDocument();
    expect(screen.getByText(/Product name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Invalid URL format/i)).toBeInTheDocument();
  });

  it('allows editing product', async () => {
    const user = userEvent.setup();
    render(
      <ProductPreview
        products={mockProducts}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('allows removing product', async () => {
    const user = userEvent.setup();
    render(
      <ProductPreview
        products={mockProducts}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[0]);

    expect(mockOnProductsChange).toHaveBeenCalledWith([mockProducts[1]]);
  });

  it('allows adding new product', async () => {
    const user = userEvent.setup();
    render(
      <ProductPreview
        products={mockProducts}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    const addButton = screen.getByText('+ Add Product');
    await user.click(addButton);

    expect(mockOnProductsChange).toHaveBeenCalled();
    const callArgs = mockOnProductsChange.mock.calls[0][0];
    expect(callArgs.length).toBe(mockProducts.length + 1);
  });

  it('disables add button when at limit', () => {
    const maxProducts = Array.from({ length: 10 }, (_, i) => ({
      id: `prod_${i + 1}`,
      name: `Product ${i + 1}`,
      url: `https://example.com/product${i + 1}`,
      source: 'csv' as const,
    }));

    render(
      <ProductPreview
        products={maxProducts}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    const addButton = screen.getByText('+ Add Product');
    expect(addButton).toBeDisabled();
  });

  it('validates edited product data', async () => {
    const user = userEvent.setup();
    render(
      <ProductPreview
        products={mockProducts}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    // Clear the name field
    const nameInput = screen.getByDisplayValue('Test Product 1');
    await user.clear(nameInput);

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Required/i)).toBeInTheDocument();
    });

    // Should not call onProductsChange
    expect(mockOnProductsChange).not.toHaveBeenCalled();
  });

  it('saves edited product with valid data', async () => {
    const user = userEvent.setup();
    render(
      <ProductPreview
        products={mockProducts}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    // Update the name
    const nameInput = screen.getByDisplayValue('Test Product 1');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Product Name');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnProductsChange).toHaveBeenCalled();
      const updatedProducts = mockOnProductsChange.mock.calls[0][0];
      expect(updatedProducts[0].name).toBe('Updated Product Name');
    });
  });

  it('cancels editing without saving', async () => {
    const user = userEvent.setup();
    render(
      <ProductPreview
        products={mockProducts}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    // Update the name
    const nameInput = screen.getByDisplayValue('Test Product 1');
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed Name');

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    // Should not call onProductsChange
    expect(mockOnProductsChange).not.toHaveBeenCalled();

    // Should show original name
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
  });

  it('displays URL as clickable link', () => {
    render(
      <ProductPreview
        products={mockProducts}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    const urlLink = screen.getByText('https://example.com/product1');
    expect(urlLink).toHaveAttribute('href', 'https://example.com/product1');
    expect(urlLink).toHaveAttribute('target', '_blank');
  });

  it('displays "-" for missing optional fields', () => {
    const productsWithoutOptional: ProductInput[] = [
      {
        id: 'prod_1',
        name: 'Product',
        url: 'https://example.com/product',
        source: 'csv',
      },
    ];

    render(
      <ProductPreview
        products={productsWithoutOptional}
        onProductsChange={mockOnProductsChange}
        onValidationChange={mockOnValidationChange}
      />
    );

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(0);
  });
});

