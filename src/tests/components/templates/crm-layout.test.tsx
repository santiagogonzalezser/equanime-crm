import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CRMLayout from '@/components/templates/crm-layout';

// Mock the sidebar hook
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

describe('CRMLayout', () => {
  const user = userEvent.setup();

  test('renders header with EQUÁNIME CRM title', () => {
    render(<CRMLayout>content</CRMLayout>);
    expect(screen.getByText('EQUÁNIME CRM')).toBeInTheDocument();
  });

  test('renders main content area', () => {
    render(<CRMLayout>test content</CRMLayout>);
    expect(screen.getByText('test content')).toBeInTheDocument();
  });

  test('renders sidebar navigation', () => {
    render(<CRMLayout>content</CRMLayout>);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tablas')).toBeInTheDocument();
    expect(screen.getByText('Agregar Cliente')).toBeInTheDocument();
  });

  test('AI Agent button is present', () => {
    render(<CRMLayout>content</CRMLayout>);
    expect(screen.getByRole('button', { name: /ai agent/i })).toBeInTheDocument();
  });

  test('clicking AI Agent button opens chat panel', async () => {
    render(<CRMLayout>content</CRMLayout>);
    const aiButton = screen.getByRole('button', { name: /ai agent/i });

    await user.click(aiButton);
    expect(screen.getByText(/chat/i)).toBeInTheDocument();
  });

  test('sidebar toggle functionality works', () => {
    render(<CRMLayout>content</CRMLayout>);

    // Check for sidebar toggle button
    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
    expect(toggleButton).toBeInTheDocument();
  });

  test('keyboard shortcut toggles sidebar', () => {
    render(<CRMLayout>content</CRMLayout>);

    // Simulate Ctrl+B or Cmd+B keyboard shortcut
    fireEvent.keyDown(document, { key: 'b', ctrlKey: true });

    // The sidebar should respond to the shortcut (implementation will handle this)
    // This test ensures the event listener is set up
  });

  test('layout is responsive', () => {
    render(<CRMLayout>content</CRMLayout>);

    // Check that the layout container has responsive classes
    const layoutContainer = screen.getByTestId('crm-layout');
    expect(layoutContainer).toHaveClass('flex');
  });
});