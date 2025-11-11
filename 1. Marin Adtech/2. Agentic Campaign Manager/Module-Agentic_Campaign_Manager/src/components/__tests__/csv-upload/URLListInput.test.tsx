import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import URLListInput from '../../csv-upload/URLListInput';
import { productService } from '../../../services/productService';

// Mock the product service
jest.mock('../../../services/productService');
const mockedProductService = productService as jest.Mocked<typeof productService>;

describe('URLListInput', () => {
  const mockOnParseComplete = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<URLListInput onParseComplete={mockOnParseComplete} onError={mockOnError} />);

    expect(screen.getByLabelText(/URLs/i)).toBeInTheDocument();
    expect(screen.getByText(/Parse URLs/i)).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(<URLListInput onParseComplete={mockOnParseComplete} onError={mockOnError} />);

    const textarea = screen.getByLabelText(/URLs/i);
    expect(textarea).toHaveAttribute('placeholder');
  });

  it('updates character count on input', async () => {
    const user = userEvent.setup();
    render(<URLListInput onParseComplete={mockOnParseComplete} onError={mockOnError} />);

    const textarea = screen.getByLabelText(/URLs/i);
    await user.type(textarea, 'https://example.com');

    expect(screen.getByText(/characters/i)).toBeInTheDocument();
  });

  it('disables parse button when textarea is empty', () => {
    render(<URLListInput onParseComplete={mockOnParseComplete} onError={mockOnError} />);

    const parseButton = screen.getByText(/Parse URLs/i);
    expect(parseButton).toBeDisabled();
  });

  it('enables parse button when URLs are entered', async () => {
    const user = userEvent.setup();
    render(<URLListInput onParseComplete={mockOnParseComplete} onError={mockOnError} />);

    const textarea = screen.getByLabelText(/URLs/i);
    await user.type(textarea, 'https://example.com');

    const parseButton = screen.getByText(/Parse URLs/i);
    expect(parseButton).not.toBeDisabled();
  });

  it('handles successful URL parsing', async () => {
    const user = userEvent.setup();
    const mockResult = {
      products: [
        {
          id: 'prod_1',
          name: 'Product 1',
          url: 'https://example.com/product1',
          source: 'url_list' as const,
        },
      ],
      errors: [],
      warnings: [],
    };

    mockedProductService.parseURLs.mockResolvedValue(mockResult);

    render(<URLListInput onParseComplete={mockOnParseComplete} onError={mockOnError} />);

    const textarea = screen.getByLabelText(/URLs/i);
    await user.type(textarea, 'https://example.com/product1');

    const parseButton = screen.getByText(/Parse URLs/i);
    await user.click(parseButton);

    await waitFor(() => {
      expect(mockedProductService.parseURLs).toHaveBeenCalledWith(['https://example.com/product1']);
      expect(mockOnParseComplete).toHaveBeenCalledWith(mockResult);
    });
  });

  it('handles multiple URLs', async () => {
    const user = userEvent.setup();
    const mockResult = {
      products: [
        { id: 'prod_1', name: 'Product 1', url: 'https://example.com/product1', source: 'url_list' as const },
        { id: 'prod_2', name: 'Product 2', url: 'https://example.com/product2', source: 'url_list' as const },
      ],
      errors: [],
      warnings: [],
    };

    mockedProductService.parseURLs.mockResolvedValue(mockResult);

    render(<URLListInput onParseComplete={mockOnParseComplete} onError={mockOnError} />);

    const textarea = screen.getByLabelText(/URLs/i);
    await user.type(textarea, 'https://example.com/product1\nhttps://example.com/product2');

    const parseButton = screen.getByText(/Parse URLs/i);
    await user.click(parseButton);

    await waitFor(() => {
      expect(mockedProductService.parseURLs).toHaveBeenCalledWith([
        'https://example.com/product1',
        'https://example.com/product2',
      ]);
    });
  });

  it('handles parsing errors', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to parse URLs';
    mockedProductService.parseURLs.mockRejectedValue(new Error(errorMessage));

    render(<URLListInput onParseComplete={mockOnParseComplete} onError={mockOnError} />);

    const textarea = screen.getByLabelText(/URLs/i);
    await user.type(textarea, 'invalid-url');

    const parseButton = screen.getByText(/Parse URLs/i);
    await user.click(parseButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('shows loading state during parsing', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockedProductService.parseURLs.mockReturnValue(promise as any);

    render(<URLListInput onParseComplete={mockOnParseComplete} onError={mockOnError} />);

    const textarea = screen.getByLabelText(/URLs/i);
    await user.type(textarea, 'https://example.com');

    const parseButton = screen.getByText(/Parse URLs/i);
    await user.click(parseButton);

    expect(screen.getByText(/Parsing/i)).toBeInTheDocument();
    expect(parseButton).toBeDisabled();

    // Resolve the promise
    resolvePromise!({
      products: [],
      errors: [],
      warnings: [],
    });

    await waitFor(() => {
      expect(screen.queryByText(/Parsing/i)).not.toBeInTheDocument();
    });
  });

  it('trims whitespace from URLs', async () => {
    const user = userEvent.setup();
    const mockResult = {
      products: [
        { id: 'prod_1', name: 'Product', url: 'https://example.com/product', source: 'url_list' as const },
      ],
      errors: [],
      warnings: [],
    };

    mockedProductService.parseURLs.mockResolvedValue(mockResult);

    render(<URLListInput onParseComplete={mockOnParseComplete} onError={mockOnError} />);

    const textarea = screen.getByLabelText(/URLs/i);
    await user.type(textarea, '  https://example.com/product  ');

    const parseButton = screen.getByText(/Parse URLs/i);
    await user.click(parseButton);

    await waitFor(() => {
      expect(mockedProductService.parseURLs).toHaveBeenCalledWith(['https://example.com/product']);
    });
  });
});

