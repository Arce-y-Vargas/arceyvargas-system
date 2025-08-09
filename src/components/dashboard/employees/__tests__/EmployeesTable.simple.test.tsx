import { render, screen, waitFor } from '@testing-library/react';
import EmployeesTable from '../EmployeesTable';
import { getEmployees } from '@/lib/employees';

// Simple mocks for testing
jest.mock('@/lib/employees', () => ({
  getEmployees: jest.fn(),
  updateEmployeeStatus: jest.fn(),
}));

jest.mock('../EmployeesModal', () => {
  return function MockEmployeesModal() {
    return <div data-testid="employees-modal">Modal</div>;
  };
});

jest.mock('../EmployeesEdit', () => {
  return function MockEmployeesEdit() {
    return <div data-testid="employees-edit">Edit</div>;
  };
});

// Mock all lucide icons with simple divs
jest.mock('lucide-react', () => {
  const MockIcon = ({ className, ...props }: any) => <div className={className} {...props} />;
  return {
    Plus: MockIcon,
    Pencil: MockIcon,
    Trash2: MockIcon,
    Search: MockIcon,
    Filter: MockIcon,
  };
});

describe('EmployeesTable Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', async () => {
    (getEmployees as jest.Mock).mockResolvedValue([]);
    
    render(<EmployeesTable />);
    
    await waitFor(() => {
      expect(screen.getByText('Empleados')).toBeInTheDocument();
    });
  });

  it('should display employees when loaded', async () => {
    const mockEmployees = [
      {
        cedula: '123456789',
        nombre: 'Juan Pérez',
        posicion: 'operator',
        departamento: 'Producción',
        fechaInicio: '2024-01-01',
        salario: 500000,
        status: 'Activo',
        vacaciones: 0,
      },
    ];

    (getEmployees as jest.Mock).mockResolvedValue(mockEmployees);
    
    render(<EmployeesTable />);
    
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
  });

  it('should handle empty employee list', async () => {
    (getEmployees as jest.Mock).mockResolvedValue([]);
    
    render(<EmployeesTable />);
    
    await waitFor(() => {
      expect(screen.getByText(/no se encontraron empleados/i)).toBeInTheDocument();
    });
  });

  it('should show add employee button', async () => {
    (getEmployees as jest.Mock).mockResolvedValue([]);
    
    render(<EmployeesTable />);
    
    await waitFor(() => {
      expect(screen.getByText(/agregar empleado/i)).toBeInTheDocument();
    });
  });
});