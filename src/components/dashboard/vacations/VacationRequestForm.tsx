"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { requestVacation } from "@/lib/vacations";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { updateVacaciones } from "@/lib/employees";

export function VacationRequestForm() {
  const [userCedula, setUserCedula] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [requestedDays, setRequestedDays] = useState<number>(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const localToday = today.toISOString().split("T")[0];
  const [diasDisponibles, setDiasDisponibles] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const cedula = userDoc.data().cedula;
          setUserCedula(cedula);
          setUserName(userDoc.data().nombre || user.displayName);

          const empleadoDoc = await getDoc(doc(db, "employees", cedula));
          if (empleadoDoc.exists()) {
            const data = empleadoDoc.data();
            setDiasDisponibles(data.vacaciones || 0);
          }
        }
      } else {
        setUserCedula(null);
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        const days = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1
        );
        setRequestedDays(days);
      } else {
        setRequestedDays(0);
      }
    } else {
      setRequestedDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!userCedula) {
      setError("No se pudo obtener la cédula del usuario.");
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      setError("Las fechas ingresadas no son válidas.");
      return;
    }

    if (requestedDays < 1) {
      setError("Debe solicitar al menos un día de vacaciones.");
      return;
    }

    if (requestedDays > diasDisponibles) {
      setError(
        `Solo tiene ${diasDisponibles} día(s) disponible(s) para solicitar.`
      );
      return;
    }

    setLoading(true);

    try {
      await requestVacation({
        cedula: userCedula,
        startDate: formData.startDate,
        endDate: formData.endDate,
        requestedDays,
        status: "pending",
        reason: formData.reason,
      });

      setSuccess(true);
      setFormData({ startDate: "", endDate: "", reason: "" });
    } catch (error) {
      setError("Hubo un error al enviar la solicitud. Inténtalo de nuevo.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Solicitud de Vacaciones
            </CardTitle>
            <CardDescription>
              Complete el formulario para solicitar sus días de vacaciones
            </CardDescription>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={async () => {
                await updateVacaciones();
                if (userCedula) {
                  const empleadoDoc = await getDoc(
                    doc(db, "employees", userCedula)
                  );
                  if (empleadoDoc.exists()) {
                    const data = empleadoDoc.data();
                    setDiasDisponibles(data.vacaciones || 0);
                  }
                }
              }}
            >
              Actualizar días disponibles
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle>Solicitud enviada</AlertTitle>
              <AlertDescription>
                Tu solicitud de vacaciones ha sido enviada correctamente.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                  className="text-black [&::-webkit-calendar-picker-indicator]:invert h-10"
                  min={localToday}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                  className="text-black [&::-webkit-calendar-picker-indicator]:invert h-10"
                  min={localToday}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Motivo</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Describa brevemente el motivo de su solicitud de vacaciones..."
                className="min-h-[100px] sm:min-h-[120px] resize-none"
                required
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-right">
            Días disponibles:{" "}
            <span className="font-semibold">{diasDisponibles}</span>
          </p>

          {requestedDays > 0 && (
            <div className="rounded-lg bg-blue-50 p-3 sm:p-4 text-blue-800 border border-blue-200">
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span>Resumen de solicitud</span>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  Período: {formatDate(formData.startDate)} al{" "}
                  {formatDate(formData.endDate)}
                </p>
                <p className="font-semibold">
                  Total de días solicitados: {requestedDays}
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className=" bg-blue-600 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando solicitud...
              </>
            ) : (
              "Solicitar Vacaciones"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="border-t py-3 sm:py-4 px-4 sm:px-6 bg-muted/20">
        <div className="text-sm text-muted-foreground">
          {userName ? (
            <p>
              Solicitante: <span className="font-medium">{userName}</span>
            </p>
          ) : (
            <p>Inicie sesión para solicitar vacaciones</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
