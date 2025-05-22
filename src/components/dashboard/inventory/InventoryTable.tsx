"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Filter, FileText } from "lucide-react";
import {
  getInventoryItems,
  deleteInventoryItem,
  type InventoryItem,
} from "@/lib/inventory";
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
import EditItemModal from "./EditItemModal";
import AddItemModal from "./AddItemModal";
import exportData, { type ExportConfig } from "@/lib/export-service";

const statusColors: Record<string, string> = {
  Disponible: "bg-green-500 text-white",
  "Stock Bajo": "bg-orange-500 text-white",
  Agotado: "bg-red-500 text-white",
  Descontinuado: "bg-gray-500 text-white",
};

const categoryColors: Record<string, string> = {
  "MAQUINARIA Y EQUIPO": "bg-blue-500 text-white",
  "MOBILIARIO Y EQUIPO": "bg-purple-500 text-white",
  VEHICULOS: "bg-yellow-500 text-black",
};

export function InventoryTable() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [inventory, searchQuery, categoryFilter, statusFilter]);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const items = await getInventoryItems();
      setInventory(items);
      setFilteredInventory(items);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterInventory = () => {
    let filtered = [...inventory];

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "todos") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredInventory(filtered);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      await loadInventory();
    } catch (error) {
      console.error("Error al eliminar ítem:", error);
    }
  };

  const handleItemAdded = () => {
    setAddModalOpen(false);
    loadInventory();
  };

  const handleItemUpdated = () => {
    setEditModalOpen(false);
    loadInventory();
  };

  const categories = Array.from(
    new Set(inventory.map((item) => item.category))
  );

  const statuses = Array.from(new Set(inventory.map((item) => item.status)));

  const formatCurrency = (value: number): string => {
    return `CRC ${value.toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getExportConfig = (): ExportConfig => {
    const totalValue = filteredInventory.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const totalItems = filteredInventory.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Group items by category
    const categoryGroups = filteredInventory.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          count: 0,
          total: 0,
        };
      }
      acc[item.category].count += item.quantity;
      acc[item.category].total += item.total;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return {
      title: "Reporte de Inventario",
      subtitle: "Listado de ítems en inventario",
      filename: "Inventario",
      companyName: "Arce & Vargas",
      logoPath: "/img/logo_2_white.png",

      columns: [
        { header: "Nombre", key: "name", width: 40 },
        { header: "Categoría", key: "category", width: 35 },
        {
          header: "Cantidad",
          key: "quantity",
          width: 20,
          align: "center",
        },
        {
          header: "Precio Unitario",
          key: "pricePerUnit",
          width: 30,
          format: (value) => formatCurrency(value),
          align: "right",
        },
        {
          header: "Total",
          key: "total",
          width: 30,
          format: (value) => formatCurrency(value),
          align: "right",
        },
      ],

      data: filteredInventory,

      summary: {
        title: "Resumen de Inventario",
        calculations: [
          { label: "Total de ítems", value: filteredInventory.length },
          {
            label: "Cantidad total de unidades",
            value: totalItems,
          },
          {
            label: "Valor total del inventario",
            value: totalValue,
            format: (value) => formatCurrency(value),
          },
        ],
        groupBy: {
          key: "category",
          title: "Categoría",
          countLabel: "Cantidad",
          percentLabel: "Porcentaje",
        },
      },

      styles: {
        primaryColor: [0, 90, 170],
        secondaryColor: [100, 100, 100],
        lightColor: [240, 240, 240],
      },
    };
  };

  const handleExportToPDF = () => {
    exportData.toPDF(getExportConfig());
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Inventario</CardTitle>
            <CardDescription>
              Gestione ítems, categorías, stock y ubicaciones.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setAddModalOpen(true)}
              className="self-start sm:self-auto bg-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar Ítem
            </Button>
            <Button
              onClick={handleExportToPDF}
              variant="outline"
              className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
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
                placeholder="Buscar por código, nombre o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No se encontraron ítems en el inventario.
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
                      Categoría
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Cantidad
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Precio Unitario
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Total
                    </TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {item.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          className={
                            categoryColors[item.category] ||
                            "bg-gray-500 text-white"
                          }
                        >
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.pricePerUnit}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.total}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
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
            Mostrando {filteredInventory.length} de {inventory.length} ítems
          </div>
          {filteredInventory.length > 0 && (
            <div className="font-medium">
              Total de ítems:{" "}
              {filteredInventory.reduce((sum, item) => sum + item.quantity, 0)}{" "}
              unidades
            </div>
          )}
        </div>
      </CardFooter>

      {selectedItem && (
        <EditItemModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          item={selectedItem}
        />
      )}

      <AddItemModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onItemAdded={handleItemAdded}
      />
    </Card>
  );
}
