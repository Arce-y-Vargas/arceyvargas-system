"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { updateEmployee } from "@/lib/employees";
import { submitHRRequest } from "@/lib/hrRequests";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Employee {
  id: string;
  cedula: string;
  nombre: string;
  posicion: string;
  departamento: string;
  fechaInicio: string;
  salario: number;
  status: string;
}

interface EmployeesEditProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeUpdated: () => void;
  employee: Employee | null;
}

const EmployeesEdit: React.FC<EmployeesEditProps> = ({
  isOpen,
  onClose,
  onEmployeeUpdated,
  employee,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Employee>({
    id: "",
    cedula: "",
    nombre: "",
    posicion: "",
    departamento: "",
    fechaInicio: "",
    salario: 0,
    status: "Activo",
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    if (!formData.nombre) nuevosErrores.nombre = "El nombre es obligatorio";
    if (!formData.posicion)
      nuevosErrores.posicion = "La posición es obligatoria";
    if (!formData.departamento)
      nuevosErrores.departamento = "El departamento es obligatorio";
    if (!formData.fechaInicio)
      nuevosErrores.fechaInicio = "La fecha de inicio es obligatoria";
    if (!formData.salario) nuevosErrores.salario = "El salario es obligatorio";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validar()) return;

    setLoading(true);
    try {
      const updatedData = {
        ...formData,
        salario: Number(formData.salario),
      };
      
      await submitHRRequest({
        type: 'edit_employee',
        requestedBy: user?.uid || '',
        requestedByName: user?.displayName || user?.email || 'Usuario',
        requestedByRole: 'admin', // Se podría obtener del contexto
        title: `Editar empleado: ${formData.nombre}`,
        description: `Solicitud para editar datos del empleado con cédula ${formData.cedula}`,
        currentData: employee,
        proposedData: updatedData,
        targetEmployeeId: formData.cedula,
        targetEmployeeName: formData.nombre
      });
      
      toast({
        title: "✅ Solicitud enviada correctamente",
        description: `La solicitud para editar al empleado ${formData.nombre} ha sido enviada para aprobación de Gerencia General y RRHH.`,
      });
      
      onEmployeeUpdated();
      onClose();
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar la solicitud.",
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
          <DialogTitle className="text-xl">Editar Empleado</DialogTitle>
          <DialogDescription>
            Actualiza los datos del empleado.
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
              disabled
              className="h-10 opacity-70"
            />
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
            <Label htmlFor="posicion" className="text-sm font-medium">
              Posición
            </Label>
            <Select
              value={formData.posicion}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, posicion: val }))
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
                <SelectItem value="rrhh">
                  Recursos Humanos
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
              value={formData.departamento}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, departamento: val }))
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
                <SelectItem value="RRHH">RRHH</SelectItem>
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
              value={formData.status}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, status: val }))
              }
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
              {loading ? "Enviando solicitud..." : "Enviar solicitud"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeesEdit;
