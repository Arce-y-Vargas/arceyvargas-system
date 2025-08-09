import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { mockUser } from '@/test-utils/mocks';

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  auth: {},
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null user initially', () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      return jest.fn(); // unsubscribe function
    });

    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('should set user when authenticated', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      setTimeout(() => callback(mockUser), 0);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should set user to null when not authenticated', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      setTimeout(() => callback(null), 0);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  it('should unsubscribe on unmount', () => {
    const mockUnsubscribe = jest.fn();
    (onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should update user state when auth state changes', async () => {
    let authCallback: ((user: any) => void) | null = null;
    
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      authCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth());

    // Initially no user
    expect(result.current.user).toBeNull();

    // Simulate login
    act(() => {
      authCallback?.(mockUser);
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
    });

    // Simulate logout
    act(() => {
      authCallback?.(null);
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });
});