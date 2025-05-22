"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { updateCategoria, type Categoria } from "@/lib/categorias";

interface CategoriasEditProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriaUpdated: () => void;
  categoria: Categoria;
}

// Lista de colores predefinidos para elegir
const colorOptions = [
  { name: "Rojo", value: "#ef4444" },
  { name: "Verde", value: "#22c55e" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Amarillo", value: "#eab308" },
  { name: "Púrpura", value: "#a855f7" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Naranja", value: "#f97316" },
  { name: "Cian", value: "#06b6d4" },
  { name: "Lima", value: "#84cc16" },
  { name: "Índigo", value: "#6366f1" },
];

export default function CategoriasEdit({
  isOpen,
  onClose,
  onCategoriaUpdated,
  categoria,
}: CategoriasEditProps) {
  const [formData, setFormData] = useState<Categoria>({
    id: "",
    nombre: "",
    descripcion: "",
    color: "#3b82f6",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (categoria) {
      setFormData(categoria);
    }
  }, [categoria]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleColorSelect = (color: string) => {
    setFormData({
      ...formData,
      color,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validaciones básicas
      if (!formData.nombre) {
        throw new Error("Por favor ingrese un nombre para la categoría.");
      }

      await updateCategoria(formData);
      onCategoriaUpdated();
      onClose();
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      setError(
        error instanceof Error ? error.message : "Error al actualizar categoría"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Editar Categoría
          </DialogTitle>
          <DialogDescription>
            Modifique los detalles de la categoría. Todos los campos marcados
            con * son obligatorios.
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Materiales"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describa brevemente la categoría..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Color <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <div
                    key={color.value}
                    className={`w-full aspect-square rounded-md cursor-pointer border-2 ${
                      formData.color === color.value
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorSelect(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: formData.color }}
                />
                <Input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full h-10"
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></span>
                  Actualizando...
                </span>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
