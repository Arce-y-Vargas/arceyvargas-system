"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Trash,
  Loader2,
  Search,
  Eye,
  Plus,
  Pencil,
  FileDown,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { deletePlanilla, getPlanillas, type PlanillaUI } from "@/lib/planilla";

import {
  exportToPDF,
  formatCurrency as exportFormatCurrency,
} from "@/lib/export-service";
import { PlanillaModal } from "./PlanillaModal";
import { PlanillaEditModal } from "./PlanillaEditModal";

export function PlanillaTable() {
  const [planillas, setPlanillas] = useState<PlanillaUI[]>([]);
  const [filteredPlanillas, setFilteredPlanillas] = useState<PlanillaUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedPlanilla, setSelectedPlanilla] = useState<PlanillaUI | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [planillaToEdit, setPlanillaToEdit] = useState<PlanillaUI | null>(null);

  useEffect(() => {
    fetchPlanillas();
  }, []);

  useEffect(() => {
    filterPlanillas();
  }, [planillas, searchQuery, filterPlanillas]);

  const fetchPlanillas = async () => {
    setLoading(true);
    try {
      const data = await getPlanillas();
      setPlanillas(data);
      setFilteredPlanillas(data);
    } catch (error) {
      console.error("Error al obtener planillas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlanillas = useCallback(() => {
    let filtered = [...planillas];

    if (searchQuery) {
      filtered = filtered.filter(
        (planilla) =>
          planilla.empleado.toLowerCase().includes(searchQuery.toLowerCase()) ||
          planilla.cedula.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPlanillas(filtered);
  }, [planillas, searchQuery]);

  const handleDelete = async (cedula: string) => {
    setDeleteLoading(cedula);
    try {
      await deletePlanilla(cedula);
      await fetchPlanillas();
    } catch (error) {
      console.error("Error al eliminar planilla:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleViewDetails = (planilla: PlanillaUI) => {
    setSelectedPlanilla(planilla);
    setIsDetailsOpen(true);
  };

  const handleEdit = (planilla: PlanillaUI) => {
    setPlanillaToEdit(planilla);
    setIsEditModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return `₡${value.toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getTotalSalarios = () => {
    return planillas.reduce((sum, planilla) => sum + planilla.total_pagar, 0);
  };

  const getTotalEmpleados = () => {
    return planillas.length;
  };

  const handleExportToPDF = () => {
    exportToPDF({
      title: "Reporte de Planillas",
      filename: "planillas_reporte",
      companyName: "Sistema de Planillas",
      columns: [
        { header: "Empleado", key: "empleado", width: 40 },
        { header: "Cédula", key: "cedula", width: 30 },
        { header: "Días", key: "dias", width: 15, align: "center" },
        {
          header: "Salario Semanal",
          key: "salario_semanal",
          width: 30,
          format: (value) => formatCurrency(value),
          align: "right",
        },
        {
          header: "Total Ingresos",
          key: "total_ingresos",
          width: 30,
          format: (value) => formatCurrency(value),
          align: "right",
        },
        {
          header: "Total Rebajas",
          key: "total_rebajas",
          width: 30,
          format: (value) => formatCurrency(value),
          align: "right",
        },
        {
          header: "Total a Pagar",
          key: "total_pagar",
          width: 30,
          format: (value) => formatCurrency(value),
          align: "right",
        },
      ],
      data: filteredPlanillas,
      summary: {
        title: "Resumen de Planillas",
        calculations: [
          {
            label: "Total de Planillas",
            value: filteredPlanillas.length,
          },
          {
            label: "Total a Pagar",
            value: getTotalSalarios(),
            format: (value) => exportFormatCurrency(value),
          },
        ],
      },
      styles: {
        primaryColor: [0, 90, 170],
        secondaryColor: [100, 100, 100],
        lightColor: [240, 240, 240],
      },
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Planillas
            </CardTitle>
            <CardDescription>
              Gestión de planillas y pagos de empleados
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleExportToPDF}
              variant="outline"
              className="text-red-600 border-red-600"
            >
              <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Nueva Planilla
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
                placeholder="Buscar por nombre o cédula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredPlanillas.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/50">
            <div className="mx-auto h-10 w-10 text-muted-foreground mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <p className="text-muted-foreground">
              No hay planillas registradas.
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
                      Cédula
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Días
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Salario Semanal
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Total Ingresos
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Total Rebajas
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Total a Pagar
                    </TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlanillas.map((planilla) => (
                    <TableRow key={planilla.cedula}>
                      <TableCell className="font-medium">
                        {planilla.empleado}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {planilla.cedula}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {planilla.dias}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatCurrency(planilla.salario_semanal)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatCurrency(planilla.total_ingresos)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatCurrency(planilla.total_rebajas)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium">
                        {formatCurrency(planilla.total_pagar)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(planilla)}
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(planilla)}
                          >
                            <Pencil className="h-4 w-4 text-amber-500" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={deleteLoading === planilla.cedula}
                              >
                                {deleteLoading === planilla.cedula ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash className="h-4 w-4 text-red-500" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-[95vw] max-w-[425px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Eliminar planilla
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Está seguro que desea eliminar la planilla de{" "}
                                  {planilla.empleado}? Esta acción no se puede
                                  deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                                <AlertDialogCancel className="w-full sm:w-auto">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(planilla.cedula)}
                                  className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      <CardFooter className="border-t py-4 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-sm text-muted-foreground gap-4">
          <div>
            Mostrando {filteredPlanillas.length} de {planillas.length} planillas
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 border-blue-200"
              >
                {getTotalEmpleados()}
              </Badge>
              <span>empleados</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200"
              >
                {formatCurrency(getTotalSalarios())}
              </Badge>
              <span>total a pagar</span>
            </div>
          </div>
        </div>
      </CardFooter>

      {/* Detalles de Planilla Modal */}
      {selectedPlanilla && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles de Planilla</DialogTitle>
              <DialogDescription>
                Información detallada de la planilla de{" "}
                {selectedPlanilla.empleado}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Información Personal
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Empleado:</div>
                  <div className="text-sm">{selectedPlanilla.empleado}</div>

                  <div className="text-sm font-medium">Cédula:</div>
                  <div className="text-sm">{selectedPlanilla.cedula}</div>

                  <div className="text-sm font-medium">Días Laborados:</div>
                  <div className="text-sm">{selectedPlanilla.dias}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Ingresos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Salario Semanal:</div>
                  <div className="text-sm">
                    {formatCurrency(selectedPlanilla.salario_semanal)}
                  </div>

                  <div className="text-sm font-medium">Horas Extras:</div>
                  <div className="text-sm">
                    {formatCurrency(selectedPlanilla.horas_extras)}
                  </div>

                  <div className="text-sm font-medium">Domingo/Feriado:</div>
                  <div className="text-sm">
                    {formatCurrency(selectedPlanilla.domingo_feriado)}
                  </div>

                  <div className="text-sm font-medium">Esfuerzo/Viáticos:</div>
                  <div className="text-sm">
                    {formatCurrency(selectedPlanilla.esfuerzo_viaticos)}
                  </div>

                  <div className="text-sm font-medium font-bold">
                    Total Ingresos:
                  </div>
                  <div className="text-sm font-bold">
                    {formatCurrency(selectedPlanilla.total_ingresos)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Deducciones
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">CCSS:</div>
                  <div className="text-sm">
                    {formatCurrency(selectedPlanilla.ccss)}
                  </div>

                  <div className="text-sm font-medium">No Laboró:</div>
                  <div className="text-sm">
                    {formatCurrency(selectedPlanilla.no_laboro)}
                  </div>

                  <div className="text-sm font-medium">Ahorros:</div>
                  <div className="text-sm">
                    {formatCurrency(selectedPlanilla.ahorros)}
                  </div>

                  <div className="text-sm font-medium">Caja Ahorro 1:</div>
                  <div className="text-sm">
                    {formatCurrency(selectedPlanilla.caja_ahorro_1)}
                  </div>

                  <div className="text-sm font-medium">Caja Ahorro 2:</div>
                  <div className="text-sm">
                    {formatCurrency(selectedPlanilla.caja_ahorro_2)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Rebajas y Total
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Rebajas 1:</div>
                  <div className="text-sm">
                    {formatCurrency(selectedPlanilla.rebajas_1)}
                  </div>

                  <div className="text-sm font-medium">Rebajas 2:</div>
                  <div className="text-sm">
                    {formatCurrency(selectedPlanilla.rebajas_2)}
                  </div>

                  <div className="text-sm font-medium font-bold">
                    Total Rebajas:
                  </div>
                  <div className="text-sm font-bold">
                    {formatCurrency(selectedPlanilla.total_rebajas)}
                  </div>

                  <div className="text-sm font-medium text-lg font-bold text-green-600">
                    Total a Pagar:
                  </div>
                  <div className="text-sm text-lg font-bold text-green-600">
                    {formatCurrency(selectedPlanilla.total_pagar)}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setIsDetailsOpen(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <PlanillaModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={fetchPlanillas}
      />

      {planillaToEdit && (
        <PlanillaEditModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSuccess={fetchPlanillas}
          planilla={planillaToEdit}
        />
      )}
    </Card>
  );
}
