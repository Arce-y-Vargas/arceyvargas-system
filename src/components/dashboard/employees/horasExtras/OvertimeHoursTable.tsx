"use client";

import { useEffect, useState } from "react";
import { Pencil, Search, Filter, Clock } from "lucide-react";
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
import { getEmployees } from "@/lib/employees";
import { getHorasExtras, initializeHorasExtras } from "@/lib/horasExtras";
import OvertimeEditModal from "./OvertimeEditModalProps";

interface HorasExtras {
  cedula: string;
  nombre: string;
  lunes: number;
  martes: number;
  miércoles: number;
  jueves: number;
  viernes: number;
  sábado: number;
  domingo: number;
}

interface Employee {
  cedula: string;
  nombre: string;
  departamento: string;
  status: string;
}

export default function OvertimeHoursTable() {
  const [overtimeRecords, setOvertimeRecords] = useState<HorasExtras[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HorasExtras[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HorasExtras | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [overtimeRecords, searchQuery, departmentFilter, statusFilter, employees]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await initializeHorasExtras();

      const employeesData = await getEmployees();
      setEmployees(employeesData);

      const records = await getHorasExtras();
      setOvertimeRecords(records);
      setFilteredRecords(records);
    } catch (error) {
      console.error("Error al obtener registros de horas extras:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecords = () => {
    if (!overtimeRecords.length || !employees.length) return;

    let filtered = [...overtimeRecords];

    if (searchQuery) {
      filtered = filtered.filter(
        (record) =>
          record.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.cedula.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply department filter
    if (departmentFilter !== "todos") {
      const employeesInDept = employees
        .filter((emp) => emp.departamento === departmentFilter)
        .map((emp) => emp.cedula);

      filtered = filtered.filter((record) =>
        employeesInDept.includes(record.cedula)
      );
    }

    // Apply status filter
    if (statusFilter !== "todos") {
      const employeesWithStatus = employees
        .filter((emp) => emp.status === statusFilter)
        .map((emp) => emp.cedula);

      filtered = filtered.filter((record) =>
        employeesWithStatus.includes(record.cedula)
      );
    }

    setFilteredRecords(filtered);
  };

  const handleRecordUpdated = async () => {
    await fetchData();
  };

  const handleEdit = (record: HorasExtras) => {
    setEditingRecord(record);
    setIsEditOpen(true);
  };

  const calculateTotalHours = (record: HorasExtras): number => {
    return (
      record.lunes +
      record.martes +
      record.miércoles +
      record.jueves +
      record.viernes +
      record.sábado +
      record.domingo
    );
  };

  const calculateGrandTotal = (): number => {
    return filteredRecords.reduce(
      (sum, record) => sum + calculateTotalHours(record),
      0
    );
  };

  const departments = Array.from(
    new Set(employees.map((employee) => employee.departamento))
  );

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Horas Extras</CardTitle>
            <CardDescription>
              Gestione las horas extras trabajadas por cada empleado.
            </CardDescription>
          </div>
          <Button
            onClick={() => initializeHorasExtras().then(fetchData)}
            className="self-start bg-blue-600 sm:self-auto"
          >
            <Clock className="mr-2 h-4 w-4" /> Sincronizar Empleados
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o cédula..."
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
        ) : filteredRecords.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No se encontraron registros de horas extras.
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
                    <TableHead className="font-semibold whitespace-nowrap text-center">
                      Lunes
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap text-center">
                      Martes
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap text-center">
                      Miércoles
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap text-center">
                      Jueves
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap text-center">
                      Viernes
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap text-center">
                      Sábado
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap text-center">
                      Domingo
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap text-center">
                      Total
                    </TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const totalHours = calculateTotalHours(record);
                    const employee = employees.find(
                      (e) => e.cedula === record.cedula
                    );

                    return (
                      <TableRow key={record.cedula}>
                        <TableCell className="font-medium max-w-[150px] truncate">
                          {record.nombre}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {record.cedula}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.lunes > 0 && (
                            <Badge className="bg-blue-500 text-white">
                              {record.lunes}
                            </Badge>
                          )}
                          {record.lunes === 0 && "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.martes > 0 && (
                            <Badge className="bg-blue-500 text-white">
                              {record.martes}
                            </Badge>
                          )}
                          {record.martes === 0 && "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.miércoles > 0 && (
                            <Badge className="bg-blue-500 text-white">
                              {record.miércoles}
                            </Badge>
                          )}
                          {record.miércoles === 0 && "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.jueves > 0 && (
                            <Badge className="bg-blue-500 text-white">
                              {record.jueves}
                            </Badge>
                          )}
                          {record.jueves === 0 && "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.viernes > 0 && (
                            <Badge className="bg-blue-500 text-white">
                              {record.viernes}
                            </Badge>
                          )}
                          {record.viernes === 0 && "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.sábado > 0 && (
                            <Badge className="bg-orange-500 text-white">
                              {record.sábado}
                            </Badge>
                          )}
                          {record.sábado === 0 && "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.domingo > 0 && (
                            <Badge className="bg-red-500 text-white">
                              {record.domingo}
                            </Badge>
                          )}
                          {record.domingo === 0 && "-"}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {totalHours > 0 ? (
                            <Badge className="bg-green-600 text-white">
                              {totalHours}
                            </Badge>
                          ) : (
                            "0"
                          )}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(record)}
                              disabled={employee?.status === "Inactivo"}
                            >
                              <Pencil className="h-4 w-4 text-blue-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t py-4 px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-sm text-muted-foreground gap-2">
          <div>
            Mostrando {filteredRecords.length} de {overtimeRecords.length}{" "}
            registros
          </div>
          {filteredRecords.length > 0 && (
            <div className="font-medium">
              Total de horas extras:{" "}
              <span className="text-green-600">{calculateGrandTotal()}</span>
            </div>
          )}
        </div>
      </CardFooter>

      {editingRecord && (
        <OvertimeEditModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onRecordUpdated={handleRecordUpdated}
          record={editingRecord}
        />
      )}
    </Card>
  );
}
