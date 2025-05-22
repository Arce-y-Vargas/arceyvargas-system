"use client";

import { useEffect, useState } from "react";
import { getEmployeeVacations, deleteVacationRequest } from "@/lib/vacations";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash, Loader2, Search, Filter, Calendar } from "lucide-react";
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

interface Vacation {
  id: string;
  cedula: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  status: "pending" | "approved" | "rejected";
  reason?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500 text-white",
  approved: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white",
};

export function VacationTable() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [filteredVacations, setFilteredVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCedula, setUserCedula] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const cedula = userDoc.data().cedula;
          setUserCedula(cedula);
          setUserName(userDoc.data().nombre || user.displayName);
          fetchVacations(cedula);
        }
      } else {
        setUserCedula(null);
        setUserName(null);
        setVacations([]);
        setFilteredVacations([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterVacations();
  }, [vacations, searchQuery, statusFilter]);

  const fetchVacations = async (cedula: string) => {
    setLoading(true);
    try {
      const data = await getEmployeeVacations(cedula);
      setVacations(data);
      setFilteredVacations(data);
    } catch (error) {
      console.error("Error al obtener vacaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterVacations = () => {
    let filtered = [...vacations];

    // Aplicar filtro de búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (vacation) =>
          vacation.startDate
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          vacation.endDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vacation.reason &&
            vacation.reason.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Aplicar filtro de estado
    if (statusFilter !== "todos") {
      filtered = filtered.filter(
        (vacation) => vacation.status === statusFilter
      );
    }

    setFilteredVacations(filtered);
  };

  const handleDelete = async (vacationId: string) => {
    setDeleteLoading(vacationId);
    try {
      await deleteVacationRequest(vacationId);
      if (userCedula) fetchVacations(userCedula);
    } catch (error) {
      console.error("Error al eliminar solicitud:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "approved":
        return "Aprobado";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };

  const getPendingVacations = () => {
    return vacations.filter((v) => v.status === "pending").length;
  };

  const getApprovedDays = () => {
    return vacations
      .filter((v) => v.status === "approved")
      .reduce((sum, v) => sum + v.requestedDays, 0);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Mis Vacaciones
            </CardTitle>
            <CardDescription>
              Historial y estado de sus solicitudes de vacaciones
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por fechas o motivo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobados</SelectItem>
                  <SelectItem value="rejected">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredVacations.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/50">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No tienes solicitudes de vacaciones registradas.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Fecha Inicio
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Fecha Fin
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Días
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Estado
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Motivo
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVacations.map((vac) => (
                    <TableRow key={vac.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(vac.startDate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(vac.endDate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {vac.requestedDays}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          className={
                            statusColors[vac.status] || "bg-gray-500 text-white"
                          }
                        >
                          {getStatusLabel(vac.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {vac.reason || "—"}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {vac.status === "pending" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={deleteLoading === vac.id}
                              >
                                {deleteLoading === vac.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash className="h-4 w-4 text-red-500" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-[95vw] max-w-[425px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Cancelar solicitud
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Está seguro que desea cancelar esta solicitud
                                  de vacaciones? Esta acción no se puede
                                  deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                                <AlertDialogCancel className="w-full sm:w-auto">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(vac.id)}
                                  className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
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
            Mostrando {filteredVacations.length} de {vacations.length}{" "}
            solicitudes
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 border-yellow-200"
              >
                {getPendingVacations()}
              </Badge>
              <span>pendientes</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200"
              >
                {getApprovedDays()}
              </Badge>
              <span>días aprobados</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
