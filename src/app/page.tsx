"use client";

import { useRouter } from "next/navigation";
import ThemeToggle from "@/layouts/ThemeToggle";
import Image from "next/image";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col">
      <header className="flex justify-between items-center p-6 bg-white dark:bg-background text-black dark:text-gray-100 shadow-md">
        <ThemeToggle />
        <button
          className="text-white bg-gradient-to-br from-blue-600 to-blue-800 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          onClick={() => router.push("/auth/login")}
        >
          Iniciar Sesión
        </button>
      </header>
      <main className="p-8 md:p-8 flex-1 flex flex-col sm:flex-row justify-center items-center bg-white dark:bg-background text-black dark:text-gray-100 gap-8 md:px-20 lg:px-32 xl:px-48">
        <div className="flex flex-col items-center sm:items-start gap-6 sm:w-1/2">
          <h1 className="text-4xl md:text-6xl font-bold text-center sm:text-left text-black dark:text-gray-100 leading-tight">
            <span className=" text-blue-700 to-blue-700">Arce y Vargas</span>{" "}
            <br /> Mantenimiento Industrial
          </h1>

          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed text-center sm:text-left">
            Arce y Vargas es una empresa líder en mantenimiento industrial
            dedicada a ofrecer soluciones integrales para el mantenimiento y
            optimización de procesos industriales.
          </p>
        </div>

        <hr className="hidden md:block bg-gray-300 dark:bg-gray-600 w-0.5 h-96" />

        <div className="relative w-full sm:w-1/2 h-64 sm:h-80 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/img/hero.jpg"
            alt="Mantenimiento Industrial"
            fill
            className="object-cover"
            priority
          />
        </div>
      </main>
    </div>
  );
}
