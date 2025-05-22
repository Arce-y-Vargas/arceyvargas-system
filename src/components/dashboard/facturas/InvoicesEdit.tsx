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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProyectos, type Proyecto } from "@/lib/proyectos";
import { getCategorias, type Categoria } from "@/lib/categorias";
import { updateFactura } from "@/lib/factura";

// Actualizar la interfaz Factura para incluir el campo categoria
interface Factura {
  id: string;
  fecha: string;
  factura: string;
  monto: number;
  fechaPago: string;
  saldo: number;
  proyecto: string;
  categoria: string; // Nuevo campo agregado
}

interface InvoicesEditProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceUpdated: () => void;
  invoice: Factura;
}

export default function InvoicesEdit({
  isOpen,
  onClose,
  onInvoiceUpdated,
  invoice,
}: InvoicesEditProps) {
  // Actualizar el estado inicial para incluir categoría
  const [formData, setFormData] = useState<Factura>({
    id: "",
    fecha: "",
    factura: "",
    monto: 0,
    fechaPago: "",
    saldo: 0,
    proyecto: "",
    categoria: "", // Nuevo campo agregado
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
    }

    const fetchData = async () => {
      try {
        const proyectosData = await getProyectos();
        const categoriasData = await getCategorias();
        setProyectos(proyectosData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, [invoice]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "monto" || name === "saldo") {
      setFormData({
        ...formData,
        [name]: Number.parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validaciones básicas
      if (
        !formData.factura ||
        !formData.fecha ||
        !formData.proyecto ||
        formData.monto <= 0
      ) {
        throw new Error("Por favor complete todos los campos requeridos.");
      }

      // Si el saldo es 0, asegurarse de que hay una fecha de pago
      if (formData.saldo === 0 && !formData.fechaPago) {
        setFormData({
          ...formData,
          fechaPago: new Date().toISOString().split("T")[0],
        });
      }

      await updateFactura(formData);
      onInvoiceUpdated();
      onClose();
    } catch (error) {
      console.error("Error al actualizar factura:", error);
      setError(
        error instanceof Error ? error.message : "Error al actualizar factura"
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
            Editar Factura
          </DialogTitle>
          <DialogDescription>
            Modifique los detalles de la factura. Todos los campos marcados con
            * son obligatorios.
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="factura">
                  Número de Factura <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="factura"
                  name="factura"
                  value={formData.factura}
                  onChange={handleChange}
                  placeholder="Ej: FAC-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha">
                  Fecha de Emisión <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Agregar el campo de categoría en el formulario, después del campo de proyecto */}
            <div className="space-y-2">
              <Label htmlFor="proyecto">
                Proyecto <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.proyecto}
                onValueChange={(value) => handleSelectChange("proyecto", value)}
              >
                <SelectTrigger id="proyecto">
                  <SelectValue placeholder="Seleccione un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {proyectos.length === 0 ? (
                    <SelectItem value="" disabled>
                      No hay proyectos disponibles
                    </SelectItem>
                  ) : (
                    proyectos.map((proyecto) => (
                      <SelectItem key={proyecto.id} value={proyecto.nombre}>
                        {proyecto.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) =>
                  handleSelectChange("categoria", value)
                }
              >
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.length === 0 ? (
                    <SelectItem value="" disabled>
                      No hay categorías disponibles
                    </SelectItem>
                  ) : (
                    categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.nombre}>
                        {categoria.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monto">
                  Monto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="monto"
                  name="monto"
                  type="number"
                  value={formData.monto || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saldo">
                  Saldo Pendiente <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="saldo"
                  name="saldo"
                  type="number"
                  value={formData.saldo || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaPago">Fecha de Pago</Label>
              <Input
                id="fechaPago"
                name="fechaPago"
                type="date"
                value={formData.fechaPago}
                onChange={handleChange}
              />
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
