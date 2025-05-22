"use client";

import type React from "react";

import { useState } from "react";
import { addEmployee, getEmployees } from "@/lib/employees";
import { X } from "lucide-react";
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
import { Toaster } from "@/components/ui/toaster";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface EmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded: () => void;
}

interface Empleado {
  cedula: string;
  nombre: string;
  posicion: string;
  departamento: string;
  fechaInicio: string;
  salario: number;
  status: string;
}

const EmployeesModal: React.FC<EmployeesModalProps> = ({
  isOpen,
  onClose,
  onEmployeeAdded,
}) => {
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    posicion: "",
    departamento: "",
    fechaInicio: "",
    salario: "",
    password: "",
    status: "Activo",
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const localToday = today.toISOString().split("T")[0];

  const formatCedula = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 1) return cleaned;
    if (cleaned.length <= 5)
      return `${cleaned.slice(0, 1)}-${cleaned.slice(1)}`;
    return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 5)}-${cleaned.slice(
      5,
      9
    )}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { id, value } = e.target;

    if (id === "cedula") {
      value = formatCedula(value);
    }

    setFormData({ ...formData, [id]: value });
  };

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    if (!formData.cedula || formData.cedula.length < 11)
      nuevosErrores.cedula = "La cédula debe tener el formato X-XXXX-XXXX";
    if (!formData.nombre) nuevosErrores.nombre = "El nombre es obligatorio";
    if (!formData.posicion)
      nuevosErrores.posicion = "La posición es obligatoria";
    if (!formData.departamento)
      nuevosErrores.departamento = "El departamento es obligatorio";
    if (!formData.fechaInicio)
      nuevosErrores.fechaInicio = "La fecha de inicio es obligatoria";
    if (!formData.salario) nuevosErrores.salario = "El salario es obligatorio";
    if (!formData.password || formData.password.length < 6)
      nuevosErrores.password = "La contraseña debe tener al menos 6 caracteres";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validar()) return;

    try {
      const existingEmployees = await getEmployees();
      const cedulaExists = existingEmployees.some(
        (emp) => emp.cedula === formData.cedula
      );

      if (cedulaExists) {
        setErrores((prev) => ({
          ...prev,
          cedula: "Ya existe un empleado registrado con esta cédula.",
        }));
        return;
      }
    } catch (err) {
      toast({
        title: "Error al validar cédula",
        description: "No se pudo verificar si la cédula ya existe.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addEmployee(
        {
          ...formData,
          salario: Number.parseFloat(formData.salario),
        },
        formData.password
      );
      onEmployeeAdded();
      onClose();
    } catch (error) {
      console.error("Error al agregar empleado:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el empleado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl">Agregar Nuevo Empleado</DialogTitle>
          <DialogDescription>
            Completa los datos del empleado.
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </DialogHeader>

        <form className="grid gap-4 py-2" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="cedula" className="text-sm font-medium">
              Cédula
            </Label>
            <Input
              id="cedula"
              value={formData.cedula}
              onChange={handleChange}
              placeholder="X-XXXX-XXXX"
              maxLength={11}
              className={`h-10 ${
                errores.cedula
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
            />
            {errores.cedula && (
              <p className="text-red-500 text-sm">{errores.cedula}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nombre" className="text-sm font-medium">
              Nombre
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre completo"
              className="h-10"
            />
            {errores.nombre && (
              <p className="text-red-500 text-sm">{errores.nombre}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              className="h-10"
            />
            {errores.password && (
              <p className="text-red-500 text-sm">{errores.password}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="posicion" className="text-sm font-medium">
              Posición
            </Label>
            <Select
              onValueChange={(val) =>
                setFormData({ ...formData, posicion: val })
              }
            >
              <SelectTrigger id="posicion" className="h-10">
                <SelectValue placeholder="Seleccionar Posición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general-manager">Gerente General</SelectItem>
                <SelectItem value="admin-financial-manager">
                  Gerente Financiero
                </SelectItem>
                <SelectItem value="operations-manager">
                  Gerente de Operaciones
                </SelectItem>
                <SelectItem value="plant-manager">Gerente de Planta</SelectItem>
                <SelectItem value="admin-assistant">
                  Asistente Administrativo
                </SelectItem>
                <SelectItem value="warehouse-staff">
                  Personal de Almacén
                </SelectItem>
                <SelectItem value="operators">Operador</SelectItem>
              </SelectContent>
            </Select>
            {errores.posicion && (
              <p className="text-red-500 text-sm">{errores.posicion}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="departamento" className="text-sm font-medium">
              Departamento
            </Label>
            <Select
              onValueChange={(val) =>
                setFormData({ ...formData, departamento: val })
              }
            >
              <SelectTrigger id="departamento" className="h-10">
                <SelectValue placeholder="Seleccionar Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gerencia">Gerencia</SelectItem>
                <SelectItem value="Administración">Administración</SelectItem>
                <SelectItem value="Operaciones">Operaciones</SelectItem>
                <SelectItem value="Producción">Producción</SelectItem>
                <SelectItem value="Finanzas">Finanzas</SelectItem>
                <SelectItem value="Taller">Taller</SelectItem>
                <SelectItem value="Almacén">Almacén</SelectItem>
                <SelectItem value="Mecánica">Mecánica</SelectItem>
              </SelectContent>
            </Select>
            {errores.departamento && (
              <p className="text-red-500 text-sm">{errores.departamento}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fechaInicio" className="text-sm font-medium">
                Fecha de Inicio
              </Label>
              <Input
                id="fechaInicio"
                type="date"
                value={formData.fechaInicio}
                onChange={handleChange}
                className="h-10"
              />

              {errores.fechaInicio && (
                <p className="text-red-500 text-sm">{errores.fechaInicio}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="salario" className="text-sm font-medium">
                Salario
              </Label>
              <Input
                id="salario"
                type="number"
                value={formData.salario}
                onChange={handleChange}
                placeholder="0.00"
                className="h-10"
              />
              {errores.salario && (
                <p className="text-red-500 text-sm">{errores.salario}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Estado
            </Label>
            <Select
              defaultValue="Activo"
              onValueChange={(val) => setFormData({ ...formData, status: val })}
            >
              <SelectTrigger id="status" className="h-10">
                <SelectValue placeholder="Seleccionar Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Guardando..." : "Agregar Empleado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeesModal;
