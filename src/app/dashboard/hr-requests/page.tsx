"use client";

import { Wrapper } from "@/components/utils/Wrapper";
import HRRequestsManager from "@/components/dashboard/hr/HRRequestsManager";
import { useAuth } from "@/hooks/useAuth";

export default function HRRequestsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Solicitudes de RRHH</h1>
          <p className="text-muted-foreground">
            Gestione las solicitudes de cambios en empleados que requieren aprobación dual.
          </p>
        </div>

        <HRRequestsManager
          userId={user.uid}
          userName={user.displayName || user.email || "Usuario"}
        />
      </div>
    </Wrapper>
  );
}