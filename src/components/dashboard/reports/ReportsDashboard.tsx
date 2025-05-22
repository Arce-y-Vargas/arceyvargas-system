"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { getEmployees, updateVacaciones } from "@/lib/employees";
import { getVacations } from "@/lib/vacations";
import { getHorasExtras } from "@/lib/horasExtras";
import { getInventoryItems } from "@/lib/inventory";
import { addTransaction, getFinanceSummary } from "@/lib/finances";
import { obtenerResumenFacturacion } from "@/lib/facturation";
import exportData, {
  formatCurrency,
  type ExportConfig,
} from "@/lib/export-service";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Users,
  Calendar,
  Clock,
  Package,
  Receipt,
  Wallet,
  BarChart3,
  PlusCircle,
  FileText,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ReportesPage() {
  const [data, setData] = useState({
    empleados: 0,
    vacaciones: 0,
    horasExtras: 0,
    inventario: 0,
    totalInventario: 0,
    facturado: 0,
    pagado: 0,
    saldo: 0,
    ingresos: 0,
    egresos: 0,
    balance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(0);
  const [activeTab, setActiveTab] = useState("general");

  // Estados para ingresos
  const [montoIngreso, setMontoIngreso] = useState("");
  const [categoriaIngreso, setCategoriaIngreso] = useState("Ventas");
  const [descripcionIngreso, setDescripcionIngreso] = useState("");

  // Estados para egresos
  const [montoEgreso, setMontoEgreso] = useState("");
  const [categoriaEgreso, setCategoriaEgreso] = useState("Gastos Operativos");
  const [descripcionEgreso, setDescripcionEgreso] = useState("");

  // Función para formatear números grandes (solo para inventario, no para montos)
  const formatNumber = (num, isMonetary = false, maxLength = 8) => {
    if (isMonetary) {
      return num.toLocaleString();
    }

    const numStr = num.toString();
    if (numStr.length > maxLength) {
      return numStr.substring(0, maxLength) + "...";
    }
    return numStr;
  };

  // Función para cargar los datos
  const loadData = async () => {
    setLoading(true);
    try {
      await updateVacaciones();
      const empleados = await getEmployees();
      const vacaciones = await getVacations();
      const horas = await getHorasExtras();
      const inventario = await getInventoryItems();
      const facturacion = await obtenerResumenFacturacion();
      const finanzas = await getFinanceSummary();

      const horasTotales = horas.reduce((acc, h) => {
        const valores = Object.values(h).filter(
          (v) => typeof v === "number"
        ) as number[];
        return acc + valores.reduce((sum, n) => sum + n, 0);
      }, 0);

      const totalCantidadInventario = inventario.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      setData({
        empleados: empleados.length,
        vacaciones: vacaciones.length,
        horasExtras: horasTotales,
        inventario: inventario.length,
        totalInventario: totalCantidadInventario,
        facturado: facturacion.totalFacturado,
        pagado: facturacion.totalPagado,
        saldo: facturacion.totalSaldo,
        ingresos: finanzas.totalIncome,
        egresos: finanzas.totalExpenses,
        balance: finanzas.balance,
      });
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar los ingresos
  const handleAgregarIngreso = async () => {
    if (
      montoIngreso &&
      !isNaN(Number(montoIngreso)) &&
      Number(montoIngreso) > 0
    ) {
      try {
        const nuevoIngreso = Number(montoIngreso);

        // Guardar en Firebase
        await addTransaction("admin", {
          type: "income",
          amount: nuevoIngreso,
          category: categoriaIngreso,
          date: new Date().toISOString(),
          description: descripcionIngreso,
          status: "active",
        });

        // Actualizar la interfaz
        setRefreshData((prev) => prev + 1);

        // Limpiar el formulario
        setMontoIngreso("");
        setDescripcionIngreso("");

        toast({
          title: "Ingreso agregado",
          description: `Se ha agregado ₡${nuevoIngreso.toLocaleString()} a los ingresos.`,
        });
      } catch (error) {
        console.error("Error al agregar ingreso:", error);
        toast({
          title: "Error",
          description: "No se pudo agregar el ingreso. Intente nuevamente.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Ingrese un monto válido mayor a cero.",
        variant: "destructive",
      });
    }
  };

  // Funciones para manejar los egresos
  const handleAgregarEgreso = async () => {
    if (montoEgreso && !isNaN(Number(montoEgreso)) && Number(montoEgreso) > 0) {
      try {
        const nuevoEgreso = Number(montoEgreso);

        // Guardar en Firebase
        await addTransaction("admin", {
          type: "expense",
          amount: nuevoEgreso,
          category: categoriaEgreso,
          date: new Date().toISOString(),
          description: descripcionEgreso,
          status: "active",
        });

        // Actualizar la interfaz
        setRefreshData((prev) => prev + 1);

        // Limpiar el formulario
        setMontoEgreso("");
        setDescripcionEgreso("");

        toast({
          title: "Egreso agregado",
          description: `Se ha agregado ₡${nuevoEgreso.toLocaleString()} a los egresos.`,
        });
      } catch (error) {
        console.error("Error al agregar egreso:", error);
        toast({
          title: "Error",
          description: "No se pudo agregar el egreso. Intente nuevamente.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Ingrese un monto válido mayor a cero.",
        variant: "destructive",
      });
    }
  };

  // Configuraciones de exportación para cada pestaña
  const getGeneralExportConfig = (): ExportConfig => {
    return {
      title: "Reporte General",
      subtitle: "Resumen de métricas clave",
      filename: "Reporte_General",
      companyName: "Arce & Vargas",
      logoPath: "/img/logo_2_white.png",
      columns: [
        { header: "Métrica", key: "name", width: 40 },
        {
          header: "Valor",
          key: "value",
          width: 30,
          format: (value) =>
            typeof value === "number" && value > 1000
              ? value.toLocaleString()
              : String(value),
          align: "right",
        },
      ],
      data: resumen,
      summary: {
        title: "Resumen de Métricas",
        calculations: [
          { label: "Total de Empleados", value: data.empleados },
          {
            label: "Balance Financiero",
            value: data.balance,
            format: (value) => formatCurrency(value),
          },
        ],
      },
      styles: {
        primaryColor: [0, 90, 170],
        secondaryColor: [100, 100, 100],
        lightColor: [240, 240, 240],
      },
    };
  };

  const getEmpleadosExportConfig = (): ExportConfig => {
    return {
      title: "Reporte de Empleados",
      subtitle: "Información de personal",
      filename: "Reporte_Empleados",
      companyName: "Arce & Vargas",
      logoPath: "/img/logo_2_white.png",
      columns: [
        { header: "Métrica", key: "name", width: 40 },
        { header: "Valor", key: "value", width: 30, align: "right" },
      ],
      data: [
        { name: "Total de Empleados", value: data.empleados },
        { name: "Solicitudes de Vacaciones", value: data.vacaciones },
        { name: "Horas Extra", value: data.horasExtras },
      ],
      summary: {
        title: "Resumen de Personal",
        calculations: [
          { label: "Total de Empleados", value: data.empleados },
          {
            label: "Promedio de Horas Extra por Empleado",
            value: data.empleados
              ? (data.horasExtras / data.empleados).toFixed(2)
              : 0,
          },
        ],
      },
      styles: {
        primaryColor: [0, 90, 170],
        secondaryColor: [100, 100, 100],
        lightColor: [240, 240, 240],
      },
    };
  };

  const getInventarioExportConfig = (): ExportConfig => {
    return {
      title: "Reporte de Inventario",
      subtitle: "Resumen de existencias",
      filename: "Reporte_Inventario",
      companyName: "Arce & Vargas",
      logoPath: "/img/logo_2_white.png",
      columns: [
        { header: "Métrica", key: "name", width: 40 },
        { header: "Valor", key: "value", width: 30, align: "right" },
      ],
      data: [
        { name: "Total de Ítems", value: data.inventario },
        { name: "Total en Existencia", value: data.totalInventario },
      ],
      summary: {
        title: "Resumen de Inventario",
        calculations: [
          {
            label: "Promedio de Unidades por Ítem",
            value: data.inventario
              ? (data.totalInventario / data.inventario).toFixed(2)
              : 0,
          },
        ],
      },
      styles: {
        primaryColor: [0, 90, 170],
        secondaryColor: [100, 100, 100],
        lightColor: [240, 240, 240],
      },
    };
  };

  const getFacturacionExportConfig = (): ExportConfig => {
    return {
      title: "Reporte de Facturación",
      subtitle: "Resumen de facturación",
      filename: "Reporte_Facturacion",
      companyName: "Arce & Vargas",
      logoPath: "/img/logo_2_white.png",
      columns: [
        { header: "Métrica", key: "name", width: 40 },
        {
          header: "Valor",
          key: "value",
          width: 30,
          format: (value) => formatCurrency(value),
          align: "right",
        },
      ],
      data: [
        { name: "Monto Facturado", value: data.facturado },
        { name: "Monto Pagado", value: data.pagado },
        { name: "Saldo Pendiente", value: data.saldo },
      ],
      summary: {
        title: "Resumen de Facturación",
        calculations: [
          {
            label: "Porcentaje de Cobro",
            value: data.facturado
              ? ((data.pagado / data.facturado) * 100).toFixed(2) + "%"
              : "0%",
          },
        ],
      },
      styles: {
        primaryColor: [0, 90, 170],
        secondaryColor: [100, 100, 100],
        lightColor: [240, 240, 240],
      },
    };
  };

  const getFinanzasExportConfig = (): ExportConfig => {
    return {
      title: "Reporte Financiero",
      subtitle: "Resumen de ingresos y egresos",
      filename: "Reporte_Financiero",
      companyName: "Arce & Vargas",
      logoPath: "/img/logo_2_white.png",
      columns: [
        { header: "Métrica", key: "name", width: 40 },
        {
          header: "Valor",
          key: "value",
          width: 30,
          format: (value) => formatCurrency(value),
          align: "right",
        },
      ],
      data: [
        { name: "Ingresos Totales", value: data.ingresos },
        { name: "Egresos Totales", value: data.egresos },
        { name: "Balance Final", value: data.balance },
      ],
      summary: {
        title: "Resumen Financiero",
        calculations: [
          {
            label: "Ratio Ingresos/Egresos",
            value: data.egresos
              ? (data.ingresos / data.egresos).toFixed(2)
              : "N/A",
          },
        ],
      },
      styles: {
        primaryColor: [0, 90, 170],
        secondaryColor: [100, 100, 100],
        lightColor: [240, 240, 240],
      },
    };
  };

  // Función para exportar a PDF según la pestaña activa
  const handleExportToPDF = () => {
    if (loading) {
      toast({
        title: "Espere por favor",
        description:
          "Los datos están cargando. Intente nuevamente en unos segundos.",
        variant: "destructive",
      });
      return;
    }

    try {
      let exportConfig: ExportConfig;

      switch (activeTab) {
        case "general":
          exportConfig = getGeneralExportConfig();
          break;
        case "empleados":
          exportConfig = getEmpleadosExportConfig();
          break;
        case "inventario":
          exportConfig = getInventarioExportConfig();
          break;
        case "facturacion":
          exportConfig = getFacturacionExportConfig();
          break;
        case "finanzas":
          exportConfig = getFinanzasExportConfig();
          break;
        default:
          exportConfig = getGeneralExportConfig();
      }

      exportData.toPDF(exportConfig);

      toast({
        title: "Exportación exitosa",
        description: "El reporte se ha exportado correctamente.",
      });
    } catch (error) {
      console.error("Error al exportar a PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo exportar el reporte. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshData]);

  const resumen = [
    {
      name: "Empleados",
      value: data.empleados,
      icon: <Users className="h-4 w-4" />,
    },
    {
      name: "Vacaciones",
      value: data.vacaciones,
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      name: "Horas Extras",
      value: data.horasExtras,
      icon: <Clock className="h-4 w-4" />,
    },
    {
      name: "Inventario",
      value: data.totalInventario,
      icon: <Package className="h-4 w-4" />,
    },
    {
      name: "Facturado",
      value: data.facturado,
      icon: <Receipt className="h-4 w-4" />,
    },
    {
      name: "Ingresos",
      value: data.ingresos,
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      name: "Egresos",
      value: data.egresos,
      icon: <Wallet className="h-4 w-4" />,
    },
  ];

  const chartConfig = {
    general: {
      label: "Resumen General",
      color: "#3b82f6",
    },
    value: {
      label: "Valor",
      color: "#3b82f6",
    },
  };

  const categoriasIngresos = [
    "Ventas",
    "Servicios",
    "Inversiones",
    "Préstamos",
    "Otros Ingresos",
  ];

  const categoriasEgresos = [
    "Gastos Operativos",
    "Salarios",
    "Impuestos",
    "Alquiler",
    "Servicios Públicos",
    "Mantenimiento",
    "Compras",
    "Otros Gastos",
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 p-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Panel de Reportes
          </h1>
          <p className="text-muted-foreground">
            Visualización de métricas y estadísticas clave de la empresa
          </p>
        </div>
        <Button
          onClick={() => setRefreshData((prev) => prev + 1)}
          variant="outline"
          className="border-blue-500 text-blue-700 hover:bg-blue-50"
        >
          Actualizar Datos
        </Button>
      </div>

      <Tabs
        defaultValue="general"
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6 w-full bg-gradient-to-r from-gray-100 to-gray-200 p-1 rounded-lg">
          <TabsTrigger
            value="general"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger
            value="empleados"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Empleados</span>
          </TabsTrigger>
          <TabsTrigger
            value="inventario"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
          >
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Inventario</span>
          </TabsTrigger>
          <TabsTrigger
            value="facturacion"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Facturación</span>
          </TabsTrigger>
          <TabsTrigger
            value="finanzas"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Finanzas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleExportToPDF}
              size="sm"
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white border-none shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar Reporte General
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Empleados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(data.empleados)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700">
                      Inventario
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="bg-purple-200 p-2 rounded-full">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      <div
                        className="text-2xl font-bold text-purple-600"
                        title={data.totalInventario.toLocaleString()}
                      >
                        {formatNumber(data.totalInventario)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-700">
                      Facturación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="bg-amber-200 p-2 rounded-full">
                        <Receipt className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="text-2xl font-bold text-amber-600">
                        ₡{formatNumber(data.facturado, true)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`bg-gradient-to-br ${
                    data.balance >= 0
                      ? "from-emerald-50 to-emerald-100 border-emerald-200"
                      : "from-rose-50 to-rose-100 border-rose-200"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle
                      className={`text-sm font-medium ${
                        data.balance >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div
                        className={`${
                          data.balance >= 0 ? "bg-emerald-200" : "bg-rose-200"
                        } p-2 rounded-full`}
                      >
                        <Wallet
                          className={`h-5 w-5 ${
                            data.balance >= 0
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        />
                      </div>
                      <div className="flex items-center">
                        {data.balance >= 0 ? (
                          <ArrowUpIcon className="mr-1 h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowDownIcon className="mr-1 h-4 w-4 text-rose-500" />
                        )}
                        <div
                          className={`text-2xl font-bold ${
                            data.balance >= 0
                              ? "text-emerald-500"
                              : "text-rose-500"
                          }`}
                        >
                          ₡{formatNumber(Math.abs(data.balance), true)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resumen General</CardTitle>
              <CardDescription>
                Visualización de las métricas clave
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resumen}>
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      {payload[0].name}
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                      {payload[0].value}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#8884d8">
                        {resumen.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === 0
                                ? "#3b82f6"
                                : // azul para empleados
                                index === 1
                                ? "#8b5cf6"
                                : // púrpura para vacaciones
                                index === 2
                                ? "#f59e0b"
                                : // ámbar para horas extras
                                index === 3
                                ? "#10b981"
                                : // esmeralda para inventario
                                index === 4
                                ? "#f43f5e"
                                : // rosa para facturado
                                index === 5
                                ? "#06b6d4"
                                : // cyan para ingresos
                                  "#ef4444" // rojo para egresos
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empleados">
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleExportToPDF}
              size="sm"
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white border-none shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar Reporte de Empleados
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <div className="bg-blue-200 p-2 rounded-full">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  Total de Empleados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div
                    className="text-3xl font-bold text-blue-600"
                    title={data.empleados.toLocaleString()}
                  >
                    {formatNumber(data.empleados)}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-blue-500">
                  Número total de empleados activos
                </p>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Solicitudes de Vacaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="text-3xl font-bold">{data.vacaciones}</div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Solicitudes de vacaciones pendientes
                </p>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horas Extra
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="text-3xl font-bold">{data.horasExtras}</div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Total de horas extra acumuladas
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventario">
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleExportToPDF}
              size="sm"
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white border-none shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar Reporte de Inventario
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Total Ítems
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="text-3xl font-bold">{data.inventario}</div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Número total de productos diferentes
                </p>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Total en Existencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div
                    className="text-3xl font-bold"
                    title={data.totalInventario.toLocaleString()}
                  >
                    {formatNumber(data.totalInventario)}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Cantidad total de unidades en inventario
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="facturacion">
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleExportToPDF}
              size="sm"
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white border-none shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar Reporte de Facturación
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Monto Facturado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="text-3xl font-bold">
                    ₡{formatNumber(data.facturado, true)}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Total facturado a clientes
                </p>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Monto Pagado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="text-3xl font-bold">
                    ₡{formatNumber(data.pagado, true)}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Total recibido de clientes
                </p>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Saldo Pendiente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="text-3xl font-bold">
                    ₡{formatNumber(data.saldo, true)}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Monto pendiente por cobrar
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finanzas">
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleExportToPDF}
              size="sm"
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white border-none shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar Reporte Financiero
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpIcon className="h-5 w-5 text-emerald-500" />
                  Ingresos Totales
                </CardTitle>
                <CardDescription>Gestión de ingresos</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="text-3xl font-bold text-emerald-500">
                    ₡{formatNumber(data.ingresos, true)}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none shadow-sm"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Agregar</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Agregar Ingreso</DialogTitle>
                      <DialogDescription>
                        Ingrese los detalles del nuevo ingreso.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="monto" className="text-right">
                          Monto
                        </Label>
                        <div className="col-span-3 flex items-center">
                          <span className="mr-2">₡</span>
                          <Input
                            id="monto"
                            type="number"
                            value={montoIngreso}
                            onChange={(e) => setMontoIngreso(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="categoria" className="text-right">
                          Categoría
                        </Label>
                        <div className="col-span-3">
                          <Select
                            value={categoriaIngreso}
                            onValueChange={setCategoriaIngreso}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoriasIngresos.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="descripcion" className="text-right">
                          Descripción
                        </Label>
                        <Textarea
                          id="descripcion"
                          value={descripcionIngreso}
                          onChange={(e) =>
                            setDescripcionIngreso(e.target.value)
                          }
                          placeholder="Descripción del ingreso"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleAgregarIngreso}>
                        Agregar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setRefreshData((prev) => prev + 1)}
                >
                  <ArrowUpIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Actualizar</span>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownIcon className="h-5 w-5 text-rose-500" />
                  Egresos Totales
                </CardTitle>
                <CardDescription>Gestión de egresos</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="text-3xl font-bold text-rose-500">
                    ₡{formatNumber(data.egresos, true)}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none shadow-sm"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Agregar</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Agregar Egreso</DialogTitle>
                      <DialogDescription>
                        Ingrese los detalles del nuevo egreso.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="monto-egreso" className="text-right">
                          Monto
                        </Label>
                        <div className="col-span-3 flex items-center">
                          <span className="mr-2">₡</span>
                          <Input
                            id="monto-egreso"
                            type="number"
                            value={montoEgreso}
                            onChange={(e) => setMontoEgreso(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="categoria-egreso"
                          className="text-right"
                        >
                          Categoría
                        </Label>
                        <div className="col-span-3">
                          <Select
                            value={categoriaEgreso}
                            onValueChange={setCategoriaEgreso}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoriasEgresos.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="descripcion-egreso"
                          className="text-right"
                        >
                          Descripción
                        </Label>
                        <Textarea
                          id="descripcion-egreso"
                          value={descripcionEgreso}
                          onChange={(e) => setDescripcionEgreso(e.target.value)}
                          placeholder="Descripción del egreso"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleAgregarEgreso}>
                        Agregar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setRefreshData((prev) => prev + 1)}
                >
                  <ArrowUpIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Actualizar</span>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Balance Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div
                    className={`text-3xl font-bold ${
                      data.balance >= 0 ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    ₡{formatNumber(data.balance, true)}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Diferencia entre ingresos y egresos
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
