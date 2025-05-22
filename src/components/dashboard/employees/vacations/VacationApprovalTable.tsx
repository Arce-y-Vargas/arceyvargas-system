"use client";

import { useEffect, useState } from "react";
import { Search, Filter, ArrowLeft, Check, X, Eye } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getVacations, updateVacationStatus } from "@/lib/vacations";
import { getEmployees } from "@/lib/employees";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

interface Vacation {
  id?: string;
  cedula: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface Employee {
  cedula: string;
  nombre: string;
  departamento: string;
  status: string;
}

export default function VacationApprovalTable() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [filteredVacations, setFilteredVacations] = useState<Vacation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [departmentFilter, setDepartmentFilter] = useState("todos");
  const [selectedVacation, setSelectedVacation] = useState<Vacation | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterVacations();
  }, [vacations, searchQuery, statusFilter, departmentFilter, employees]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Get employees for name display and filtering
      const employeesData = await getEmployees();
      setEmployees(employeesData);

      // Get vacation requests
      const vacationsData = await getVacations();
      setVacations(vacationsData);
      setFilteredVacations(vacationsData);
    } catch (error) {
      console.error("Error al obtener solicitudes de vacaciones:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes de vacaciones",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterVacations = () => {
    if (!vacations.length) return;

    let filtered = [...vacations];

    if (searchQuery) {
      const employeeMatches = employees
        .filter(
          (employee) =>
            employee.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.cedula.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((emp) => emp.cedula);

      filtered = filtered.filter(
        (vacation) =>
          employeeMatches.includes(vacation.cedula) ||
          vacation.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "todos") {
      filtered = filtered.filter(
        (vacation) => vacation.status === statusFilter
      );
    }

    // Apply department filter
    if (departmentFilter !== "todos") {
      const employeesInDept = employees
        .filter((emp) => emp.departamento === departmentFilter)
        .map((emp) => emp.cedula);

      filtered = filtered.filter((vacation) =>
        employeesInDept.includes(vacation.cedula)
      );
    }

    setFilteredVacations(filtered);
  };

  const handleViewDetails = (vacation: Vacation) => {
    setSelectedVacation(vacation);
    setIsDetailsOpen(true);
  };

  const handleApproveReject = (
    vacation: Vacation,
    action: "approve" | "reject"
  ) => {
    setSelectedVacation(vacation);
    setActionType(action);
    setIsConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedVacation?.id || !actionType) return;

    setIsProcessing(true);
    try {
      // In a real app, you would get the current user's ID
      const approverName = "Admin"; // This would come from auth.currentUser

      await updateVacationStatus(
        selectedVacation.id,
        actionType === "approve" ? "approved" : "rejected",
        approverName
      );

      toast({
        title:
          actionType === "approve"
            ? "Solicitud aprobada"
            : "Solicitud rechazada",
        description: `La solicitud de vacaciones ha sido ${
          actionType === "approve" ? "aprobada" : "rechazada"
        } exitosamente.`,
      });

      await fetchData();
      setIsConfirmOpen(false);
    } catch (error) {
      console.error(
        `Error al ${
          actionType === "approve" ? "aprobar" : "rechazar"
        } la solicitud:`,
        error
      );
      toast({
        title: "Error",
        description: `No se pudo ${
          actionType === "approve" ? "aprobar" : "rechazar"
        } la solicitud.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getEmployeeName = (cedula: string): string => {
    const employee = employees.find((emp) => emp.cedula === cedula);
    return employee ? employee.nombre : cedula;
  };

  const getEmployeeDepartment = (cedula: string): string => {
    const employee = employees.find((emp) => emp.cedula === cedula);
    return employee ? employee.departamento : "";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const departments = Array.from(
    new Set(employees.map((employee) => employee.departamento))
  );

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Solicitudes de Vacaciones
              </CardTitle>
              <CardDescription>
                Gestione y apruebe las solicitudes de vacaciones de los
                empleados.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              className="self-start sm:self-auto"
              asChild
            >
              <Link href="/dashboard/employees">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Empleados
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, cédula o motivo..."
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
                    <SelectItem value="todos">
                      Todos los departamentos
                    </SelectItem>
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
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="approved">Aprobadas</SelectItem>
                    <SelectItem value="rejected">Rechazadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredVacations.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/50">
              <p className="text-muted-foreground">
                No se encontraron solicitudes de vacaciones.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Empleado
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Departamento
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Fecha Inicio
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Fecha Fin
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap text-center">
                        Días
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Estado
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Motivo
                      </TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVacations.map((vacation) => (
                      <TableRow key={vacation.id}>
                        <TableCell className="font-medium max-w-[150px] truncate">
                          {getEmployeeName(vacation.cedula)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {getEmployeeDepartment(vacation.cedula)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(vacation.startDate)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(vacation.endDate)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-500 text-white">
                            {vacation.requestedDays}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            className={
                              vacation.status === "approved"
                                ? "bg-green-500 text-white"
                                : vacation.status === "rejected"
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-black"
                            }
                          >
                            {vacation.status === "approved"
                              ? "Aprobada"
                              : vacation.status === "rejected"
                              ? "Rechazada"
                              : "Pendiente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {vacation.reason}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewDetails(vacation)}
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                            </Button>
                            {vacation.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleApproveReject(vacation, "approve")
                                  }
                                  title="Aprobar"
                                >
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleApproveReject(vacation, "reject")
                                  }
                                  title="Rechazar"
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
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
              Mostrando {filteredVacations.length} de {vacations.length}{" "}
              solicitudes
            </div>
            <div className="font-medium">
              Total días solicitados:{" "}
              <span className="text-blue-600">
                {filteredVacations.reduce(
                  (sum, vacation) => sum + vacation.requestedDays,
                  0
                )}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles de Solicitud</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud de vacaciones
            </DialogDescription>
          </DialogHeader>

          {selectedVacation && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Empleado
                  </p>
                  <p className="text-base font-semibold">
                    {getEmployeeName(selectedVacation.cedula)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Departamento
                  </p>
                  <p className="text-base font-semibold">
                    {getEmployeeDepartment(selectedVacation.cedula)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fecha de inicio
                  </p>
                  <p className="text-base font-semibold">
                    {formatDate(selectedVacation.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fecha de fin
                  </p>
                  <p className="text-base font-semibold">
                    {formatDate(selectedVacation.endDate)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Días solicitados
                  </p>
                  <p className="text-base font-semibold">
                    {selectedVacation.requestedDays}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Estado
                  </p>
                  <Badge
                    className={
                      selectedVacation.status === "approved"
                        ? "bg-green-500 text-white"
                        : selectedVacation.status === "rejected"
                        ? "bg-red-500 text-white"
                        : "bg-yellow-500 text-black"
                    }
                  >
                    {selectedVacation.status === "approved"
                      ? "Aprobada"
                      : selectedVacation.status === "rejected"
                      ? "Rechazada"
                      : "Pendiente"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Motivo
                </p>
                <p className="text-base">{selectedVacation.reason}</p>
              </div>

              {selectedVacation.approvedBy && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Aprobado por
                    </p>
                    <p className="text-base font-semibold">
                      {selectedVacation.approvedBy}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Fecha de aprobación
                    </p>
                    <p className="text-base font-semibold">
                      {selectedVacation.approvedAt
                        ? formatDate(selectedVacation.approvedAt)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>Cerrar</Button>
            {selectedVacation?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleApproveReject(selectedVacation, "approve");
                  }}
                >
                  <Check className="mr-2 h-4 w-4" /> Aprobar
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleApproveReject(selectedVacation, "reject");
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Rechazar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Aprobar Solicitud"
                : "Rechazar Solicitud"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "¿Está seguro que desea aprobar esta solicitud de vacaciones?"
                : "¿Está seguro que desea rechazar esta solicitud de vacaciones?"}
            </DialogDescription>
          </DialogHeader>

          {selectedVacation && (
            <div className="py-4">
              <p>
                <span className="font-medium">Empleado:</span>{" "}
                {getEmployeeName(selectedVacation.cedula)}
              </p>
              <p>
                <span className="font-medium">Período:</span>{" "}
                {formatDate(selectedVacation.startDate)} -{" "}
                {formatDate(selectedVacation.endDate)}
              </p>
              <p>
                <span className="font-medium">Días:</span>{" "}
                {selectedVacation.requestedDays}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmAction}
              disabled={isProcessing}
              className={
                actionType === "approve" ? "bg-green-600" : "bg-red-600"
              }
            >
              {isProcessing
                ? "Procesando..."
                : actionType === "approve"
                ? "Aprobar"
                : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
