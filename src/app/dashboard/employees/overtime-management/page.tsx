"use client";

import { Wrapper } from "@/components/utils/Wrapper";
import OvertimeRequestsManager from "@/components/dashboard/employees/overtime/OvertimeRequestsManager";
import { useAuth } from "@/hooks/useAuth";

export default function OvertimeManagementPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Wrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              Debe iniciar sesión para acceder a esta página.
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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Horas Extra</h1>
          <p className="text-muted-foreground">
            Revise y apruebe las solicitudes de horas extra enviadas por los empleados.
          </p>
        </div>

        <OvertimeRequestsManager
          managerId={user.uid}
          managerName={user.displayName || user.email || "Gerente"}
        />
      </div>
    </Wrapper>
  );
}