import {
  addEmployee,
  getEmployees,
  updateEmployeeStatus,
  updateEmployee,
  updateVacaciones,
} from '../employees';
import { db, auth } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Mock Firebase modules
jest.mock('../firebase', () => ({
  db: {},
  auth: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

describe('employees', () => {
  const mockEmployee = {
    cedula: '123456789',
    nombre: 'Juan Pérez',
    posicion: 'operator',
    departamento: 'Producción',
    fechaInicio: '2024-01-01',
    salario: 500000,
    status: 'Activo',
    vacaciones: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addEmployee', () => {
    it('should add employee successfully', async () => {
      const mockUserCredential = {
        user: {
          uid: 'test-uid',
          email: 'juanperez@arceyvargas.app',
        },
      };

      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);
      (setDoc as jest.Mock).mockResolvedValue(undefined);
      (doc as jest.Mock).mockReturnValue('mock-doc-ref');

      const result = await addEmployee(mockEmployee, 'password123');

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'juanpérez@arceyvargas.app',
        'password123'
      );
      expect(setDoc).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw error if employee already exists', async () => {
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });

      await expect(addEmployee(mockEmployee, 'password123')).rejects.toThrow(
        'Ya existe un empleado con esta cédula.'
      );
    });

    it('should throw error if email already in use', async () => {
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/email-already-in-use',
      });

      await expect(addEmployee(mockEmployee, 'password123')).rejects.toThrow(
        'Este usuario ya está registrado.'
      );
    });
  });

  describe('getEmployees', () => {
    it('should return employees list', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: '123456789',
            data: () => ({
              nombre: 'Juan Pérez',
              posicion: 'operator',
              departamento: 'Producción',
              fechaInicio: '2024-01-01',
              salario: 500000,
              status: 'Activo',
              vacaciones: 0,
            }),
          },
        ],
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (collection as jest.Mock).mockReturnValue('mock-collection');

      const result = await getEmployees();

      expect(result).toEqual([mockEmployee]);
      expect(getDocs).toHaveBeenCalledWith('mock-collection');
    });

    it('should handle empty fields in employee data', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: '123456789',
            data: () => ({}),
          },
        ],
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getEmployees();

      expect(result).toEqual([
        {
          cedula: '123456789',
          nombre: '',
          posicion: '',
          departamento: '',
          fechaInicio: '',
          salario: 0,
          status: 'Inactivo',
          vacaciones: 0,
        },
      ]);
    });
  });

  describe('updateEmployeeStatus', () => {
    it('should update employee status successfully', async () => {
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      (doc as jest.Mock).mockReturnValue('mock-doc-ref');

      await updateEmployeeStatus('123456789', 'Inactivo');

      expect(updateDoc).toHaveBeenCalledWith('mock-doc-ref', { status: 'Inactivo' });
    });

    it('should throw error if cedula is empty', async () => {
      await expect(updateEmployeeStatus('', 'Inactivo')).rejects.toThrow(
        'La cédula es requerida para actualizar el estado del empleado.'
      );
    });

    it('should throw error if employee does not exist', async () => {
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

      await expect(updateEmployeeStatus('123456789', 'Inactivo')).rejects.toThrow(
        'El empleado no existe.'
      );
    });
  });

  describe('updateEmployee', () => {
    it('should update employee successfully', async () => {
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      (doc as jest.Mock).mockReturnValue('mock-doc-ref');

      await updateEmployee(mockEmployee);

      expect(updateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        nombre: mockEmployee.nombre,
        posicion: mockEmployee.posicion,
        departamento: mockEmployee.departamento,
        fechaInicio: mockEmployee.fechaInicio,
        salario: mockEmployee.salario,
        status: mockEmployee.status,
      });
    });

    it('should throw error if employee does not exist', async () => {
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

      await expect(updateEmployee(mockEmployee)).rejects.toThrow(
        'El empleado no existe.'
      );
    });
  });

  describe('updateVacaciones', () => {
    it('should update vacation days for all employees', async () => {
      const mockEmployees = [
        {
          ...mockEmployee,
          fechaInicio: '2023-01-01',
        },
      ];

      // Mock getEmployees
      const mockSnapshot = {
        docs: [
          {
            id: '123456789',
            data: () => ({
              nombre: 'Juan Pérez',
              posicion: 'operator',
              departamento: 'Producción',
              fechaInicio: '2023-01-01',
              salario: 500000,
              status: 'Activo',
              vacaciones: 0,
            }),
          },
        ],
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (collection as jest.Mock).mockReturnValue('mock-collection');
      (doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateVacaciones();

      expect(updateDoc).toHaveBeenCalled();
    });
  });
});