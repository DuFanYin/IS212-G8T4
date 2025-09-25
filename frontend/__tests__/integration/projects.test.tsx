import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import ProjectsPage from '@/app/projects/page';

vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({ user: { id: 'u1', name: 'User', role: 'manager', token: 't' } })
}));

vi.mock('@/lib/services/project', () => ({
  projectService: {
    getProjects: vi.fn().mockResolvedValue({ status: 'success', data: [
      { id: 'p1', name: 'Proj', description: 'Desc', isArchived: false, deadline: null, hasContainedTasks: false }
    ]}),
    setArchived: vi.fn().mockResolvedValue({ status: 'success', data: { id: 'p1', name: 'Proj', description: 'Desc', isArchived: true, deadline: null, hasContainedTasks: false } }),
    addCollaborator: vi.fn().mockResolvedValue({ status: 'success', data: { id: 'p1' } }),
    removeCollaborator: vi.fn().mockResolvedValue({ status: 'success', data: { id: 'p1' } }),
    createProject: vi.fn().mockResolvedValue({ status: 'success', data: { id: 'p2', name: 'New', description: '', isArchived: false, deadline: null, hasContainedTasks: false } }),
    updateProject: vi.fn().mockResolvedValue({ status: 'success', data: { id: 'p1', name: 'Edited', description: 'Desc', isArchived: false, deadline: null, hasContainedTasks: false } })
  }
}));

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => 't'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    } as unknown as Storage);
  });

  it('loads and toggles archive state', async () => {
    render(<ProjectsPage />);

    await screen.findByText('Proj');
    const toggle = screen.getByRole('button', { name: 'Active' });
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Archived' })).toBeInTheDocument();
    });
  });

  it('fires collaborator add/remove actions', async () => {
    render(<ProjectsPage />);
    await screen.findByText('Proj');
    fireEvent.click(screen.getByText('Add Collaborator'));
    fireEvent.click(screen.getByText('Remove Collaborator'));
  });

  it('creates a new project via modal', async () => {
    render(<ProjectsPage />);
    const newBtn = await screen.findByText('New Project');
    fireEvent.click(newBtn);
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'New' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await screen.findByText('New');
  });
});
