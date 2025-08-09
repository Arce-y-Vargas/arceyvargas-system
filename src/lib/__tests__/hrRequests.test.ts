import {
  submitHRRequest,
  getHRRequests,
  updateHRRequestStatus,
  getRequestTypeLabel,
  getStatusLabel,
  HRRequest,
} from '../hrRequests';
import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

// Mock Firebase modules
jest.mock('../firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    fromDate: jest.fn().mockImplementation((date) => ({ toDate: () => date })),
  },
}));

// Mock employees module
jest.mock('../employees', () => ({
  addEmployee: jest.fn(),
  updateEmployee: jest.fn(),
}));

describe('hrRequests', () => {
  const mockRequest = {
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
      password: 'temp123',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitHRRequest', () => {
    it('should submit HR request successfully', async () => {
      const mockDocRef = { id: 'request-123' };
      
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const result = await submitHRRequest(mockRequest);

      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(result).toBe('request-123');
    });
  });

  describe('getHRRequests', () => {
    it('should return HR requests list', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'request-123',
            data: () => ({
              ...mockRequest,
              status: 'pending',
              submittedAt: { toDate: () => new Date('2024-01-01') },
            }),
          },
        ],
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (query as jest.Mock).mockReturnValue('mock-query');
      (orderBy as jest.Mock).mockReturnValue('mock-orderBy');
      (collection as jest.Mock).mockReturnValue('mock-collection');

      const result = await getHRRequests();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'request-123',
        ...mockRequest,
        status: 'pending',
        submittedAt: new Date('2024-01-01'),
      });
    });

    it('should filter requests by status', async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (query as jest.Mock).mockReturnValue('mock-query');
      (where as jest.Mock).mockReturnValue('mock-where');
      (orderBy as jest.Mock).mockReturnValue('mock-orderBy');
      (collection as jest.Mock).mockReturnValue('mock-collection');

      await getHRRequests({ status: 'pending' });

      expect(where).toHaveBeenCalledWith('status', '==', 'pending');
    });

    it('should filter requests by type', async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (query as jest.Mock).mockReturnValue('mock-query');
      (where as jest.Mock).mockReturnValue('mock-where');
      (orderBy as jest.Mock).mockReturnValue('mock-orderBy');
      (collection as jest.Mock).mockReturnValue('mock-collection');

      await getHRRequests({ type: 'add_employee' });

      expect(where).toHaveBeenCalledWith('type', '==', 'add_employee');
    });

    it('should filter requests by requester', async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (query as jest.Mock).mockReturnValue('mock-query');
      (where as jest.Mock).mockReturnValue('mock-where');
      (orderBy as jest.Mock).mockReturnValue('mock-orderBy');
      (collection as jest.Mock).mockReturnValue('mock-collection');

      await getHRRequests({ requestedBy: 'user-123' });

      expect(where).toHaveBeenCalledWith('requestedBy', '==', 'user-123');
    });
  });

  describe('updateHRRequestStatus', () => {
    const mockRequestData = {
      ...mockRequest,
      status: 'pending',
      submittedAt: new Date(),
    };

    beforeEach(() => {
      (doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockRequestData,
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
    });

    it('should approve request by GM', async () => {
      await updateHRRequestStatus(
        'request-123',
        'approve_gm',
        'Manager Name',
        'general-manager',
        'Approved by GM'
      );

      expect(updateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        status: 'approved_by_gm',
        generalManagerApproval: {
          approvedBy: 'Manager Name',
          approvedAt: expect.any(Object),
          comments: 'Approved by GM',
        },
      });
    });

    it('should approve request by HR', async () => {
      await updateHRRequestStatus(
        'request-123',
        'approve_hr',
        'HR Name',
        'hr',
        'Approved by HR'
      );

      expect(updateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        status: 'approved_by_hr',
        hrApproval: {
          approvedBy: 'HR Name',
          approvedAt: expect.any(Object),
          comments: 'Approved by HR',
        },
      });
    });

    it('should reject request', async () => {
      await updateHRRequestStatus(
        'request-123',
        'reject',
        'Manager Name',
        'general-manager',
        'Not needed'
      );

      expect(updateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        status: 'rejected',
        rejectedBy: 'Manager Name',
        rejectedAt: expect.any(Object),
        rejectionReason: 'Not needed',
        processedAt: expect.any(Object),
      });
    });

    it('should throw error if request not found', async () => {
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

      await expect(
        updateHRRequestStatus('request-123', 'approve_gm', 'Manager', 'manager')
      ).rejects.toThrow('Solicitud no encontrada');
    });

    it('should set status to approved when both approvals exist', async () => {
      const requestWithHRApproval = {
        ...mockRequestData,
        hrApproval: {
          approvedBy: 'HR Person',
          approvedAt: new Date(),
        },
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => requestWithHRApproval,
      });

      await updateHRRequestStatus(
        'request-123',
        'approve_gm',
        'Manager Name',
        'general-manager'
      );

      expect(updateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        status: 'approved',
        generalManagerApproval: {
          approvedBy: 'Manager Name',
          approvedAt: expect.any(Object),
          comments: '',
        },
        processedAt: expect.any(Object),
      });
    });
  });

  describe('getRequestTypeLabel', () => {
    it('should return correct labels for request types', () => {
      expect(getRequestTypeLabel('add_employee')).toBe('Agregar Empleado');
      expect(getRequestTypeLabel('edit_employee')).toBe('Editar Empleado');
      expect(getRequestTypeLabel('salary_change')).toBe('Cambio de Salario');
      expect(getRequestTypeLabel('position_change')).toBe('Cambio de Posición');
      expect(getRequestTypeLabel('department_change')).toBe('Cambio de Departamento');
      expect(getRequestTypeLabel('status_change')).toBe('Cambio de Estado');
      expect(getRequestTypeLabel('unknown_type')).toBe('unknown_type');
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct labels for status types', () => {
      expect(getStatusLabel('pending')).toBe('Pendiente');
      expect(getStatusLabel('approved_by_gm')).toBe('Aprobada por Gerente General');
      expect(getStatusLabel('approved_by_hr')).toBe('Aprobada por RRHH');
      expect(getStatusLabel('approved')).toBe('Aprobada');
      expect(getStatusLabel('rejected')).toBe('Rechazada');
      expect(getStatusLabel('unknown_status')).toBe('unknown_status');
    });
  });
});