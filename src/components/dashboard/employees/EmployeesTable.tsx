"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmployeesModal from "./EmployeesModal";
import EmployeesEdit from "./EmployeesEdit";
import { getEmployees, updateEmployeeStatus } from "@/lib/employees";

interface Employee {
  cedula: string;
  nombre: string;
  posicion: string;
  departamento: string;
  fechaInicio: string;
  salario: number;
  status: string;
}

const departmentColors: Record<string, string> = {
  Gerencia: "bg-blue-500 text-white",
  Administración: "bg-purple-500 text-white",
  Operaciones: "bg-yellow-500 text-black",
  Producción: "bg-red-500 text-white",
  Finanzas: "bg-green-500 text-white",
  Taller: "bg-orange-500 text-white",
  Almacén: "bg-indigo-500 text-white",
  Mecánica: "bg-teal-500 text-white",
};

const positionTranslations: Record<string, string> = {
  "general-manager": "Gerente General",
  "finance-manager": "Gerente Financiero",
  "operations-manager": "Gerente de Operaciones",
  "plant-manager": "Gerente de Planta",
  "admin-assistant": "Asistente Administrativo",
  "warehouse-staff": "Personal de Almacén",
  operator: "Operador",
};

export default function EmployeesTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchQuery, departmentFilter, statusFilter]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const empleados = await getEmployees();
      setEmployees(empleados);
      setFilteredEmployees(empleados);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (searchQuery) {
      filtered = filtered.filter(
        (employee) =>
          employee.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.cedula.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.posicion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.departamento
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Aplicar filtro de departamento
    if (departmentFilter !== "todos") {
      filtered = filtered.filter(
        (employee) => employee.departamento === departmentFilter
      );
    }

    // Aplicar filtro de estado
    if (statusFilter !== "todos") {
      filtered = filtered.filter(
        (employee) => employee.status === statusFilter
      );
    }

    setFilteredEmployees(filtered);
  };

  const handleEmployeeUpdated = async () => {
    await fetchEmployees();
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditOpen(true);
  };

  const handleDelete = async (cedula: string | undefined) => {
    if (!cedula || cedula.trim() === "") {
      console.error("Error: La cédula es inválida.");
      return;
    }

    try {
      await updateEmployeeStatus(cedula, "Inactivo");
      await fetchEmployees();
    } catch (error) {
      console.error("Error al cambiar estado del empleado:", error);
    }
  };

  const departments = Array.from(
    new Set(employees.map((employee) => employee.departamento))
  );

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Empleados</CardTitle>
            <CardDescription>
              Gestione empleados, sus posiciones, departamentos y desempeño.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="self-start bg-blue-600 sm:self-auto"
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar Empleado
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cédula, posición o departamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los departamentos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No se encontraron empleados.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Nombre
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Cédula
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Posición
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Departamento
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Estado
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Fecha de Inicio
                    </TableHead>

                    <TableHead className="font-semibold text-right whitespace-nowrap">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.cedula}>
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {employee.nombre}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {employee.cedula}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate">
                        {positionTranslations[employee.posicion] ||
                          employee.posicion}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          className={
                            departmentColors[employee.departamento] ||
                            "bg-gray-500 text-white"
                          }
                        >
                          {employee.departamento}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          className={
                            employee.status === "Activo"
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(employee.fechaInicio).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(employee)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(employee.cedula)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t py-4 px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-sm text-muted-foreground gap-2">
          <div>
            Mostrando {filteredEmployees.length} de {employees.length} empleados
          </div>
          {filteredEmployees.length > 0 && (
            <div className="font-medium">
              Total de salarios:{" "}
              {new Intl.NumberFormat("es-CR", {
                style: "currency",
                currency: "CRC",
              }).format(
                filteredEmployees.reduce((sum, emp) => sum + emp.salario, 0)
              )}
            </div>
          )}
        </div>
      </CardFooter>

      <EmployeesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEmployeeAdded={handleEmployeeUpdated}
      />

      {editingEmployee && (
        <EmployeesEdit
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onEmployeeUpdated={handleEmployeeUpdated}
          employee={editingEmployee}
        />
      )}
    </Card>
  );
}
