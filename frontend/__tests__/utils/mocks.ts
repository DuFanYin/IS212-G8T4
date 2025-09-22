// Test utilities and shared mocks
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'manager',
  teamId: 'team1',
  departmentId: 'dept1',
  token: 'test-token'
};

export const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  status: 'ongoing' as const,
  dueDate: '2024-12-31T00:00:00.000Z',
  createdBy: 'user1',
  assigneeId: 'user2',
  projectId: 'project1',
  collaborators: ['user1', 'user2'],
  attachments: [],
  isDeleted: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

export const mockTasks = [
  mockTask,
  {
    ...mockTask,
    id: '2',
    title: 'Another Task',
    status: 'unassigned' as const
  }
];

export const mockApiResponse = {
  success: (data: any) => ({ status: 'success', data }),
  error: (message: string) => ({ status: 'error', message })
};

// Mock fetch responses
export const createMockFetch = (response: any) => {
  return vi.fn().mockResolvedValue({
    json: () => Promise.resolve(response),
    ok: response.status === 'success',
    status: response.status === 'success' ? 200 : 400
  });
};