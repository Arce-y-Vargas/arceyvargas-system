"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
import { v4 as uuidv4 } from "uuid";
import { addFactura } from "@/lib/factura";

interface InvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceAdded: () => void;
}

export default function InvoicesModal({
  isOpen,
  onClose,
  onInvoiceAdded,
}: InvoicesModalProps) {
  const [formData, setFormData] = useState({
    factura: "",
    fecha: new Date().toISOString().split("T")[0],
    monto: 0,
    fechaPago: "",
    saldo: 0,
    proyecto: "",
    categoria: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "monto") {
      const montoValue = Number.parseFloat(value) || 0;
      setFormData({
        ...formData,
        [name]: montoValue,
        saldo: montoValue, // Al crear una factura, el saldo inicial es igual al monto
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
      if (
        !formData.factura ||
        !formData.fecha ||
        !formData.proyecto ||
        !formData.categoria ||
        formData.monto <= 0
      ) {
        throw new Error("Por favor complete todos los campos requeridos.");
      }

      const newInvoice = {
        id: uuidv4(),
        ...formData,
      };

      await addFactura(newInvoice);
      onInvoiceAdded();
      onClose();

      // Resetear el formulario
      setFormData({
        factura: "",
        fecha: new Date().toISOString().split("T")[0],
        monto: 0,
        fechaPago: "",
        saldo: 0,
        proyecto: "",
        categoria: "",
      });
    } catch (error) {
      console.error("Error al agregar factura:", error);
      setError(
        error instanceof Error ? error.message : "Error al agregar factura"
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
            Agregar Nueva Factura
          </DialogTitle>
          <DialogDescription>
            Complete los detalles de la factura. Todos los campos marcados con *
            son obligatorios.
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

            <div className="space-y-2">
              <Label htmlFor="proyecto">
                Proyecto <span className="text-red-500">*</span>
              </Label>
              {proyectos.length === 0 ? (
                <div className="text-sm text-amber-600 p-2 border rounded-md bg-amber-50">
                  No hay proyectos disponibles. Por favor, agregue proyectos
                  primero.
                </div>
              ) : (
                <Select
                  value={formData.proyecto}
                  onValueChange={(value) =>
                    handleSelectChange("proyecto", value)
                  }
                >
                  <SelectTrigger id="proyecto">
                    <SelectValue placeholder="Seleccione un proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {proyectos.map((proyecto) => (
                      <SelectItem key={proyecto.id} value={proyecto.nombre}>
                        {proyecto.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">
                Categoría <span className="text-red-500">*</span>
              </Label>
              {categorias.length === 0 ? (
                <div className="text-sm text-amber-600 p-2 border rounded-md bg-amber-50">
                  No hay categorías disponibles. Por favor, agregue categorías
                  primero.
                </div>
              ) : (
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
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.nombre}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                <Label htmlFor="fechaPago">Fecha de Pago</Label>
                <Input
                  id="fechaPago"
                  name="fechaPago"
                  type="date"
                  value={formData.fechaPago}
                  onChange={handleChange}
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
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                proyectos.length === 0 ||
                categorias.length === 0
              }
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></span>
                  Guardando...
                </span>
              ) : (
                "Guardar Factura"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
