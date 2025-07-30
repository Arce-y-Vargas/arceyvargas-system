"use client";

import type React from "react";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { addQuote } from "@/lib/quotes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Pendiente": return "bg-yellow-500 text-black";
    case "Aprobada": return "bg-green-500 text-white";
    case "Rechazada": return "bg-red-500 text-white";
    case "En proceso": return "bg-blue-500 text-white";
    case "Completada": return "bg-purple-500 text-white";
    default: return "bg-gray-500";
  }
};

const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    client: "",
    date: "",
    total: "",
    status: "Pendiente",
    items: "",
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const localToday = today.toISOString().split("T")[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    if (!formData.client) nuevosErrores.client = "El cliente es obligatorio";
    if (!formData.date) nuevosErrores.date = "La fecha es obligatoria";
    if (!formData.total || Number.parseFloat(formData.total) <= 0)
      nuevosErrores.total = "El total debe ser mayor que cero";
    if (!formData.items || Number.parseInt(formData.items) <= 0)
      nuevosErrores.items = "El número de ítems debe ser mayor que cero";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validar()) return;

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontró el usuario autenticado.",
        });
        return;
      }

      await addQuote(user.uid, {
        client: formData.client,
        date: formData.date,
        total: Number.parseFloat(formData.total),
        status: formData.status,
        items: Number.parseInt(formData.items, 10),
        active: true,
      });

      toast({
        title: "Éxito",
        description: "Cotización agregada correctamente.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al agregar la cotización.",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl">
            Agregar Nueva Cotización
          </DialogTitle>
          <DialogDescription>
            Completa los datos de la cotización.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-2" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="client" className="text-sm font-medium">
              Cliente
            </Label>
            <Input
              id="client"
              value={formData.client}
              onChange={handleChange}
              placeholder="Nombre del cliente"
              className="h-10"
            />
            {errores.client && (
              <p className="text-red-500 text-sm">{errores.client}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Fecha
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="h-10"
              min={localToday}
            />
            {errores.date && (
              <p className="text-red-500 text-sm">{errores.date}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="total" className="text-sm font-medium">
                Total
              </Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                min="0"
                value={formData.total}
                onChange={handleChange}
                placeholder="0.00"
                className="h-10"
              />
              {errores.total && (
                <p className="text-red-500 text-sm">{errores.total}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="items" className="text-sm font-medium">
                Número de ítems
              </Label>
              <Input
                id="items"
                type="number"
                min="1"
                value={formData.items}
                onChange={handleChange}
                placeholder="Cantidad de ítems"
                className="h-10"
              />
              {errores.items && (
                <p className="text-red-500 text-sm">{errores.items}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Estado
            </Label>
            <Select
              defaultValue="Pendiente"
              onValueChange={(val) => setFormData({ ...formData, status: val })}
            >
              <SelectTrigger id="status" className="h-10">
                <SelectValue placeholder="Seleccionar estado">
                  {formData.status && (
                    <div className="flex items-center">
                      <Badge
                        className={getStatusColor(formData.status)}
                      >
                        {formData.status}
                      </Badge>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {["Pendiente", "Aprobada", "Rechazada", "En proceso", "Completada"].map((status) => (
                  <SelectItem key={status} value={status}>
                    <Badge className={getStatusColor(status)}>{status}</Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Guardando..." : "Agregar Cotización"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteModal;
