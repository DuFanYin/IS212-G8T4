import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EditProjectModal } from '@/components/forms/EditProjectModal';
import type { Project } from '@/lib/types/project';

const project: Project = { id: 'p1', name: 'Proj', description: 'Desc', deadline: '2025-01-10T00:00:00.000Z' };

describe('EditProjectModal', () => {
  it('prefills and saves edits', async () => {
    const onClose = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <EditProjectModal isOpen={true} project={project} onClose={onClose} onSave={onSave} />
    );

    expect(screen.getByPlaceholderText('Name')).toHaveValue('Proj');

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});


