"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserIcon,
  Phone,
  Mail,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface EmployeeData {
  cedula: string;
  nombre: string;
  email: string;
  telefono?: string;
  posicion: string;
  departamento: string;
  fechaInicio: string;
  salario: number;
  status: string;
}

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("🔥 Usuario autenticado:", user);
        await fetchEmployeeData(user.uid);
      } else {
        setEmployee(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchEmployeeData = async (uid: string) => {
    if (!uid) {
      console.warn("⚠️ UID inválido.");
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Buscando usuario en 'users' con UID:", uid);
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn("❌ No se encontró el usuario en Firestore.");
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      const cedula = userData.cedula;
      console.log("✅ Cédula obtenida del usuario:", cedula);

      console.log("🔍 Buscando empleado en 'employees' con cédula:", cedula);
      const employeeRef = doc(db, "employees", cedula);
      const employeeSnap = await getDoc(employeeRef);

      if (employeeSnap.exists()) {
        const employeeData = employeeSnap.data();
        console.log("✅ Datos del empleado encontrados:", employeeData);
        setEmployee({
          cedula,
          email: userData.email,
          ...employeeData,
        } as EmployeeData);
      } else {
        console.warn("❌ No se encontraron datos del empleado en Firestore.");
      }
    } catch (error) {
      console.error("❌ Error al obtener datos del empleado:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("es-CR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center p-4">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <h3 className="text-lg font-semibold text-red-700">
              No se encontraron datos
            </h3>
            <p className="text-red-600 mt-1">
              No se pudo encontrar la información del empleado en el sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${employee.nombre}`}
                alt={employee.nombre}
              />
              <AvatarFallback>{getInitials(employee.nombre)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{employee.nombre}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Briefcase className="h-4 w-4 mr-1" />
                {employee.posicion}
              </CardDescription>
            </div>
          </div>
          <Badge
            className={
              employee.status === "Activo"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }
          >
            {employee.status}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <Tabs defaultValue="personal" className="w-full">
        <div className="px-6 pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="laboral">Información Laboral</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="personal" className="p-0">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Cédula
                </div>
                <p className="font-medium">{employee.cedula}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </div>
                <p className="font-medium">{employee.email}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  Teléfono
                </div>
                <p className="font-medium">
                  {employee.telefono || "No registrado"}
                </p>
              </div>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="laboral" className="p-0">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 mr-2" />
                  Departamento
                </div>
                <div>
                  <Badge variant="outline" className="font-medium">
                    {employee.departamento}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Fecha de Inicio
                </div>
                <p className="font-medium">
                  {formatDate(employee.fechaInicio)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Salario
                </div>
                <p className="font-medium text-lg">
                  {new Intl.NumberFormat("es-CR", {
                    style: "currency",
                    currency: "CRC",
                  }).format(employee.salario)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  Antigüedad
                </div>
                <p className="font-medium">
                  {(() => {
                    const start = new Date(employee.fechaInicio);
                    const now = new Date();
                    const diffYears = now.getFullYear() - start.getFullYear();
                    const diffMonths = now.getMonth() - start.getMonth();

                    if (diffYears > 0) {
                      return `${diffYears} ${diffYears === 1 ? "año" : "años"}`;
                    } else if (diffMonths > 0) {
                      return `${diffMonths} ${
                        diffMonths === 1 ? "mes" : "meses"
                      }`;
                    } else {
                      return "Menos de un mes";
                    }
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
