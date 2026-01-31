import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../../components/Modal';

describe('Modal Component', () => {
    it('does not render when isOpen is false', () => {
        render(<Modal isOpen={false} title="Test Modal" onClose={() => { }}><p>Content</p></Modal>);
        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('renders correct content when isOpen is true', () => {
        render(<Modal isOpen={true} title="Test Modal" onClose={() => { }}><p>Test Content</p></Modal>);
        expect(screen.getByText('Test Modal')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onCloseMock = vi.fn();
        render(<Modal isOpen={true} title="Test Modal" onClose={onCloseMock}><p>Content</p></Modal>);

        // Find close button (usually has an aria-label or is the only button in header)
        // Adjust selector based on implementation details if needed
        const closeButton = screen.getByRole('button');
        fireEvent.click(closeButton);

        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
});
