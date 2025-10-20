import { storage } from '@/lib/utils/storage';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Storage Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets token in localStorage', () => {
    storage.setToken('test-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
  });

  it('gets token from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('test-token');
    const token = storage.getToken();
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    expect(token).toBe('test-token');
  });

  it('removes token from localStorage', () => {
    storage.removeToken();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('returns null when no token exists', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const token = storage.getToken();
    expect(token).toBeNull();
  });
});
