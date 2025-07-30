"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, Filter, FileText } from "lucide-react";
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
import { getQuotes, deleteQuote } from "@/lib/quotes";
import QuoteEdit from "./QuoteEdit";
import QuoteModal from "./QuoteModal";
import exportData, {
  formatCurrency,
  formatDate,
  type ExportConfig,
} from "@/lib/export-service";

interface Quote {
  id: string;
  client: string;
  date: string;
  total: number;
  status: string;
  items: string;
  createdBy: string;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Pendiente": return "bg-yellow-500 text-black";
    case "Aprobada": return "bg-green-500 text-white";
    case "Rechazada": return "bg-red-500 text-white";
    case "En proceso": return "bg-blue-500 text-white";
    case "Completada": return "bg-purple-500 text-white";
    default: return "bg-gray-500";
  }
};

export default function QuotesTable() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [clientFilter, setClientFilter] = useState("todos");

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchQuery, statusFilter, clientFilter, filterQuotes]);

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const data = await getQuotes();
      setQuotes(data);
      setFilteredQuotes(data);
    } catch (error) {
      console.error("Error al obtener cotizaciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuotes = useCallback(() => {
    let filtered = [...quotes];

    if (searchQuery) {
      filtered = filtered.filter(
        (quote) =>
          quote.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quote.items.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quote.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter((quote) => quote.status === statusFilter);
    }

    if (clientFilter !== "todos") {
      filtered = filtered.filter((quote) => quote.client === clientFilter);
    }

    setFilteredQuotes(filtered);
  }, [quotes, searchQuery, statusFilter, clientFilter]);

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuote(id);
      await fetchQuotes();
    } catch (error) {
      console.error("Error al eliminar cotización:", error);
    }
  };

  const getExportConfig = (): ExportConfig => {
    const totalAmount = filteredQuotes.reduce(
      (sum, quote) => sum + quote.total,
      0
    );

    return {
      title: "Reporte de Cotizaciones",
      subtitle: "Listado de cotizaciones",
      filename: "Cotizaciones",
      companyName: "Arce & Vargas",
      logoPath: "/img/logo_2_white.png",

      columns: [
        {
          header: "Fecha",
          key: "date",
          width: 30,
          format: (value) => formatDate(value),
        },
        { header: "Cliente", key: "client", width: 35 },
        {
          header: "Total",
          key: "total",
          width: 25,
          format: (value) => formatCurrency(value),
          align: "right",
        },
        { header: "Estado", key: "status", width: 25, align: "center" },
        { header: "Items", key: "items", width: 40 },
        { header: "Creado por", key: "createdBy", width: 30 },
      ],

      data: filteredQuotes,

      summary: {
        title: "Resumen de Cotizaciones",
        calculations: [
          { label: "Total de cotizaciones", value: filteredQuotes.length },
          {
            label: "Monto total",
            value: totalAmount,
            format: (value) => formatCurrency(value),
          },
        ],
        groupBy: {
          key: "status",
          title: "Estado",
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

  const clients = Array.from(new Set(quotes.map((quote) => quote.client)));
  const statuses = Array.from(new Set(quotes.map((quote) => quote.status)));

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">Cotizaciones</CardTitle>
            <CardDescription>
              Gestione cotizaciones, clientes y genere reportes.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-blue-700 text-white hover:bg-blue-800"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4 " /> Agregar Cotización
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

      <CardContent className="p-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, cliente, items o creador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
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
                      <Badge className={getStatusColor(status)}>
                        {status}
                      </Badge>
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
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No se encontraron cotizaciones.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Cliente
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Fecha
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Total
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Estado
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Items
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">
                      Creado por
                    </TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="whitespace-nowrap">
                        {quote.client}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(quote.date)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatCurrency(quote.total)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          className={getStatusColor(quote.status)}
                        >
                          {quote.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {quote.items}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {quote.createdBy}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(quote)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(quote.id)}
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
            Mostrando {filteredQuotes.length} de {quotes.length} cotizaciones
          </div>
          {filteredQuotes.length > 0 && (
            <div className="font-medium">
              Total:{" "}
              {formatCurrency(
                filteredQuotes.reduce((sum, quote) => sum + quote.total, 0)
              )}
            </div>
          )}
        </div>
      </CardFooter>

      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchQuotes}
      />

      {editingQuote && (
        <QuoteEdit
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={fetchQuotes}
          quote={editingQuote}
        />
      )}
    </Card>
  );
}
