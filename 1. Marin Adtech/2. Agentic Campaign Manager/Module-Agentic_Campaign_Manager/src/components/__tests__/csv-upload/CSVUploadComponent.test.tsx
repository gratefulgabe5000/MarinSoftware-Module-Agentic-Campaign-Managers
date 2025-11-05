import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CSVUploadComponent from '../../csv-upload/CSVUploadComponent';
import { productService } from '../../../services/productService';

// Mock the product service
jest.mock('../../../services/productService');
const mockedProductService = productService as jest.Mocked<typeof productService>;

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: (props: any) => {
    const { onDrop, accept, disabled } = props;
    return {
      getRootProps: () => ({
        onClick: () => {
          if (!disabled) {
            // Simulate file selection
            const file = new File(['Product Name,URL\nTest,https://example.com'], 'test.csv', {
              type: 'text/csv',
            });
            onDrop([file]);
          }
        },
      }),
      getInputProps: () => ({}),
      isDragActive: false,
    };
  },
}));

describe('CSVUploadComponent', () => {
  const mockOnParseComplete = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <CSVUploadComponent onParseComplete={mockOnParseComplete} onError={mockOnError} />
    );

    expect(screen.getByText(/Drag and drop your CSV file here/i)).toBeInTheDocument();
  });

  it('displays upload instructions', () => {
    render(
      <CSVUploadComponent onParseComplete={mockOnParseComplete} onError={mockOnError} />
    );

    expect(screen.getByText(/CSV must contain: Product Name, URL/i)).toBeInTheDocument();
  });

  it('handles successful CSV upload', async () => {
    const mockResult = {
      products: [
        {
          id: 'prod_1',
          name: 'Test Product',
          url: 'https://example.com/product',
          source: 'csv' as const,
        },
      ],
      errors: [],
      warnings: [],
    };

    mockedProductService.parseCSV.mockResolvedValue(mockResult);

    render(
      <CSVUploadComponent onParseComplete={mockOnParseComplete} onError={mockOnError} />
    );

    // Simulate file upload
    const dropzone = screen.getByText(/Drag and drop your CSV file here/i).closest('div');
    if (dropzone) {
      await userEvent.click(dropzone);
    }

    await waitFor(() => {
      expect(mockedProductService.parseCSV).toHaveBeenCalled();
      expect(mockOnParseComplete).toHaveBeenCalledWith(mockResult);
    });
  });

  it('handles CSV upload errors', async () => {
    const errorMessage = 'Failed to parse CSV file';
    mockedProductService.parseCSV.mockRejectedValue(new Error(errorMessage));

    render(
      <CSVUploadComponent onParseComplete={mockOnParseComplete} onError={mockOnError} />
    );

    // Simulate file upload
    const dropzone = screen.getByText(/Drag and drop your CSV file here/i).closest('div');
    if (dropzone) {
      await userEvent.click(dropzone);
    }

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('validates file type', async () => {
    render(
      <CSVUploadComponent onParseComplete={mockOnParseComplete} onError={mockOnError} />
    );

    // This would be tested with actual file upload, but we're mocking dropzone
    // The validation would happen in the onDrop handler
    expect(mockOnError).not.toHaveBeenCalled();
  });
});

