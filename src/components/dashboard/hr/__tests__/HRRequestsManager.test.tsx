import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HRRequestsManager from '../HRRequestsManager';
import { getHRRequests, updateHRRequestStatus } from '@/lib/hrRequests';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { getDoc } from 'firebase/firestore';

// Mock the dependencies
jest.mock('@/lib/hrRequests', () => ({
  getHRRequests: jest.fn(),
  updateHRRequestStatus: jest.fn(),
  getRequestTypeLabel: jest.fn((type) => {
    const labels = {
      'add_employee': 'Agregar Empleado',
      'edit_employee': 'Editar Empleado',
      'salary_change': 'Cambio de Salario',
    };
    return labels[type as keyof typeof labels] || type;
  }),
  getStatusLabel: jest.fn((status) => {
    const labels = {
      'pending': 'Pendiente',
      'approved': 'Aprobada',
      'rejected': 'Rechazada',
    };
    return labels[status as keyof typeof labels] || status;
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  db: {},
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => '01/01/2024'),
}));

jest.mock('date-fns/locale', () => ({
  es: {},
}));

describe('HRRequestsManager', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
  };

  const mockRequests = [
    {
      id: 'request-1',
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
    },
    {
      id: 'request-2',
      type: 'salary_change' as const,
      requestedBy: 'user-456',
      requestedByName: 'María HR',
      requestedByRole: 'hr',
      title: 'Aumento de salario',
      description: 'Aumento por desempeño',
      currentData: {
        salario: 400000,
      },
      proposedData: {
        salario: 500000,
      },
      targetEmployeeId: '123456789',
      targetEmployeeName: 'Pedro López',
      status: 'approved' as const,
      submittedAt: new Date('2024-01-15'),
      generalManagerApproval: {
        approvedBy: 'GM User',
        approvedAt: new Date('2024-01-16'),
        comments: 'Aprobado',
      },
      hrApproval: {
        approvedBy: 'HR User',
        approvedAt: new Date('2024-01-17'),
        comments: 'Procesado',
      },
    },
  ];

  const defaultProps = {
    userId: 'test-user-id',
    userName: 'Test Manager',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (getHRRequests as jest.Mock).mockResolvedValue(mockRequests);
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        cedula: '123456789',
        posicion: 'general-manager',
      }),
    });
  });

  it('should render HR requests table with data', async () => {
    render(<HRRequestsManager {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
      expect(screen.getByText('Aumento de salario')).toBeInTheDocument();
    });

    expect(screen.getByText('Juan Manager')).toBeInTheDocument();
    expect(screen.getByText('María HR')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<HRRequestsManager {...defaultProps} />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('should filter requests by search query', async () => {
    const user = userEvent.setup();
    render(<HRRequestsManager {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/buscar por título/i);
    await user.type(searchInput, 'Agregar');

    expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    expect(screen.queryByText('Aumento de salario')).not.toBeInTheDocument();
  });

  it('should filter requests by status', async () => {
    const user = userEvent.setup();
    render(<HRRequestsManager {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    });

    const statusFilter = screen.getByDisplayValue(/todos los estados/i);
    await user.click(statusFilter);

    const pendingOption = screen.getByText('Pendientes');
    await user.click(pendingOption);

    expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    expect(screen.queryByText('Aumento de salario')).not.toBeInTheDocument();
  });

  it('should filter requests by type', async () => {
    const user = userEvent.setup();
    render(<HRRequestsManager {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    });

    const typeFilter = screen.getByDisplayValue(/todos los tipos/i);
    await user.click(typeFilter);

    const addEmployeeOption = screen.getByText('Agregar Empleado');
    await user.click(addEmployeeOption);

    expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    expect(screen.queryByText('Aumento de salario')).not.toBeInTheDocument();
  });

  it('should open request detail modal', async () => {
    const user = userEvent.setup();
    render(<HRRequestsManager {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    });

    const reviewButtons = screen.getAllByText(/revisar/i);
    await user.click(reviewButtons[0]);

    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Datos propuestos')).toBeInTheDocument();
  });

  it('should approve request as GM', async () => {
    const user = userEvent.setup();
    (updateHRRequestStatus as jest.Mock).mockResolvedValue(undefined);
    
    render(<HRRequestsManager {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    });

    const reviewButtons = screen.getAllByText(/revisar/i);
    await user.click(reviewButtons[0]);

    const approveGMButton = screen.getByText('Aprobar (GM)');
    await user.click(approveGMButton);

    const confirmButton = screen.getByText('Aprobar');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(updateHRRequestStatus).toHaveBeenCalledWith(
        'request-1',
        'approve_gm',
        'Test Manager',
        'general-manager',
        undefined
      );
    });

    expect(toast).toHaveBeenCalledWith({
      title: 'Solicitud aprobada por Gerente General',
      description: 'La solicitud ha sido aprobada por Gerente General exitosamente.',
    });
  });

  it('should approve request as HR', async () => {
    const user = userEvent.setup();
    (updateHRRequestStatus as jest.Mock).mockResolvedValue(undefined);
    
    // Mock user as HR
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        cedula: '123456789',
        posicion: 'rrhh',
      }),
    });

    render(<HRRequestsManager {...defaultProps} userName="HR Manager" />);

    await waitFor(() => {
      expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    });

    const reviewButtons = screen.getAllByText(/revisar/i);
    await user.click(reviewButtons[0]);

    const approveHRButton = screen.getByText('Aprobar (RRHH)');
    await user.click(approveHRButton);

    const confirmButton = screen.getByText('Aprobar');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(updateHRRequestStatus).toHaveBeenCalledWith(
        'request-1',
        'approve_hr',
        'HR Manager',
        'rrhh',
        undefined
      );
    });
  });

  it('should reject request', async () => {
    const user = userEvent.setup();
    (updateHRRequestStatus as jest.Mock).mockResolvedValue(undefined);
    
    render(<HRRequestsManager {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    });

    const reviewButtons = screen.getAllByText(/revisar/i);
    await user.click(reviewButtons[0]);

    const rejectButton = screen.getByText('Rechazar');
    await user.click(rejectButton);

    const confirmButton = screen.getByText('Rechazar');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(updateHRRequestStatus).toHaveBeenCalledWith(
        'request-1',
        'reject',
        'Test Manager',
        'general-manager',
        undefined
      );
    });
  });

  it('should add comments when approving/rejecting', async () => {
    const user = userEvent.setup();
    (updateHRRequestStatus as jest.Mock).mockResolvedValue(undefined);
    
    render(<HRRequestsManager {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    });

    const reviewButtons = screen.getAllByText(/revisar/i);
    await user.click(reviewButtons[0]);

    const commentsTextarea = screen.getByPlaceholderText(/agregue comentarios/i);
    await user.type(commentsTextarea, 'This looks good');

    const approveGMButton = screen.getByText('Aprobar (GM)');
    await user.click(approveGMButton);

    const confirmButton = screen.getByText('Aprobar');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(updateHRRequestStatus).toHaveBeenCalledWith(
        'request-1',
        'approve_gm',
        'Test Manager',
        'general-manager',
        'This looks good'
      );
    });
  });

  it('should handle error when fetching requests', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (getHRRequests as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<HRRequestsManager {...defaultProps} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching HR requests:', expect.any(Error));
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'No se pudieron cargar las solicitudes.',
        variant: 'destructive',
      });
    });

    consoleSpy.mockRestore();
  });

  it('should handle error when updating request status', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (updateHRRequestStatus as jest.Mock).mockRejectedValue(new Error('Update failed'));
    
    render(<HRRequestsManager {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    });

    const reviewButtons = screen.getAllByText(/revisar/i);
    await user.click(reviewButtons[0]);

    const approveGMButton = screen.getByText('Aprobar (GM)');
    await user.click(approveGMButton);

    const confirmButton = screen.getByText('Aprobar');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error updating request status:', expect.any(Error));
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la solicitud.',
        variant: 'destructive',
      });
    });

    consoleSpy.mockRestore();
  });

  it('should display correct statistics', async () => {
    render(<HRRequestsManager {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // Pending count
      expect(screen.getByText('1')).toBeInTheDocument(); // Approved count
      expect(screen.getByText('0')).toBeInTheDocument(); // Rejected count
    });
  });

  it('should show no requests message when list is empty', async () => {
    (getHRRequests as jest.Mock).mockResolvedValue([]);
    
    render(<HRRequestsManager {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('No hay solicitudes de RRHH.')).toBeInTheDocument();
    });
  });

  it('should detect GM role correctly', async () => {
    render(<HRRequestsManager {...defaultProps} userName="Gerente Principal" />);

    await waitFor(() => {
      expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    });

    const reviewButtons = screen.getAllByText(/revisar/i);
    await user.click(reviewButtons[0]);

    expect(screen.getByText('Aprobar (GM)')).toBeInTheDocument();
  });

  it('should detect HR role correctly', async () => {
    render(<HRRequestsManager {...defaultProps} userName="RRHH Manager" />);

    await waitFor(() => {
      expect(screen.getByText('Agregar nuevo empleado')).toBeInTheDocument();
    });

    const reviewButtons = screen.getAllByText(/revisar/i);
    await user.click(reviewButtons[0]);

    expect(screen.getByText('Aprobar (RRHH)')).toBeInTheDocument();
  });
});