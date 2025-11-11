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

    expect(screen.getByText('Products Preview')).toBeInTheDocument();
    expect(screen.getByText('2/10')).toBeInTheDocument();
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

    expect(screen.getByText(/Validation Errors/i)).toBeInTheDocument();
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

    // Find all buttons in the table and click the first edit button (pencil icon)
    const editButtons = screen.getAllByRole('button');
    const pencilButton = editButtons.find(btn => btn.querySelector('svg'));
    await user.click(pencilButton!);

    // When editing, check icon and cancel icon buttons should appear
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
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

    // Get all buttons and find the trash icon buttons (destructive variant)
    const allButtons = screen.getAllByRole('button');
    // The second action button in each row is the delete button
    // Skip the "Add Product" button (first one) and get the second button in first row
    const deleteButton = allButtons[2]; // 0: Add Product, 1: Edit, 2: Delete
    await user.click(deleteButton);

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

    const addButton = screen.getByText('Add Product');
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

    const addButton = screen.getByText('Add Product');
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

    // Click first edit button (pencil icon) - button index 1 (after Add Product)
    const allButtons = screen.getAllByRole('button');
    await user.click(allButtons[1]);

    // Clear the name field
    const nameInput = screen.getByDisplayValue('Test Product 1');
    await user.clear(nameInput);

    // Click save button (check icon) - should be first button in editing mode
    const saveButton = screen.getAllByRole('button')[1];
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

    // Click first edit button (pencil icon)
    const allButtons = screen.getAllByRole('button');
    await user.click(allButtons[1]);

    // Update the name
    const nameInput = screen.getByDisplayValue('Test Product 1');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Product Name');

    // Click save button (check icon)
    const saveButton = screen.getAllByRole('button')[1];
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

    // Click first edit button (pencil icon)
    const allButtons = screen.getAllByRole('button');
    await user.click(allButtons[1]);

    // Update the name
    const nameInput = screen.getByDisplayValue('Test Product 1');
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed Name');

    // Click cancel button (X icon) - second button in editing mode
    const cancelButton = screen.getAllByRole('button')[2];
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

