"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { addInventoryItem, type InventoryItem } from "@/lib/inventory";

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemAdded: () => void;
}

export default function AddItemModal({
  open,
  onOpenChange,
  onItemAdded,
}: AddItemModalProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    id: "",
    name: "",
    category: "",
    quantity: 0,
    pricePerUnit: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof InventoryItem, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.id || !formData.name || !formData.category) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Recalcular el total
    const total = (formData.quantity || 0) * (formData.pricePerUnit || 0);
    setFormData((prev) => ({ ...prev, total }));

    setLoading(true);
    try {
      await addInventoryItem(formData as InventoryItem);
      onItemAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error al agregar ítem:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Agregar Nuevo Ítem</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="id" className="text-sm font-medium">
              Código
            </Label>
            <Input
              id="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="Ej: HER-001"
              className="h-10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Llave Inglesa 12"
              className="h-10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Categoría
            </Label>
            <Select
              onValueChange={(val) => handleSelectChange("category", val)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  <SelectItem value="MAQUINARIA Y EQUIPO">
                    MAQUINARIA Y EQUIPO
                  </SelectItem>
                  <SelectItem value="MOBILIARIO Y EQUIPO">
                    MOBILIARIO Y EQUIPO
                  </SelectItem>
                  <SelectItem value="VEHICULOS">VEHICULOS</SelectItem>
                </SelectContent>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-2">
            <div className="grid gap-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Cantidad
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pricePerUnit" className="text-sm font-medium">
                Precio Unitario
              </Label>
              <Input
                id="pricePerUnit"
                type="number"
                value={formData.pricePerUnit}
                onChange={handleChange}
                placeholder="0"
                className="h-10"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="total" className="text-sm font-medium">
              Total
            </Label>
            <Input
              id="total"
              type="number"
              value={formData.total}
              disabled
              className="h-10"
            />
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 w-full sm:w-auto sm:self-end"
          >
            {loading ? "Guardando..." : "Agregar Ítem"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
