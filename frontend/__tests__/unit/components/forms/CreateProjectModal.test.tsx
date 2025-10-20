import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CreateProjectModal } from '@/components/forms/CreateProjectModal';

describe('CreateProjectModal', () => {
  it('validates and submits project data', async () => {
    const onClose = vi.fn();
    const onCreate = vi.fn().mockResolvedValue(undefined);

    render(
      <CreateProjectModal isOpen={true} onClose={onClose} onCreate={onCreate} />
    );

    // Missing name shows error
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(await screen.findByText('Name is required')).toBeInTheDocument();

    // Fill fields and submit
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'My Project' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Desc' } });
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: '2025-12-31' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});


