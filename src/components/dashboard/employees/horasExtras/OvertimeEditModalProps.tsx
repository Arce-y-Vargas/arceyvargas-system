"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateHorasExtras } from "@/lib/horasExtras";
import { toast } from "@/hooks/use-toast";

interface HorasExtras {
  cedula: string;
  nombre: string;
  lunes: number;
  martes: number;
  miércoles: number;
  jueves: number;
  viernes: number;
  sábado: number;
  domingo: number;
}

interface OvertimeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordUpdated: () => void;
  record: HorasExtras;
}

const formSchema = z.object({
  lunes: z.coerce.number().min(0, "No puede ser negativo"),
  martes: z.coerce.number().min(0, "No puede ser negativo"),
  miércoles: z.coerce.number().min(0, "No puede ser negativo"),
  jueves: z.coerce.number().min(0, "No puede ser negativo"),
  viernes: z.coerce.number().min(0, "No puede ser negativo"),
  sábado: z.coerce.number().min(0, "No puede ser negativo"),
  domingo: z.coerce.number().min(0, "No puede ser negativo"),
});

export default function OvertimeEditModal({
  isOpen,
  onClose,
  onRecordUpdated,
  record,
}: OvertimeEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lunes: record.lunes,
      martes: record.martes,
      miércoles: record.miércoles,
      jueves: record.jueves,
      viernes: record.viernes,
      sábado: record.sábado,
      domingo: record.domingo,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await updateHorasExtras(record.cedula, values);
      toast({
        title: "Horas extras actualizadas",
        description: `Se actualizaron las horas extras para ${record.nombre}`,
      });
      onRecordUpdated();
      onClose();
    } catch (error) {
      console.error("Error al actualizar horas extras:", error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar las horas extras",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>Editar Horas Extras</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">{record.nombre}</h3>
            <p className="text-sm text-muted-foreground">
              Cédula: {record.cedula}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lunes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lunes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="martes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Martes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="miércoles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miércoles</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jueves"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jueves</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="viernes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Viernes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sábado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sábado</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="domingo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domingo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
