"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const ApprovePayroll = () => {
  const [approved, setApproved] = useState(false);

  const handleApprove = () => {
    setApproved(true);
    alert("Pago de planilla aprobado");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Aprobar Pagos de Planilla</h2>
      <Button onClick={handleApprove} disabled={approved}>
        {approved ? "Planilla Aprobada" : "Aprobar Pagos"}
      </Button>
    </div>
  );
};

export default ApprovePayroll;
