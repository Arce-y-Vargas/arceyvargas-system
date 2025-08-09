import { login, logout } from '../auth';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Mock Firebase modules
jest.mock('../firebase', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

// Mock process.env
const mockEnv = jest.fn();
Object.defineProperty(process, 'env', {
  value: {
    get NODE_ENV() {
      return mockEnv();
    },
  },
});

describe('auth', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    getIdToken: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = '';
  });

  describe('login', () => {
    it('should login successfully in development', async () => {
      mockEnv.mockReturnValue('development');
      
      const mockUserCredential = { user: mockUser };
      mockUser.getIdToken.mockResolvedValue('mock-token');
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);

      const result = await login('test@example.com', 'password123');

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password123'
      );
      expect(mockUser.getIdToken).toHaveBeenCalled();
      expect(document.cookie).toBe('authToken=mock-token; path=/; max-age=3600; sameSite=lax');
      expect(result).toBe(mockUser);
    });

    it('should login successfully in production', async () => {
      mockEnv.mockReturnValue('production');
      
      const mockUserCredential = { user: mockUser };
      mockUser.getIdToken.mockResolvedValue('mock-token');
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);

      const result = await login('test@example.com', 'password123');

      expect(document.cookie).toBe('authToken=mock-token; path=/; max-age=3600; secure; sameSite=strict');
      expect(result).toBe(mockUser);
    });

    it('should throw error on failed login', async () => {
      const mockError = new Error('Invalid credentials');
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError);

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should logout successfully in development', async () => {
      mockEnv.mockReturnValue('development');
      document.cookie = 'authToken=some-token';
      
      (signOut as jest.Mock).mockResolvedValue(undefined);

      await logout();

      expect(document.cookie).toBe('authToken=; path=/; max-age=0; sameSite=lax');
      expect(signOut).toHaveBeenCalledWith(auth);
    });

    it('should logout successfully in production', async () => {
      mockEnv.mockReturnValue('production');
      document.cookie = 'authToken=some-token';
      
      (signOut as jest.Mock).mockResolvedValue(undefined);

      await logout();

      expect(document.cookie).toBe('authToken=; path=/; max-age=0; secure; sameSite=strict');
      expect(signOut).toHaveBeenCalledWith(auth);
    });

    it('should handle logout error', async () => {
      const mockError = new Error('Logout failed');
      (signOut as jest.Mock).mockRejectedValue(mockError);

      await expect(logout()).rejects.toThrow('Logout failed');
    });
  });
});