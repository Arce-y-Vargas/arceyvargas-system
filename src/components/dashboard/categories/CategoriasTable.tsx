"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  getCategorias,
  deleteCategoria,
  type Categoria,
} from "@/lib/categorias";
import CategoriasModal from "./CategoriasModal";
import CategoriasEdit from "./CategoriasEdit";

export default function CategoriasTable() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filteredCategorias, setFilteredCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    filterCategorias();
  }, [categorias, searchQuery]);

  const fetchCategorias = async () => {
    setIsLoading(true);
    try {
      const data = await getCategorias();
      setCategorias(data);
      setFilteredCategorias(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategorias = () => {
    let filtered = [...categorias];

    if (searchQuery) {
      filtered = filtered.filter(
        (categoria) =>
          categoria.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          categoria.descripcion
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCategorias(filtered);
  };

  const handleCategoriaUpdated = async () => {
    await fetchCategorias();
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCategoriaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoriaToDelete) return;

    try {
      await deleteCategoria(categoriaToDelete);
      await fetchCategorias();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    } finally {
      setDeleteDialogOpen(false);
      setCategoriaToDelete(null);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Categorías</CardTitle>
            <CardDescription>
              Gestione las categorías para clasificar sus facturas.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="self-start bg-blue-600 sm:self-auto"
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar Categoría
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
                placeholder="Buscar por nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredCategorias.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No se encontraron categorías.
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
                      Descripción
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Color
                    </TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategorias.map((categoria) => (
                    <TableRow key={categoria.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {categoria.nombre}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {categoria.descripcion}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: categoria.color }}
                          />
                          <Badge
                            className="text-white"
                            style={{ backgroundColor: categoria.color }}
                          >
                            {categoria.nombre}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(categoria)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(categoria.id)}
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
            Mostrando {filteredCategorias.length} de {categorias.length}{" "}
            categorías
          </div>
        </div>
      </CardFooter>

      <CategoriasModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCategoriaAdded={handleCategoriaUpdated}
      />

      {editingCategoria && (
        <CategoriasEdit
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onCategoriaUpdated={handleCategoriaUpdated}
          categoria={editingCategoria}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la categoría permanentemente. Esta acción no
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
