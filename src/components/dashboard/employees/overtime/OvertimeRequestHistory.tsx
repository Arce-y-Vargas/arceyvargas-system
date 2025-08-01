"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock,
  MapPin,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getOvertimeRequests, OvertimeRequest } from "@/lib/overtimeRequests";

interface OvertimeRequestHistoryProps {
  employeeId: string;
}

export default function OvertimeRequestHistory({
  employeeId,
}: OvertimeRequestHistoryProps) {
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);

  const formatCedula = (cedula: string) => {
    // Limpiar caracteres especiales y espacios
    const cleaned = cedula.replace(/[^\d-]/g, '');
    return cleaned;
  };

  useEffect(() => {
    fetchRequests();
  }, [employeeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getOvertimeRequests({ employeeId });
      setRequests(data);
    } catch (error) {
      console.error("Error fetching overtime requests:", error);
    } finally {
      setIsLoading(false);
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
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Detalles del registro</DialogTitle>
        <DialogDescription>
          Registro del {format(request.date, "dd 'de' MMMM 'de' yyyy", { locale: es })}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Fecha</p>
            <p className="text-lg">
              {format(request.date, "dd/MM/yyyy", { locale: es })}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Estado</p>
            <div className="mt-1">
              {getStatusBadge(request.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Horario</p>
            <p className="text-lg">
              {request.startTime} - {request.endTime}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Horas extra</p>
            <p className="text-lg font-semibold text-blue-600">
              {request.overtimeHours.toFixed(2)} horas
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Lugar
          </p>
          <p className="text-lg">{request.location}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Descripción</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {request.description}
          </p>
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

        <div>
          <p className="text-sm font-medium text-muted-foreground">Enviada el</p>
          <p className="text-sm text-foreground">
            {format(request.submittedAt, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
          </p>
        </div>

        {request.reviewedAt && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Revisión del gerente</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Revisada por</p>
                <p className="text-sm">{request.reviewedBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha de revisión</p>
                <p className="text-sm">
                  {format(request.reviewedAt, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            </div>
            {request.reviewComments && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-600">Comentarios</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {request.reviewComments}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DialogContent>
  );

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historial de Registros
        </CardTitle>
        <CardDescription>
          Revise el estado de sus registros de horas extra
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center p-8 border border-border rounded-lg bg-muted/50 dark:bg-muted/20">
            <p className="text-muted-foreground">
              No has enviado registros de horas extra aún.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
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
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {format(request.date, "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      {request.startTime} - {request.endTime}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {request.location}
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.overtimeHours.toFixed(2)}h
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
                            Ver
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
        )}
      </CardContent>
    </Card>
  );
}