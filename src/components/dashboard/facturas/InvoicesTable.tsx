"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
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
import InvoicesModal from "./InvoicesModal";
import InvoicesEdit from "./InvoicesEdit";
import { getCategorias, type Categoria } from "@/lib/categorias";
import { getFacturas, updateFactura } from "@/lib/factura";

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

const projectColors: Record<string, string> = {
  "Proyecto A": "bg-blue-500 text-white",
  "Proyecto B": "bg-purple-500 text-white",
  "Proyecto C": "bg-yellow-500 text-black",
  "Proyecto D": "bg-red-500 text-white",
  "Proyecto E": "bg-green-500 text-white",
  "Proyecto F": "bg-orange-500 text-white",
  "Proyecto G": "bg-indigo-500 text-white",
  "Proyecto H": "bg-teal-500 text-white",
};

// Agregar colores para las categorías
// Eliminar esta definición estática
// const categoryColors: Record<string, string> = {
//   Materiales: "bg-emerald-500 text-white",
//   Servicios: "bg-violet-500 text-white",
//   Equipos: "bg-cyan-500 text-white",
//   "Mano de obra": "bg-rose-500 text-white",
//   Transporte: "bg-amber-500 text-black",
//   Otros: "bg-slate-500 text-white",
// }

export default function InvoicesTable() {
  const [invoices, setInvoices] = useState<Factura[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Factura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Factura | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    fetchInvoices();
    fetchCategorias();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const facturas = await getFacturas();
      setInvoices(facturas);
      setFilteredInvoices(facturas);
    } catch (error) {
      console.error("Error al obtener facturas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const categoriasData = await getCategorias();
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchQuery, projectFilter, statusFilter, categoryFilter, filterInvoices]);

  const filterInvoices = useCallback(() => {
    let filtered = [...invoices];

    if (searchQuery) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.factura.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.proyecto.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.categoria.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Aplicar filtro de proyecto
    if (projectFilter !== "todos") {
      filtered = filtered.filter(
        (invoice) => invoice.proyecto === projectFilter
      );
    }

    // Aplicar filtro de categoría
    if (categoryFilter !== "todos") {
      filtered = filtered.filter(
        (invoice) => invoice.categoria === categoryFilter
      );
    }

    // Aplicar filtro de estado de pago
    if (statusFilter !== "todos") {
      if (statusFilter === "pagado") {
        filtered = filtered.filter((invoice) => invoice.saldo === 0);
      } else if (statusFilter === "pendiente") {
        filtered = filtered.filter((invoice) => invoice.saldo > 0);
      }
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchQuery, projectFilter, statusFilter, categoryFilter]);

  const handleInvoiceUpdated = async () => {
    await fetchInvoices();
  };

  const handleEdit = (invoice: Factura) => {
    setEditingInvoice(invoice);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id || id.trim() === "") {
      console.error("Error: El ID es inválido.");
      return;
    }

    try {
      // Aquí podríamos marcar la factura como cancelada o eliminarla
      // Por ahora, solo actualizamos su saldo a 0 como ejemplo
      const facturaToUpdate = invoices.find((inv) => inv.id === id);
      if (facturaToUpdate) {
        await updateFactura({
          ...facturaToUpdate,
          saldo: 0,
          fechaPago: new Date().toISOString().split("T")[0],
        });
      }
      await fetchInvoices();
    } catch (error) {
      console.error("Error al actualizar la factura:", error);
    }
  };

  const projects = Array.from(
    new Set(invoices.map((invoice) => invoice.proyecto))
  );
  const categories = Array.from(
    new Set(invoices.map((invoice) => invoice.categoria))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(amount);
  };

  const getCategoriaColor = (nombreCategoria: string): string => {
    const categoria = categorias.find((cat) => cat.nombre === nombreCategoria);
    return categoria?.color || "#6b7280"; // Color gris por defecto si no se encuentra
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Facturas</CardTitle>
            <CardDescription>
              Gestione facturas, pagos y saldos pendientes por proyecto.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="self-start bg-blue-600 sm:self-auto"
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar Factura
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
                placeholder="Buscar por número de factura, ID o proyecto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los proyectos</SelectItem>
                  {projects.map((proj) => (
                    <SelectItem key={proj} value={proj}>
                      {proj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">No se encontraron facturas.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Factura
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Fecha
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Proyecto
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Categoría
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Monto
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Saldo
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Estado
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Fecha de Pago
                    </TableHead>

                    <TableHead className="font-semibold text-right whitespace-nowrap">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {invoice.factura}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {invoice.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(invoice.fecha).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          className={
                            projectColors[invoice.proyecto] ||
                            "bg-gray-500 text-white"
                          }
                        >
                          {invoice.proyecto}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          className="text-white"
                          style={{
                            backgroundColor: getCategoriaColor(
                              invoice.categoria
                            ),
                          }}
                        >
                          {invoice.categoria || "Sin categoría"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatCurrency(invoice.monto)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatCurrency(invoice.saldo)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          className={
                            invoice.saldo === 0
                              ? "bg-green-500 text-white"
                              : "bg-amber-500 text-white"
                          }
                        >
                          {invoice.saldo === 0 ? "Pagado" : "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {invoice.fechaPago
                          ? new Date(invoice.fechaPago).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(invoice)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(invoice.id)}
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
            Mostrando {filteredInvoices.length} de {invoices.length} facturas
          </div>
          {filteredInvoices.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="font-medium">
                Total facturado:{" "}
                {formatCurrency(
                  filteredInvoices.reduce((sum, inv) => sum + inv.monto, 0)
                )}
              </div>
              <div className="font-medium">
                Total pendiente:{" "}
                {formatCurrency(
                  filteredInvoices.reduce((sum, inv) => sum + inv.saldo, 0)
                )}
              </div>
            </div>
          )}
        </div>
      </CardFooter>

      <InvoicesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvoiceAdded={handleInvoiceUpdated}
      />

      {editingInvoice && (
        <InvoicesEdit
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onInvoiceUpdated={handleInvoiceUpdated}
          invoice={editingInvoice}
        />
      )}
    </Card>
  );
}
