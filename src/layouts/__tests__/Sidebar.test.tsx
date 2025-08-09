import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardSidebar } from '../Sidebar';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/employees',
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('next/image', () => {
  return ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
    <img src={src} alt={alt} width={width} height={height} />
  );
});

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  auth: {
    signOut: jest.fn(),
  },
  db: {},
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: '',
  },
});

describe('DashboardSidebar', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
  };

  const mockUserData = {
    cedula: '123456789',
    photoURL: 'https://example.com/avatar.jpg',
  };

  const mockEmployeeData = {
    nombre: 'Juan Manager',
    posicion: 'general-manager',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
    
    // Mock successful auth and data fetching by default
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(mockUser);
      return jest.fn(); // unsubscribe function
    });

    (getDoc as jest.Mock)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserData,
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => mockEmployeeData,
      });
  });

  it('should render sidebar with logo and user info', async () => {
    render(<DashboardSidebar />);

    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByText('Arce & Vargas')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Juan Manager')).toBeInTheDocument();
      expect(screen.getByText('Gerente General')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(<DashboardSidebar />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should display navigation items based on user role', async () => {
    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(screen.getByText('Panel')).toBeInTheDocument();
      expect(screen.getByText('Empleados')).toBeInTheDocument();
      expect(screen.getByText('Cotizaciones')).toBeInTheDocument();
      expect(screen.getByText('Facturas')).toBeInTheDocument();
      expect(screen.getByText('Reportes')).toBeInTheDocument();
    });
  });

  it('should filter navigation items for operators', async () => {
    const operatorData = {
      ...mockEmployeeData,
      posicion: 'operators',
    };

    (getDoc as jest.Mock)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserData,
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => operatorData,
      });

    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(screen.getByText('Operador')).toBeInTheDocument();
      expect(screen.getByText('Panel')).toBeInTheDocument();
      expect(screen.getByText('Solicitud de Vacaciones')).toBeInTheDocument();
      expect(screen.queryByText('Empleados')).not.toBeInTheDocument();
      expect(screen.queryByText('Cotizaciones')).not.toBeInTheDocument();
    });
  });

  it('should expand collapsible menu items', async () => {
    const user = userEvent.setup();
    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(screen.getByText('Empleados')).toBeInTheDocument();
    });

    const employeesButton = screen.getByText('Empleados');
    await user.click(employeesButton);

    expect(screen.getByText('Lista de Empleados')).toBeInTheDocument();
    expect(screen.getByText('Horas Extras')).toBeInTheDocument();
    expect(screen.getByText('Gestión Horas Extra')).toBeInTheDocument();
    expect(screen.getByText('Vacaciones')).toBeInTheDocument();
  });

  it('should handle logout correctly', async () => {
    const user = userEvent.setup();
    const mockSignOut = require('@/lib/firebase').auth.signOut;
    
    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(screen.getByText('Juan Manager')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Salir');
    await user.click(logoutButton);

    expect(window.location.href).toBe('/');
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should handle logout error gracefully', async () => {
    const user = userEvent.setup();
    const mockSignOut = require('@/lib/firebase').auth.signOut;
    mockSignOut.mockRejectedValue(new Error('Logout failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(screen.getByText('Juan Manager')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Salir');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error al cerrar sesión:', expect.any(Error));
    });

    expect(window.location.href).toBe('/');
    consoleSpy.mockRestore();
  });

  it('should handle user not found in Firestore', async () => {
    (getDoc as jest.Mock)
      .mockResolvedValueOnce({
        exists: () => false,
      });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('❌ No se encontró el usuario en Firestore.');
    });

    consoleSpy.mockRestore();
  });

  it('should handle employee not found in Firestore', async () => {
    (getDoc as jest.Mock)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserData,
      })
      .mockResolvedValueOnce({
        exists: () => false,
      });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('❌ No se encontró la información del empleado.');
    });

    consoleSpy.mockRestore();
  });

  it('should handle no authenticated user', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });

    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(screen.queryByText('Juan Manager')).not.toBeInTheDocument();
    });
  });

  it('should handle Firestore error', async () => {
    (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('❌ Error al obtener datos del usuario:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should generate correct user initials', async () => {
    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(screen.getByText('JM')).toBeInTheDocument();
    });
  });

  it('should handle user with single name', async () => {
    const singleNameData = {
      ...mockEmployeeData,
      nombre: 'Juan',
    };

    (getDoc as jest.Mock)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserData,
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => singleNameData,
      });

    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(screen.getByText('JU')).toBeInTheDocument();
    });
  });

  it('should show default fallback for unknown position', async () => {
    const unknownPositionData = {
      ...mockEmployeeData,
      posicion: 'unknown-position',
    };

    (getDoc as jest.Mock)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserData,
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => unknownPositionData,
      });

    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(screen.getByText('Operador')).toBeInTheDocument();
    });
  });

  it('should mark active navigation items correctly', async () => {
    render(<DashboardSidebar />);

    await waitFor(() => {
      const employeesLink = screen.getByText('Empleados').closest('button');
      expect(employeesLink).toHaveAttribute('data-active', 'true');
    });
  });

  it('should show no access message when user has no routes', async () => {
    const noAccessData = {
      ...mockEmployeeData,
      posicion: 'invalid-role',
    };

    (getDoc as jest.Mock)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserData,
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => noAccessData,
      });

    render(<DashboardSidebar />);

    await waitFor(() => {
      expect(screen.getByText('No tienes acceso a ningún módulo.')).toBeInTheDocument();
    });
  });

  it('should navigate to profile page', async () => {
    render(<DashboardSidebar />);

    await waitFor(() => {
      const profileLink = screen.getByText('Perfil').closest('a');
      expect(profileLink).toHaveAttribute('href', '/dashboard/profile');
    });
  });
});