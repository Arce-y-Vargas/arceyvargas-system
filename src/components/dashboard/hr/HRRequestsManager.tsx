"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Clock,
  MessageSquare,
  UserPlus,
  Edit,
  DollarSign,
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
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getHRRequests,
  updateHRRequestStatus,
  HRRequest,
  getRequestTypeLabel,
  getStatusLabel,
} from "@/lib/hrRequests";

interface HRRequestsManagerProps {
  userId: string;
  userName: string;
}

export default function HRRequestsManager({
  userId,
  userName,
}: HRRequestsManagerProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HRRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<HRRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<HRRequest | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    fetchRequests();
    fetchUserRole();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, statusFilter, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const cedula = userData.cedula;
        
        if (cedula) {
          const employeeDoc = await getDoc(doc(db, "employees", cedula));
          
          if (employeeDoc.exists()) {
            const employeeData = employeeDoc.data();
            const role = employeeData.posicion || "operators";
            setUserRole(role);
          } else {
            console.warn("No employee data found for cedula:", cedula);
            setUserRole("operators");
          }
        } else {
          console.warn("No cedula found in user data");
          setUserRole("operators");
        }
      } else {
        console.warn("No user document found");
        setUserRole("operators");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole("operators");
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getHRRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching HR requests:", error);
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
          request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.requestedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((request) => request.type === typeFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleApproval = async (
    requestId: string,
    action: 'approve_gm' | 'approve_hr' | 'reject'
  ) => {
    setIsProcessing(true);
    try {
      await updateHRRequestStatus(
        requestId,
        action,
        userName,
        userRole,
        reviewComments.trim() || undefined
      );

      const actionText = action === 'approve_gm' ? 'aprobada por Gerente General' : 
                        action === 'approve_hr' ? 'aprobada por RRHH' : 'rechazada';

      toast({
        title: `Solicitud ${actionText}`,
        description: `La solicitud ha sido ${actionText} exitosamente.`,
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

  const getStatusBadge = (request: HRRequest) => {
    switch (request.status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobada
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazada
          </Badge>
        );
      case "approved_by_gm":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobada por GM
          </Badge>
        );
      case "approved_by_hr":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobada por RRHH
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'add_employee':
        return <UserPlus className="h-4 w-4" />;
      case 'salary_change':
        return <DollarSign className="h-4 w-4" />;
      case 'edit_employee':
      case 'position_change':
      case 'department_change':
      case 'status_change':
        return <Edit className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const canApproveAsGM = (request: HRRequest) => {
    // Permitir aprobación si es gerente general o si el userName contiene indicadores de gerencia
    const isGM = userRole === 'general-manager' || 
                 userName.toLowerCase().includes('gerente') ||
                 userName.toLowerCase().includes('manager');
    
    return isGM && 
           (request.status === 'pending' || request.status === 'approved_by_hr') && 
           !request.generalManagerApproval;
  };

  const canApproveAsHR = (request: HRRequest) => {
    // Permitir aprobación si es RRHH o si el userName contiene indicadores de RRHH
    const isHR = userRole === 'rrhh' || 
                 userName.toLowerCase().includes('rrhh') ||
                 userName.toLowerCase().includes('recursos');
    
    return isHR && 
           (request.status === 'pending' || request.status === 'approved_by_gm') && 
           !request.hrApproval;
  };

  const canReject = (request: HRRequest) => {
    const isGM = userRole === 'general-manager' || 
                 userName.toLowerCase().includes('gerente') ||
                 userName.toLowerCase().includes('manager');
    const isHR = userRole === 'rrhh' || 
                 userName.toLowerCase().includes('rrhh') ||
                 userName.toLowerCase().includes('recursos');
    
    return (isGM || isHR) &&
           request.status !== 'approved' && 
           request.status !== 'rejected';
  };

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      'cedula': 'Cédula',
      'nombre': 'Nombre',
      'posicion': 'Posición',
      'departamento': 'Departamento',
      'fechaInicio': 'Fecha de Inicio',
      'salario': 'Salario',
      'status': 'Estado',
      'vacaciones': 'Días de Vacaciones',
    };
    return labels[key] || key;
  };

  const formatFieldValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (key) {
      case 'salario':
        return `$${Number(value).toLocaleString('es-CR')}`;
      case 'posicion':
        const positionLabels: Record<string, string> = {
          'general-manager': 'Gerente General',
          'admin-financial-manager': 'Gerente Financiero',
          'operations-manager': 'Gerente de Operaciones',
          'plant-manager': 'Gerente de Planta',
          'admin-assistant': 'Asistente Administrativo',
          'rrhh': 'Recursos Humanos',
          'warehouse-staff': 'Personal de Almacén',
          'operators': 'Operador',
        };
        return positionLabels[value] || value;
      case 'status':
        return value === 'Activo' ? 'Activo' : 'Inactivo';
      case 'fechaInicio':
        try {
          return new Date(value).toLocaleDateString('es-CR');
        } catch {
          return value;
        }
      default:
        return String(value);
    }
  };

  const RequestDetailModal = ({ request }: { request: HRRequest }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {getTypeIcon(request.type)}
          {request.title}
        </DialogTitle>
        <DialogDescription>
          Solicitud de {getRequestTypeLabel(request.type)} • {format(request.submittedAt, "dd 'de' MMMM 'de' yyyy", { locale: es })}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Solicitado por</p>
            <p className="text-lg text-foreground">{request.requestedByName}</p>
            <p className="text-sm text-muted-foreground">{request.requestedByRole}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Estado actual</p>
            <div className="mt-1">
              {getStatusBadge(request)}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Descripción</p>
          <div className="mt-2 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {request.description}
            </p>
          </div>
        </div>

        {request.currentData && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Datos actuales</p>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="space-y-2">
                {Object.entries(request.currentData).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium capitalize">{getFieldLabel(key)}:</span>
                    <span>{formatFieldValue(key, value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Datos propuestos</p>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="space-y-2">
              {Object.entries(request.proposedData).filter(([key]) => key !== 'password').map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium capitalize">{getFieldLabel(key)}:</span>
                  <span>{formatFieldValue(key, value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aprobaciones */}
        {(request.generalManagerApproval || request.hrApproval) && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-foreground">Aprobaciones</h4>
            
            {request.generalManagerApproval && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-foreground">Gerente General</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Aprobado por {request.generalManagerApproval.approvedBy} el{' '}
                  {format(request.generalManagerApproval.approvedAt, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
                {request.generalManagerApproval.comments && (
                  <p className="text-sm text-foreground mt-2 bg-background p-2 rounded border border-border">
                    {request.generalManagerApproval.comments}
                  </p>
                )}
              </div>
            )}

            {request.hrApproval && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-foreground">Recursos Humanos</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Aprobado por {request.hrApproval.approvedBy} el{' '}
                  {format(request.hrApproval.approvedAt, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
                {request.hrApproval.comments && (
                  <p className="text-sm text-foreground mt-2 bg-background p-2 rounded border border-border">
                    {request.hrApproval.comments}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {request.status === 'rejected' && (
          <div className="border-t pt-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-foreground">Rechazada</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Rechazada por {request.rejectedBy} el{' '}
                {request.rejectedAt && format(request.rejectedAt, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
              </p>
              {request.rejectionReason && (
                <p className="text-sm text-foreground mt-2 bg-background p-2 rounded border border-border">
                  {request.rejectionReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Acciones de aprobación */}
        {(canApproveAsGM(request) || canApproveAsHR(request) || canReject(request) || request.status === 'pending') && (
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
              {(canApproveAsGM(request) || (!request.generalManagerApproval && request.status === 'pending')) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprobar (GM)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Aprobar como Gerente General</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Está seguro de que desea aprobar esta solicitud como Gerente General?
                        {!request.hrApproval && " Aún necesitará aprobación de RRHH."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleApproval(request.id!, "approve_gm")}
                        disabled={isProcessing}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isProcessing ? "Procesando..." : "Aprobar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {(canApproveAsHR(request) || (!request.hrApproval && request.status === 'pending')) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprobar (RRHH)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Aprobar como RRHH</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Está seguro de que desea aprobar esta solicitud como RRHH?
                        {!request.generalManagerApproval && " Aún necesitará aprobación del Gerente General."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleApproval(request.id!, "approve_hr")}
                        disabled={isProcessing}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isProcessing ? "Procesando..." : "Aprobar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {(canReject(request) || request.status === 'pending') && (
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
                        ¿Está seguro de que desea rechazar esta solicitud?
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleApproval(request.id!, "reject")}
                        disabled={isProcessing}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isProcessing ? "Procesando..." : "Rechazar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
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
              <FileText className="h-6 w-6" />
              Solicitudes de RRHH
            </CardTitle>
            <CardDescription>
              Gestione las solicitudes que requieren aprobación dual (GM + RRHH)
              <br />
              <span className="text-sm font-medium">Rol actual: {userRole || 'Cargando...'}</span>
            </CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-gray-600 dark:text-gray-400">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              <div className="text-gray-600 dark:text-gray-400">Aprobadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
              <div className="text-gray-600 dark:text-gray-400">Rechazadas</div>
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
                placeholder="Buscar por título, solicitante o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved_by_gm">Aprobadas por GM</SelectItem>
                  <SelectItem value="approved_by_hr">Aprobadas por RRHH</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="add_employee">Agregar Empleado</SelectItem>
                  <SelectItem value="edit_employee">Editar Empleado</SelectItem>
                  <SelectItem value="salary_change">Cambio Salario</SelectItem>
                  <SelectItem value="position_change">Cambio Posición</SelectItem>
                  <SelectItem value="department_change">Cambio Departamento</SelectItem>
                  <SelectItem value="status_change">Cambio Estado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center p-8 border border-border rounded-lg bg-muted/50 dark:bg-muted/20">
            <p className="text-muted-foreground">
              {requests.length === 0
                ? "No hay solicitudes de RRHH."
                : "No se encontraron solicitudes con los filtros aplicados."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow 
                      key={request.id}
                      className={request.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(request.type)}
                          <span className="text-sm">{getRequestTypeLabel(request.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {request.title}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.requestedByName}</p>
                          <p className="text-xs text-muted-foreground">{request.requestedByRole}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request)}
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