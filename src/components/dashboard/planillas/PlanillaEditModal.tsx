"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updatePlanilla,
  convertToFirebaseModel,
  type PlanillaUI,
} from "@/lib/planilla";
import { Loader2 } from "lucide-react";

interface PlanillaEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  planilla: PlanillaUI;
}

export function PlanillaEditModal({
  open,
  onOpenChange,
  onSuccess,
  planilla,
}: PlanillaEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PlanillaUI>({
    empleado: "",
    cedula: "",
    dias: 6,
    salario_semanal: 0,
    horas_extras: 0,
    domingo_feriado: 0,
    esfuerzo_viaticos: 0,
    total_ingresos: 0,
    ccss: 0,
    no_laboro: 0,
    ahorros: 0,
    caja_ahorro_1: 0,
    caja_ahorro_2: 0,
    rebajas_1: 0,
    rebajas_2: 0,
    total_rebajas: 0,
    total_pagar: 0,
  });

  useEffect(() => {
    if (open && planilla) {
      setFormData(planilla);
    }
  }, [open, planilla]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let newValue: string | number = value;
    if (name !== "empleado" && name !== "cedula") {
      newValue = value === "" ? 0 : Number.parseFloat(value);
    }

    setFormData((prev) => {
      const newData = { ...prev, [name]: newValue };

      // Calculate totals
      const totalIngresos =
        Number.parseFloat(newData.salario_semanal.toString()) +
        Number.parseFloat(newData.horas_extras.toString()) +
        Number.parseFloat(newData.domingo_feriado.toString()) +
        Number.parseFloat(newData.esfuerzo_viaticos.toString());

      const totalRebajas =
        Number.parseFloat(newData.ccss.toString()) +
        Number.parseFloat(newData.no_laboro.toString()) +
        Number.parseFloat(newData.ahorros.toString()) +
        Number.parseFloat(newData.caja_ahorro_1.toString()) +
        Number.parseFloat(newData.caja_ahorro_2.toString()) +
        Number.parseFloat(newData.rebajas_1.toString()) +
        Number.parseFloat(newData.rebajas_2.toString());

      const totalPagar = totalIngresos - totalRebajas;

      return {
        ...newData,
        total_ingresos: totalIngresos,
        total_rebajas: totalRebajas,
        total_pagar: totalPagar,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert UI model to Firebase model
      const firebaseData = convertToFirebaseModel(formData);
      await updatePlanilla(firebaseData);

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error al actualizar planilla:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Planilla</DialogTitle>
          <DialogDescription>
            Modifique los datos de la planilla de {formData.empleado}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                name="cedula"
                value={formData.cedula}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empleado">Nombre del Empleado</Label>
              <Input
                id="empleado"
                name="empleado"
                value={formData.empleado}
                readOnly
                className="bg-muted"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dias">Días Laborados</Label>
              <Input
                id="dias"
                name="dias"
                type="number"
                value={formData.dias}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salario_semanal">Salario Semanal</Label>
              <Input
                id="salario_semanal"
                name="salario_semanal"
                type="number"
                value={formData.salario_semanal}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Ingresos</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="horas_extras">Horas Extras</Label>
                  <Input
                    id="horas_extras"
                    name="horas_extras"
                    type="number"
                    value={formData.horas_extras}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domingo_feriado">Domingo/Feriado</Label>
                  <Input
                    id="domingo_feriado"
                    name="domingo_feriado"
                    type="number"
                    value={formData.domingo_feriado}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esfuerzo_viaticos">Esfuerzo/Viáticos</Label>
                  <Input
                    id="esfuerzo_viaticos"
                    name="esfuerzo_viaticos"
                    type="number"
                    value={formData.esfuerzo_viaticos}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_ingresos">Total Ingresos</Label>
                  <Input
                    id="total_ingresos"
                    name="total_ingresos"
                    type="number"
                    value={formData.total_ingresos}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Deducciones</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="ccss">CCSS</Label>
                  <Input
                    id="ccss"
                    name="ccss"
                    type="number"
                    value={formData.ccss}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="no_laboro">No Laboró</Label>
                  <Input
                    id="no_laboro"
                    name="no_laboro"
                    type="number"
                    value={formData.no_laboro}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ahorros">Ahorros</Label>
                  <Input
                    id="ahorros"
                    name="ahorros"
                    type="number"
                    value={formData.ahorros}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caja_ahorro_1">Caja Ahorro 1</Label>
                  <Input
                    id="caja_ahorro_1"
                    name="caja_ahorro_1"
                    type="number"
                    value={formData.caja_ahorro_1}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="caja_ahorro_2">Caja Ahorro 2</Label>
                <Input
                  id="caja_ahorro_2"
                  name="caja_ahorro_2"
                  type="number"
                  value={formData.caja_ahorro_2}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rebajas_1">Rebajas 1</Label>
                <Input
                  id="rebajas_1"
                  name="rebajas_1"
                  type="number"
                  value={formData.rebajas_1}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rebajas_2">Rebajas 2</Label>
                <Input
                  id="rebajas_2"
                  name="rebajas_2"
                  type="number"
                  value={formData.rebajas_2}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="total_rebajas">Total Rebajas</Label>
                <Input
                  id="total_rebajas"
                  name="total_rebajas"
                  type="number"
                  value={formData.total_rebajas}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="total_pagar"
                  className="text-green-600 font-bold"
                >
                  Total a Pagar
                </Label>
                <Input
                  id="total_pagar"
                  name="total_pagar"
                  type="number"
                  value={formData.total_pagar}
                  readOnly
                  className="bg-green-50 border-green-200 text-green-600 font-bold"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Planilla"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
