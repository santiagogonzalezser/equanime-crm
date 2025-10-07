import { render, screen, waitFor } from '@testing-library/react';
import SupabaseDashboard from '@/components/organisms/supabase-dashboard';

// Mock the database queries hook
jest.mock('@/lib/database-queries', () => ({
  useApartamentosData: jest.fn(() => ({
    data: [
      {
        id: '1',
        name: 'Apartamento Centro',
        address: 'Calle Principal 123',
        price: 150000,
        status: 'available',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
    ],
    loading: false,
    error: null
  })),
  transformToChartData: jest.fn((data) =>
    data.map((apt: { name: string; price: number; status: string }) => ({
      name: apt.name,
      value: apt.price,
      category: apt.status
    }))
  )
}));

describe('SupabaseDashboard', () => {
  test('renders dashboard title and description', () => {
    render(<SupabaseDashboard />);

    expect(screen.getByText('Dashboard Analytics')).toBeInTheDocument();
    expect(screen.getByText(/Overview of your CRM performance/)).toBeInTheDocument();
  });

  test('displays chart cards with real data', async () => {
    render(<SupabaseDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/apartamentos/i)).toBeInTheDocument();
    });

    // Check for chart containers
    const chartContainers = screen.getAllByTestId(/chart-container/i);
    expect(chartContainers.length).toBeGreaterThan(0);
  });

  test('shows loading state initially', () => {
    // Mock loading state
    jest.doMock('@/lib/database-queries', () => ({
      useApartamentosData: jest.fn(() => ({
        data: [],
        loading: true,
        error: null
      })),
      transformToChartData: jest.fn()
    }));

    render(<SupabaseDashboard />);

    // Should show skeleton or loading indicators
    expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
  });

  test('handles error state gracefully', async () => {
    // Mock error state
    jest.doMock('@/lib/database-queries', () => ({
      useApartamentosData: jest.fn(() => ({
        data: [],
        loading: false,
        error: 'Database connection failed'
      })),
      transformToChartData: jest.fn()
    }));

    render(<SupabaseDashboard />);

    await waitFor(() => {
      // Should handle error gracefully without crashing
      expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
    });
  });

  test('uses CSS grid layout', () => {
    render(<SupabaseDashboard />);

    const gridContainer = screen.getByTestId('dashboard-grid');
    expect(gridContainer).toHaveClass('grid');
  });

  test('is responsive on mobile devices', () => {
    render(<SupabaseDashboard />);

    const gridContainer = screen.getByTestId('dashboard-grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
  });
});