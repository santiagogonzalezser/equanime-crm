import { render, screen } from '@testing-library/react';
import ChartCard from '@/components/atoms/chart-card';

// Mock recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));


describe('ChartCard', () => {
  test('renders chart container with title', () => {
    render(
      <ChartCard title="Test Chart" description="Test Description">
        <div>Chart Content</div>
      </ChartCard>
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Chart Content')).toBeInTheDocument();
  });

  test('applies respond.io design styling', () => {
    render(
      <ChartCard title="Test Chart">
        <div>Content</div>
      </ChartCard>
    );

    const cardElement = screen.getByRole('region');
    expect(cardElement).toHaveClass('rounded-lg', 'border', 'shadow-sm');
  });

  test('renders without description', () => {
    render(
      <ChartCard title="Test Chart">
        <div>Content</div>
      </ChartCard>
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('has proper accessibility attributes', () => {
    render(
      <ChartCard title="Test Chart" description="Test Description">
        <div>Content</div>
      </ChartCard>
    );

    const card = screen.getByRole('region');
    expect(card).toHaveAttribute('aria-label', 'Test Chart chart');
  });
});