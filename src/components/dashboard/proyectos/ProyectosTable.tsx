"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteProyecto, getProyectos, Proyecto } from "@/lib/proyectos";
import ProyectosModal from "./ProyectosModal";
import ProyectosEdit from "./ProyectosEdit";

const estadoColors: Record<string, string> = {
  activo: "bg-green-500 text-white",
  completado: "bg-blue-500 text-white",
  cancelado: "bg-red-500 text-white",
};

export default function ProyectosTable() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [filteredProyectos, setFilteredProyectos] = useState<Proyecto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [proyectoToDelete, setProyectoToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProyectos();
  }, []);

  useEffect(() => {
    filterProyectos();
  }, [proyectos, searchQuery, estadoFilter]);

  const fetchProyectos = async () => {
    setIsLoading(true);
    try {
      const data = await getProyectos();
      setProyectos(data);
      setFilteredProyectos(data);
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProyectos = () => {
    let filtered = [...proyectos];

    if (searchQuery) {
      filtered = filtered.filter(
        (proyecto) =>
          proyecto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proyecto.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proyecto.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Aplicar filtro de estado
    if (estadoFilter !== "todos") {
      filtered = filtered.filter(
        (proyecto) => proyecto.estado === estadoFilter
      );
    }

    setFilteredProyectos(filtered);
  };

  const handleProyectoUpdated = async () => {
    await fetchProyectos();
  };

  const handleEdit = (proyecto: Proyecto) => {
    setEditingProyecto(proyecto);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setProyectoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!proyectoToDelete) return;

    try {
      await deleteProyecto(proyectoToDelete);
      await fetchProyectos();
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
    } finally {
      setDeleteDialogOpen(false);
      setProyectoToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Proyectos</CardTitle>
            <CardDescription>
              Gestione los proyectos de su empresa.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="self-start bg-blue-600 sm:self-auto"
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar Proyecto
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cliente o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredProyectos.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No se encontraron proyectos.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Nombre
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Cliente
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Fecha Inicio
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Fecha Fin
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Estado
                    </TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProyectos.map((proyecto) => (
                    <TableRow key={proyecto.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {proyecto.nombre}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {proyecto.cliente}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(proyecto.fechaInicio)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(proyecto.fechaFin || "")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          className={
                            estadoColors[proyecto.estado] ||
                            "bg-gray-500 text-white"
                          }
                        >
                          {proyecto.estado.charAt(0).toUpperCase() +
                            proyecto.estado.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(proyecto)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(proyecto.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t py-4 px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-sm text-muted-foreground gap-2">
          <div>
            Mostrando {filteredProyectos.length} de {proyectos.length} proyectos
          </div>
        </div>
      </CardFooter>

      <ProyectosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProyectoAdded={handleProyectoUpdated}
      />

      {editingProyecto && (
        <ProyectosEdit
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onProyectoUpdated={handleProyectoUpdated}
          proyecto={editingProyecto}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el proyecto permanentemente. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
