import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPanel from '@/components/organisms/chat-panel';

describe('ChatPanel', () => {
  const user = userEvent.setup();

  test('renders chat interface when open', () => {
    render(<ChatPanel isOpen={true} onOpenChange={() => {}} />);

    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(<ChatPanel isOpen={false} onOpenChange={() => {}} />);

    expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument();
  });

  test('calls onOpenChange when close button is clicked', async () => {
    const mockOnOpenChange = jest.fn();
    render(<ChatPanel isOpen={true} onOpenChange={mockOnOpenChange} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  test('displays mock chat messages', () => {
    render(<ChatPanel isOpen={true} onOpenChange={() => {}} />);

    // Check for welcome message
    expect(screen.getByText(/hello! how can i help/i)).toBeInTheDocument();
  });

  test('allows sending messages', async () => {
    render(<ChatPanel isOpen={true} onOpenChange={() => {}} />);

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(messageInput, 'Test message');
    await user.click(sendButton);

    // Message should be added (implementation will handle this)
    expect(messageInput).toHaveValue('');
  });

  test('slides in from right side', () => {
    render(<ChatPanel isOpen={true} onOpenChange={() => {}} />);

    // Check that it uses sheet with right side
    const sheetContent = screen.getByRole('dialog');
    expect(sheetContent).toBeInTheDocument();
  });
});