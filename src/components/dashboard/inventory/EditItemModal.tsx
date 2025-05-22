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
import { updateInventoryItem, type InventoryItem } from "@/lib/inventory";

interface EditItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem;
}

export default function EditItemModal({
  open,
  onOpenChange,
  item,
}: EditItemModalProps) {
  const [formData, setFormData] = useState({ ...item });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async () => {
    await updateInventoryItem(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Ítem</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="h-10"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Cantidad
            </Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              className="h-10"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Categoría
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={handleChange}
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
              className="h-10"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="total" className="text-sm font-medium">
              Total
            </Label>
            <Input
              id="total"
              type="number"
              value={formData.total}
              onChange={handleChange}
              className="h-10"
              disabled
            />
          </div>
          <Button
            type="button"
            onClick={handleSubmit}
            className="mt-2 w-full sm:w-auto sm:self-end"
          >
            Guardar Cambios
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
