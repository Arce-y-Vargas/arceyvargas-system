"use client";

import { useState, useRef, useEffect } from "react";
import type React from "react";
import {
  MessageSquare,
  Send,
  X,
  User,
  Users,
  Calendar,
  Clock,
  Package,
  Receipt,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getEmployees } from "@/lib/employees";
import { getVacations } from "@/lib/vacations";
import { getHorasExtras } from "@/lib/horasExtras";
import { getInventoryItems } from "@/lib/inventory";
import { getFinanceSummary } from "@/lib/finances";
import { obtenerResumenFacturacion } from "@/lib/facturation";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export default function Dashboard() {
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: `¡Hola! Soy el asistente del sistema Arce & Vargas.

Pregúntame cosas como:
• "¿Cómo agregar un empleado?"
• "¿Cómo crear un proyecto?"
• "¿Cómo generar reportes?"
• "¿Qué es nómina?"
• "¿Cómo solicitar vacaciones?"
• "¿Cómo crear una factura?"
• "¿Cómo navegar el sistema?"

También puedes escribir "ayuda general" para más información.`,
      role: "assistant",
      timestamp: new Date(),
    },
  ]);

  // Dashboard data states
  const [dashboardData, setDashboardData] = useState({
    empleados: 0,
    vacaciones: 0,
    horasExtras: 0,
    inventario: 0,
    facturado: 0,
    balance: 0,
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setDashboardLoading(true);
    try {
      const [empleados, vacaciones, horas, inventario, finanzas, facturacion] =
        await Promise.all([
          getEmployees(),
          getVacations(),
          getHorasExtras(),
          getInventoryItems(),
          getFinanceSummary(),
          obtenerResumenFacturacion(),
        ]);

      const horasTotales = horas.reduce((acc, h) => {
        const valores = Object.values(h).filter(
          (v) => typeof v === "number"
        ) as number[];
        return acc + valores.reduce((sum, n) => sum + n, 0);
      }, 0);

      setDashboardData({
        empleados: empleados.length,
        vacaciones: vacaciones.length,
        horasExtras: horasTotales,
        inventario: inventario.length,
        facturado: facturacion.totalFacturado,
        balance: finanzas.balance,
      });
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const askAI = async (question: string) => {
    setError(null);
    try {
      console.log("📤 Enviando pregunta:", question);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error HTTP:", res.status, errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log("✅ Respuesta recibida:", data);
      return data.response || "No pude generar una respuesta en este momento.";
    } catch (err: unknown) {
      console.error("❌ Error en la API:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error procesando la solicitud.";
      setError(errorMessage);
      return null;
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    // Add temporary "typing" message
    const typingId = "typing-" + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        content: "",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);

    const answer = await askAI(question);

    // Remove typing indicator and add actual response
    setMessages((prev) =>
      prev
        .filter((m) => m.id !== typingId)
        .concat(
          answer
            ? {
                id: Date.now().toString(),
                content: answer,
                role: "assistant",
                timestamp: new Date(),
              }
            : []
        )
    );

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(amount);
  };

  return (
    <div className="flex-1 overflow-auto relative">
      {/* Dashboard Content */}
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Panel Principal
            </h1>
            <p className="text-muted-foreground">
              Resumen de métricas clave de la empresa
            </p>
          </div>
          <Button
            onClick={() => setChatOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Asistente IA
          </Button>
        </div>
      </div>
      {chatOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl border rounded-lg overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shrink-0">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Asistente IA
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[85%] rounded-lg p-3",
                  message.role === "user"
                    ? "bg-blue-600 text-white self-end rounded-br-none"
                    : "bg-gray-100 text-gray-800 self-start rounded-bl-none"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">
                    {message.role === "user" ? "Tú" : "Asistente"}
                  </span>
                </div>

                <div className="text-sm whitespace-pre-wrap">
                  {message.id.startsWith("typing") ? (
                    <div className="flex items-center gap-1">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div className="bg-red-50 p-3 rounded-lg text-red-800 text-sm border border-red-200 self-start max-w-[85%]">
                ❌ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <CardContent className="p-4 border-t shrink-0">
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                className="flex-1"
                disabled={loading}
              />
              <Button
                onClick={handleAsk}
                className="bg-blue-600 hover:bg-blue-700"
                size="icon"
                disabled={loading}
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx global>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: currentColor;
          border-radius: 50%;
          opacity: 0.6;
          animation: typing 1.4s infinite both;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.8;
            transform: scale(1);
          }
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.8);
        }
      `}</style>
    </div>
  );
}
