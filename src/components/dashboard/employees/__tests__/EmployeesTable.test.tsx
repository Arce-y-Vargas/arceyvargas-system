import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeesTable from '../EmployeesTable';
import { getEmployees, updateEmployeeStatus } from '@/lib/employees';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Plus: () => <div data-testid="plus-icon">+</div>,
  Pencil: () => <div data-testid="pencil-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Delete</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Filter: () => <div data-testid="filter-icon">Filter</div>,
}));

// Mock the employees library
jest.mock('@/lib/employees', () => ({
  getEmployees: jest.fn(),
  updateEmployeeStatus: jest.fn(),
}));

// Mock the child components
jest.mock('../EmployeesModal', () => {
  return function MockEmployeesModal({ isOpen, onClose, onEmployeeAdded }: any) {
    return isOpen ? (
      <div data-testid="employees-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onEmployeeAdded}>Add Employee</button>
      </div>
    ) : null;
  };
});

jest.mock('../EmployeesEdit', () => {
  return function MockEmployeesEdit({ isOpen, onClose, onEmployeeUpdated, employee }: any) {
    return isOpen ? (
      <div data-testid="employees-edit">
        <span>Editing: {employee?.nombre}</span>
        <button onClick={onClose}>Close</button>
        <button onClick={onEmployeeUpdated}>Update Employee</button>
      </div>
    ) : null;
  };
});

describe('EmployeesTable', () => {
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
    {
      cedula: '987654321',
      nombre: 'Ana García',
      posicion: 'admin-assistant',
      departamento: 'Administración',
      fechaInicio: '2024-02-01',
      salario: 450000,
      status: 'Inactivo',
      vacaciones: 5,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getEmployees as jest.Mock).mockResolvedValue(mockEmployees);
  });

  it('should render employees table with data', async () => {
    render(<EmployeesTable />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    // Check if employees are displayed
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
    expect(screen.getByText('987654321')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<EmployeesTable />);
    const loadingElement = screen.getByRole('generic');
    expect(loadingElement).toBeInTheDocument();
  });

  it('should filter employees by search query', async () => {
    const user = userEvent.setup();
    render(<EmployeesTable />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Search for specific employee
    const searchInput = screen.getByPlaceholderText(/buscar por nombre/i);
    await user.type(searchInput, 'Juan');

    // Only Juan should be visible
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('Ana García')).not.toBeInTheDocument();
  });

  it('should filter employees by department', async () => {
    const user = userEvent.setup();
    render(<EmployeesTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Open department filter
    const departmentFilter = screen.getByDisplayValue(/todos los departamentos/i);
    await user.click(departmentFilter);

    // Select specific department
    const productionOption = screen.getByText('Producción');
    await user.click(productionOption);

    // Only production employees should be visible
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('Ana García')).not.toBeInTheDocument();
  });

  it('should filter employees by status', async () => {
    const user = userEvent.setup();
    render(<EmployeesTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Open status filter
    const statusFilter = screen.getByDisplayValue(/todos los estados/i);
    await user.click(statusFilter);

    // Select active status
    const activeOption = screen.getByText('Activo');
    await user.click(activeOption);

    // Only active employees should be visible
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('Ana García')).not.toBeInTheDocument();
  });

  it('should open add employee modal', async () => {
    const user = userEvent.setup();
    render(<EmployeesTable />);

    const addButton = screen.getByText(/agregar empleado/i);
    await user.click(addButton);

    expect(screen.getByTestId('employees-modal')).toBeInTheDocument();
  });

  it('should open edit employee modal', async () => {
    const user = userEvent.setup();
    render(<EmployeesTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Click edit button for first employee (using role button)
    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    if (editButtons.length > 0) {
      await user.click(editButtons[0]);
    } else {
      // Fallback: find buttons with pencil icon
      const buttons = screen.getAllByRole('button');
      const editButton = buttons.find(btn => btn.querySelector('[data-lucide="pencil"]'));
      if (editButton) await user.click(editButton);
    }

    expect(screen.getByTestId('employees-edit')).toBeInTheDocument();
    expect(screen.getByText('Editing: Juan Pérez')).toBeInTheDocument();
  });

  it('should delete employee (change status to inactive)', async () => {
    const user = userEvent.setup();
    (updateEmployeeStatus as jest.Mock).mockResolvedValue(undefined);
    
    render(<EmployeesTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Click delete button for first employee
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons.find(btn => btn.querySelector('[data-lucide="trash-2"]'));
    if (deleteButton) await user.click(deleteButton);

    await waitFor(() => {
      expect(updateEmployeeStatus).toHaveBeenCalledWith('123456789', 'Inactivo');
    });
  });

  it('should not delete employee with invalid cedula', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock employee with undefined cedula
    const mockEmployeesWithUndefined = [
      { ...mockEmployees[0], cedula: undefined },
    ];
    (getEmployees as jest.Mock).mockResolvedValue(mockEmployeesWithUndefined);

    render(<EmployeesTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons.find(btn => btn.querySelector('[data-lucide="trash-2"]'));
    if (deleteButton) await user.click(deleteButton);

    expect(consoleSpy).toHaveBeenCalledWith('Error: La cédula es inválida.');
    expect(updateEmployeeStatus).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should display total salary for filtered employees', async () => {
    render(<EmployeesTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Check if total salary is displayed
    const totalSalary = 500000 + 450000; // Sum of both employees
    const formattedTotal = new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
    }).format(totalSalary);

    expect(screen.getByText(`Total de salarios: ${formattedTotal}`)).toBeInTheDocument();
  });

  it('should display no employees message when list is empty', async () => {
    (getEmployees as jest.Mock).mockResolvedValue([]);
    
    render(<EmployeesTable />);

    await waitFor(() => {
      expect(screen.getByText('No se encontraron empleados.')).toBeInTheDocument();
    });
  });

  it('should handle error when fetching employees', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (getEmployees as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<EmployeesTable />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error al obtener empleados:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should translate position names correctly', async () => {
    render(<EmployeesTable />);

    await waitFor(() => {
      expect(screen.getByText('Operador')).toBeInTheDocument(); // operator translated
      expect(screen.getByText('Asistente Administrativo')).toBeInTheDocument(); // admin-assistant translated
    });
  });

  it('should display correct badge colors for departments and status', async () => {
    render(<EmployeesTable />);

    await waitFor(() => {
      const productionBadge = screen.getByText('Producción');
      expect(productionBadge).toHaveClass('bg-red-500');

      const adminBadge = screen.getByText('Administración');
      expect(adminBadge).toHaveClass('bg-purple-500');

      const activeBadge = screen.getByText('Activo');
      expect(activeBadge).toHaveClass('bg-green-500');

      const inactiveBadge = screen.getByText('Inactivo');
      expect(inactiveBadge).toHaveClass('bg-red-500');
    });
  });
});