"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrapper } from "@/components/utils/Wrapper";
import OvertimeRequestForm from "@/components/dashboard/employees/overtime/OvertimeRequestForm";
import OvertimeRequestHistory from "@/components/dashboard/employees/overtime/OvertimeRequestHistory";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function OvertimeRequestPage() {
  const { user } = useAuth();
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [employeeData, setEmployeeData] = useState<{cedula: string, nombre: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (user) {
        try {
          // Obtener datos del usuario de la colección 'users'
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const cedula = userData.cedula;
            
            // Obtener datos del empleado de la colección 'employees'
            const employeeRef = doc(db, "employees", cedula);
            const employeeSnap = await getDoc(employeeRef);
            
            if (employeeSnap.exists()) {
              const empData = employeeSnap.data();
              setEmployeeData({
                cedula: cedula,
                nombre: empData.nombre
              });
            }
          }
        } catch (error) {
          console.error("Error fetching employee data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEmployeeData();
  }, [user]);

  const handleRequestSuccess = () => {
    setRefreshHistory(prev => prev + 1);
  };

  if (!user || loading) {
    return (
      <Wrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              {!user ? "Debe iniciar sesión para acceder a esta página." : "Cargando datos del empleado..."}
            </p>
          </div>
        </div>
      </Wrapper>
    );
  }

  if (!employeeData) {
    return (
      <Wrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              No se pudo cargar la información del empleado.
            </p>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Horas Extra</h1>
          <p className="text-muted-foreground">
            Registre las horas extra trabajadas y revise el estado de sus registros.
          </p>
        </div>

        <Tabs defaultValue="request" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="request">Nuevo Registro</TabsTrigger>
            <TabsTrigger value="history">Mis Registros</TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-6">
            <OvertimeRequestForm
              employeeId={employeeData.cedula}
              employeeName={employeeData.nombre}
              onSuccess={handleRequestSuccess}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <OvertimeRequestHistory
              key={refreshHistory}
              employeeId={employeeData.cedula}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Wrapper>
  );
}