import { render, screen, fireEvent } from '@testing-library/react';
import DataToggle from '@/components/molecules/data-toggle';

describe('DataToggle', () => {
  test('renders with initial apartamentos state', () => {
    const mockOnToggle = jest.fn();
    render(<DataToggle value="apartamentos" onToggle={mockOnToggle} />);

    expect(screen.getByText('Apartamentos')).toBeInTheDocument();
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  test('renders with initial clientes state', () => {
    const mockOnToggle = jest.fn();
    render(<DataToggle value="clientes" onToggle={mockOnToggle} />);

    expect(screen.getByRole('switch')).toBeChecked();
  });

  test('switches from apartamentos to clientes', () => {
    const mockOnToggle = jest.fn();
    render(<DataToggle value="apartamentos" onToggle={mockOnToggle} />);

    fireEvent.click(screen.getByRole('switch'));
    expect(mockOnToggle).toHaveBeenCalledWith('clientes');
  });

  test('switches from clientes to apartamentos', () => {
    const mockOnToggle = jest.fn();
    render(<DataToggle value="clientes" onToggle={mockOnToggle} />);

    fireEvent.click(screen.getByRole('switch'));
    expect(mockOnToggle).toHaveBeenCalledWith('apartamentos');
  });

  test('has proper accessibility labels', () => {
    const mockOnToggle = jest.fn();
    render(<DataToggle value="apartamentos" onToggle={mockOnToggle} />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAccessibleName();
  });

  test('maintains responsive layout classes', () => {
    const mockOnToggle = jest.fn();
    const { container } = render(<DataToggle value="apartamentos" onToggle={mockOnToggle} />);

    const toggleContainer = container.firstChild;
    expect(toggleContainer).toHaveClass('flex', 'items-center', 'space-x-2');
  });
});