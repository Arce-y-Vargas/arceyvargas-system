"use client";

import React, { useState } from "react";
import { Calculator, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PanelDePlanilla() {
  const [planilla] = useState([
    {
      id: "EMP-001",
      nombre: "Carlos Pérez",
      puesto: "Gerente General",
      salario: 5000,
      bonificacion: 200,
      deducciones: 300,
      pagoNeto: 4900,
    },
    {
      id: "EMP-002",
      nombre: "María López",
      puesto: "Gerente Administrativa",
      salario: 4000,
      bonificacion: 150,
      deducciones: 200,
      pagoNeto: 3950,
    },
    {
      id: "EMP-003",
      nombre: "Jorge Castillo",
      puesto: "Gerente de Operaciones",
      salario: 4500,
      bonificacion: 250,
      deducciones: 300,
      pagoNeto: 4450,
    },
  ]);

  const totalSalario = planilla.reduce((acc, emp) => acc + emp.salario, 0);
  const totalBonificaciones = planilla.reduce(
    (acc, emp) => acc + emp.bonificacion,
    0
  );
  const totalDeducciones = planilla.reduce(
    (acc, emp) => acc + emp.deducciones,
    0
  );
  const totalPagoNeto = planilla.reduce((acc, emp) => acc + emp.pagoNeto, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Planilla</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-muted-foreground">
                Salario Total
              </dt>
              <dd className="text-2xl font-semibold">
                ${totalSalario.toFixed(2)}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-muted-foreground">
                Bonificaciones Totales
              </dt>
              <dd className="text-2xl font-semibold">
                ${totalBonificaciones.toFixed(2)}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-muted-foreground">
                Deducciones Totales
              </dt>
              <dd className="text-2xl font-semibold">
                ${totalDeducciones.toFixed(2)}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-muted-foreground">
                Pago Neto Total
              </dt>
              <dd className="text-2xl font-semibold">
                ${totalPagoNeto.toFixed(2)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-4">
        <Button className="w-48 bg-blue-600">
          <Calculator className="mr-2 h-4 w-4 " /> Calcular Planilla
        </Button>
        <Button variant="destructive" className="w-48">
          <FileText className="mr-2 h-4 w-4" /> Generar PDF
        </Button>
        <Button variant="secondary" className="w-48">
          <Download className="mr-2 h-4 w-4" /> Exportar a Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de Planilla por Empleado</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Empleado</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Puesto</TableHead>
                <TableHead>Salario</TableHead>
                <TableHead>Bonificación</TableHead>
                <TableHead>Deducciones</TableHead>
                <TableHead>Pago Neto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planilla.map((empleado) => (
                <TableRow key={empleado.id}>
                  <TableCell className="font-medium">{empleado.id}</TableCell>
                  <TableCell>{empleado.nombre}</TableCell>
                  <TableCell>{empleado.puesto}</TableCell>
                  <TableCell>${empleado.salario.toFixed(2)}</TableCell>
                  <TableCell>${empleado.bonificacion.toFixed(2)}</TableCell>
                  <TableCell>${empleado.deducciones.toFixed(2)}</TableCell>
                  <TableCell className="font-bold">
                    ${empleado.pagoNeto.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Descargar Recibo"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
