"use client";

import type React from "react";

import { useState } from "react";
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
import { addCategoria } from "@/lib/categorias";
import { v4 as uuidv4 } from "uuid";

interface CategoriasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriaAdded: () => void;
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

export default function CategoriasModal({
  isOpen,
  onClose,
  onCategoriaAdded,
}: CategoriasModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    color: "#3b82f6", // Color por defecto
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

      const newCategoria = {
        id: uuidv4(),
        ...formData,
      };

      await addCategoria(newCategoria);
      onCategoriaAdded();
      onClose();

      // Resetear el formulario
      setFormData({
        nombre: "",
        descripcion: "",
        color: "#3b82f6",
      });
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      setError(
        error instanceof Error ? error.message : "Error al agregar categoría"
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
            Agregar Nueva Categoría
          </DialogTitle>
          <DialogDescription>
            Complete los detalles de la categoría. Todos los campos marcados con
            * son obligatorios.
          </DialogDescription>
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
                  Guardando...
                </span>
              ) : (
                "Guardar Categoría"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
