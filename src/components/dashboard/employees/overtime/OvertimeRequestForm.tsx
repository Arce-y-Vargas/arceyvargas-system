"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { submitOvertimeRequest } from "@/lib/overtimeRequests";

const formSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida.",
  }).refine((date) => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return date >= thirtyDaysAgo && date <= today;
  }, {
    message: "La fecha debe estar entre los últimos 30 días y hoy.",
  }),
  startTime: z.string()
    .min(1, "La hora de inicio es requerida.")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
  endTime: z.string()
    .min(1, "La hora de fin es requerida.")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
  location: z.string()
    .min(1, "El lugar es requerido.")
    .min(3, "El lugar debe tener al menos 3 caracteres.")
    .max(100, "El lugar no puede exceder 100 caracteres.")
    .trim(),
  description: z.string()
    .min(1, "La descripción es requerida.")
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(500, "La descripción no puede exceder 500 caracteres.")
    .trim(),
  photoEvidence: z.any().optional(),
}).refine((data) => {
  if (!data.startTime || !data.endTime) return true;
  
  const start = new Date(`2000-01-01T${data.startTime}:00`);
  const end = new Date(`2000-01-01T${data.endTime}:00`);
  
  return end > start;
}, {
  message: "La hora de fin debe ser posterior a la hora de inicio.",
  path: ["endTime"],
});

interface OvertimeRequestFormProps {
  employeeId: string;
  employeeName: string;
  onSuccess?: () => void;
}

export default function OvertimeRequestForm({
  employeeId,
  employeeName,
  onSuccess,
}: OvertimeRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      startTime: "",
      endTime: "",
      location: "",
      description: "",
    },
  });

  const calculateOvertimeHours = (
    startTime: string,
    endTime: string
  ): number => {
    if (!startTime || !endTime) return 0;

    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);

    if (end <= start) return 0;

    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño del archivo
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no debe superar los 5MB.",
          variant: "destructive",
        });
        event.target.value = "";
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP).",
          variant: "destructive",
        });
        event.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Error al cargar la imagen.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Validaciones adicionales
      if (!values.date || !values.startTime || !values.endTime || !values.location?.trim() || !values.description?.trim()) {
        toast({
          title: "Error",
          description: "Todos los campos son obligatorios.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validar que la foto esté cargada
      if (!photoPreview) {
        toast({
          title: "Error",
          description: "La evidencia fotográfica es requerida.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const overtimeHours = calculateOvertimeHours(
        values.startTime,
        values.endTime
      );

      if (overtimeHours <= 0) {
        toast({
          title: "Error",
          description: "La hora de fin debe ser posterior a la hora de inicio.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validar que las horas extra no excedan 12 horas
      if (overtimeHours > 12) {
        toast({
          title: "Error",
          description: "Las horas extra no pueden exceder 12 horas por día.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      await submitOvertimeRequest({
        employeeId,
        employeeName,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        location: values.location,
        overtimeHours,
        description: values.description,
        photoEvidence: photoPreview || undefined,
      });

      toast({
        title: "Registro enviado",
        description:
          "Su registro de horas extra ha sido enviado para revisión.",
      });

      form.reset();
      setPhotoPreview(null);
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting overtime request:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el registro. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const overtimeHours = calculateOvertimeHours(startTime, endTime);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Registro de Horas Extra
        </CardTitle>
        <CardDescription>
          Complete el formulario para registrar las horas extra trabajadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Nota:</strong> Todos los campos marcados con <span className="text-red-500 dark:text-red-400">*</span> son obligatorios.
            La fecha debe estar dentro de los últimos 30 días.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha <span className="text-red-500">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Seleccione una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const today = new Date();
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(today.getDate() - 30);
                            return date > today || date < thirtyDaysAgo;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Lugar <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Oficina principal, Proyecto X..."
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de inicio <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="time" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de fin <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="time" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {overtimeHours > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Horas extra calculadas: {overtimeHours.toFixed(2)} horas
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del trabajo realizado <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa detalladamente las actividades realizadas durante las horas extra..."
                      className="min-h-[100px]"
                      {...field}
                      required
                      maxLength={500}
                    />
                  </FormControl>
                  <FormDescription>
                    Mínimo 10 caracteres, máximo 500 caracteres ({field.value?.length || 0}/500)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photoEvidence"
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Evidencia fotográfica <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormDescription>
                    Suba una imagen como evidencia del trabajo realizado (máximo 5MB).
                    Formatos permitidos: JPEG, PNG, GIF, WebP.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {photoPreview && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2 text-foreground">Vista previa:</p>
                <img
                  src={photoPreview}
                  alt="Vista previa"
                  className="max-w-full h-48 object-contain border border-border rounded-lg bg-background"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || overtimeHours <= 0 || !photoPreview}
              className="w-full"
            >
              {isLoading ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar registro
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
