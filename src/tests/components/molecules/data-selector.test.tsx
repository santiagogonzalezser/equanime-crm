import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataSelector from '@/components/molecules/data-selector';

// Mock scrollIntoView for Radix UI components
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
});

describe('DataSelector', () => {
  test('renders dropdown with correct options', () => {
    const mockOnToggle = jest.fn();
    render(<DataSelector value="apartamentos" onToggle={mockOnToggle} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Apartamentos')).toBeInTheDocument();
  });

  test('renders with initial apartamentos state', () => {
    const mockOnToggle = jest.fn();
    render(<DataSelector value="apartamentos" onToggle={mockOnToggle} />);

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('data-state', 'closed');
    expect(screen.getByText('Apartamentos')).toBeInTheDocument();
  });

  test('renders with initial clientes state', () => {
    const mockOnToggle = jest.fn();
    render(<DataSelector value="clientes" onToggle={mockOnToggle} />);

    expect(screen.getByText('Clientes')).toBeInTheDocument();
  });

  test('calls onToggle when selection changes to clientes', async () => {
    const mockOnToggle = jest.fn();
    render(<DataSelector value="apartamentos" onToggle={mockOnToggle} />);

    // Click to open dropdown
    fireEvent.click(screen.getByRole('combobox'));

    // Wait for dropdown to open and click Clientes option
    await waitFor(async () => {
      const clientesOption = await screen.findByRole('option', { name: /clientes/i });
      fireEvent.click(clientesOption);
    });

    expect(mockOnToggle).toHaveBeenCalledWith('clientes');
  });

  test('calls onToggle when selection changes to apartamentos', async () => {
    const mockOnToggle = jest.fn();
    render(<DataSelector value="clientes" onToggle={mockOnToggle} />);

    // Click to open dropdown
    fireEvent.click(screen.getByRole('combobox'));

    // Wait for dropdown to open and click Apartamentos option
    await waitFor(async () => {
      const apartamentosOption = await screen.findByRole('option', { name: /apartamentos/i });
      fireEvent.click(apartamentosOption);
    });

    expect(mockOnToggle).toHaveBeenCalledWith('apartamentos');
  });

  test('has proper accessibility attributes', () => {
    const mockOnToggle = jest.fn();
    render(<DataSelector value="apartamentos" onToggle={mockOnToggle} />);

    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveAttribute('aria-controls');
  });

  test('maintains corporate styling classes', () => {
    const mockOnToggle = jest.fn();
    const { container } = render(<DataSelector value="apartamentos" onToggle={mockOnToggle} />);

    const trigger = container.querySelector('[data-radix-collection-item]') || container.firstElementChild;
    expect(trigger).toHaveClass('bg-white');
    expect(trigger).toHaveClass('border-gray-300');
  });

  test('has correct width styling', () => {
    const mockOnToggle = jest.fn();
    const { container } = render(<DataSelector value="apartamentos" onToggle={mockOnToggle} />);

    const trigger = container.querySelector('[data-radix-collection-item]') || container.firstElementChild;
    expect(trigger).toHaveClass('w-48');
  });
});