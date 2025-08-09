// Mock data for testing
export const mockEmployee = {
  cedula: '123456789',
  nombre: 'Juan Pérez',
  posicion: 'operator',
  departamento: 'Producción',
  fechaInicio: '2024-01-01',
  salario: 500000,
  status: 'Activo',
  vacaciones: 0,
};

export const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
};

export const mockHRRequest = {
  id: 'request-123',
  type: 'add_employee' as const,
  requestedBy: 'user-123',
  requestedByName: 'Juan Manager',
  requestedByRole: 'manager',
  title: 'Agregar nuevo empleado',
  description: 'Solicitud para agregar empleado de producción',
  proposedData: {
    cedula: '987654321',
    nombre: 'Ana García',
    posicion: 'operator',
    departamento: 'Producción',
    fechaInicio: '2024-02-01',
    salario: 450000,
  },
  status: 'pending' as const,
  submittedAt: new Date('2024-01-01'),
};

// Mock Firebase collections
export const createMockFirestoreDoc = (data: any, exists = true) => ({
  exists: () => exists,
  data: () => data,
  id: 'mock-id',
});

export const createMockFirestoreSnapshot = (docs: any[]) => ({
  docs: docs.map((data, index) => ({
    id: `doc-${index}`,
    data: () => data,
  })),
  empty: docs.length === 0,
  size: docs.length,
});

// Common mock functions
export const mockFirebaseAuth = {
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn(),
};

export const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    fromDate: jest.fn().mockImplementation((date) => ({ toDate: () => date })),
    now: jest.fn().mockReturnValue({ toDate: () => new Date() }),
  },
};

// Mock toast function
export const mockToast = jest.fn();

// Mock router functions
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};

// Mock theme store
export const mockThemeStore = {
  theme: 'light',
  setTheme: jest.fn(),
};

// Helper function to reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  Object.values(mockFirebaseAuth).forEach(mock => mock.mockReset());
  Object.values(mockFirestore).forEach(mock => typeof mock === 'function' && mock.mockReset());
  mockToast.mockReset();
  Object.values(mockRouter).forEach(mock => mock.mockReset());
};