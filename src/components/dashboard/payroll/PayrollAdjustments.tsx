"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PayrollAdjustments = () => {
  const [deduction, setDeduction] = useState("");
  const [bonus, setBonus] = useState("");
  const [adjustments, setAdjustments] = useState<{ deduction: string; bonus: string } | null>(null);

  const handleSave = () => {
    setAdjustments({ deduction, bonus });
    alert("Deducciones y bonificaciones configuradas");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Configurar Deducciones y Bonificaciones</h2>
      <div className="flex flex-col gap-2 mb-4">
        <Input
          type="number"
          value={deduction}
          onChange={(e) => setDeduction(e.target.value)}
          placeholder="Deducción ($)"
        />
        <Input
          type="number"
          value={bonus}
          onChange={(e) => setBonus(e.target.value)}
          placeholder="Bonificación ($)"
        />
        <Button onClick={handleSave}>Guardar Ajustes</Button>
      </div>

      {adjustments && (
        <div className="mt-4">
          <p><strong>Deducción:</strong> ${adjustments.deduction}</p>
          <p><strong>Bonificación:</strong> ${adjustments.bonus}</p>
        </div>
      )}
    </div>
  );
};

export default PayrollAdjustments;
