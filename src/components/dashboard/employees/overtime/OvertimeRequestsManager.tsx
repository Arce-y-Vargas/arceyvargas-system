"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  getOvertimeRequests,
  updateOvertimeRequestStatus,
  OvertimeRequest,
} from "@/lib/overtimeRequests";

interface OvertimeRequestsManagerProps {
  managerId: string;
  managerName: string;
}

export default function OvertimeRequestsManager({
  managerName,
}: OvertimeRequestsManagerProps) {
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<OvertimeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCedula = (cedula: string) => {
    // Limpiar caracteres especiales y espacios
    const cleaned = cedula.replace(/[^\d-]/g, '');
    return cleaned;
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getOvertimeRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching overtime requests:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchQuery) {
      filtered = filtered.filter(
        (request) =>
          request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleStatusUpdate = async (
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    setIsProcessing(true);
    try {
      await updateOvertimeRequestStatus(
        requestId,
        status,
        managerName,
        reviewComments.trim() || undefined
      );

      toast({
        title: status === "approved" ? "Solicitud aprobada" : "Solicitud rechazada",
        description: `La solicitud ha sido ${
          status === "approved" ? "aprobada" : "rechazada"
        } exitosamente.`,
      });

      setReviewComments("");
      await fetchRequests();
    } catch (error) {
      console.error("Error updating request status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la solicitud.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobada
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazada
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
    }
  };

  const RequestDetailModal = ({ request }: { request: OvertimeRequest }) => (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Solicitud de {request.employeeName}
        </DialogTitle>
        <DialogDescription>
          {format(request.date, "dd 'de' MMMM 'de' yyyy", { locale: es })} • {request.overtimeHours.toFixed(2)} horas extra
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Empleado</p>
            <p className="text-lg">{request.employeeName}</p>
            <p className="text-sm text-gray-500">ID: {formatCedula(request.employeeId)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Estado actual</p>
            <div className="mt-1">
              {getStatusBadge(request.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Fecha</p>
            <p className="text-lg">
              {format(request.date, "dd/MM/yyyy", { locale: es })}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Horario</p>
            <p className="text-lg">
              {request.startTime} - {request.endTime}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Lugar de trabajo
          </p>
          <p className="text-lg">{request.location}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Descripción del trabajo</p>
          <div className="mt-2 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {request.description}
            </p>
          </div>
        </div>

        {request.photoEvidence && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Evidencia fotográfica</p>
            <img
              src={request.photoEvidence}
              alt="Evidencia"
              className="max-w-full h-64 object-contain border border-border rounded-lg bg-background"
            />
          </div>
        )}

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Solicitud enviada</p>
              <p className="text-sm">
                {format(request.submittedAt, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Horas extra totales</p>
              <p className="text-lg font-semibold text-blue-600">
                {request.overtimeHours.toFixed(2)} horas
              </p>
            </div>
          </div>
        </div>

        {request.reviewedAt && (
          <div className="border-t pt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-1 text-foreground">
              <MessageSquare className="h-4 w-4" />
              Revisión del gerente
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revisada por</p>
                <p className="text-sm text-foreground">{request.reviewedBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de revisión</p>
                <p className="text-sm text-foreground">
                  {format(request.reviewedAt, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            </div>
            {request.reviewComments && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comentarios</p>
                <p className="text-sm text-foreground whitespace-pre-wrap bg-background p-2 rounded border border-border">
                  {request.reviewComments}
                </p>
              </div>
            )}
          </div>
        )}

        {request.status === "pending" && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <Label htmlFor="comments">Comentarios (opcional)</Label>
              <Textarea
                id="comments"
                placeholder="Agregue comentarios sobre esta solicitud..."
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Aprobar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Aprobar solicitud</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Está seguro de que desea aprobar esta solicitud de horas extra?
                      Las horas se agregarán al registro del empleado.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleStatusUpdate(request.id!, "approved")}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? "Procesando..." : "Aprobar"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="w-4 h-4 mr-1" />
                    Rechazar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Rechazar solicitud</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Está seguro de que desea rechazar esta solicitud de horas extra?
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleStatusUpdate(request.id!, "rejected")}
                      disabled={isProcessing}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isProcessing ? "Procesando..." : "Rechazar"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Solicitudes de Horas Extra
            </CardTitle>
            <CardDescription>
              Revise y apruebe las solicitudes de horas extra de los empleados
            </CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-gray-600">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              <div className="text-gray-600">Aprobadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
              <div className="text-gray-600">Rechazadas</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empleado, ID o lugar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobadas</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center p-8 border border-border rounded-lg bg-muted/50 dark:bg-muted/20">
            <p className="text-muted-foreground">
              {requests.length === 0
                ? "No hay solicitudes de horas extra."
                : "No se encontraron solicitudes con los filtros aplicados."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Lugar</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Enviada</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow 
                      key={request.id}
                      className={request.status === 'pending' ? 'bg-yellow-50' : ''}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-medium">{request.employeeName}</p>
                          <p className="text-xs text-gray-500">{formatCedula(request.employeeId)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(request.date, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {request.startTime} - {request.endTime}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {request.location}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Badge variant="outline" className="bg-blue-50">
                          {request.overtimeHours.toFixed(2)}h
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        {format(request.submittedAt, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {request.status === 'pending' ? 'Revisar' : 'Ver'}
                            </Button>
                          </DialogTrigger>
                          {selectedRequest && (
                            <RequestDetailModal request={selectedRequest} />
                          )}
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}