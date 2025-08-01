"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Home,
  FileText,
  User,
  Warehouse,
  ClipboardList,
  BarChart2,
  Smile,
  Umbrella,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Package,
  Truck,
  Settings,
  LogOut,
  ChevronDown,
  Building,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const icons = {
  Home,
  FileText,
  User,
  Warehouse,
  ClipboardList,
  BarChart2,
  Smile,
  Umbrella,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Package,
  Truck,
  Settings,
  Building,
};

const accessByRole = {
  "general-manager": [
    "dashboard",
    "quotes",
    "inventory",
    "employees",
    "accounting",
    "reports",
    "vacations",
    "overtime-request",
    "overtime-management",
  ],
  "admin-financial-manager": [
    "dashboard",
    "quotes",
    "accounting",
    "reports",
    "vacations",
    "overtime-request",
  ],
  "operations-manager": [
    "dashboard",
    "inventory",
    "employees",
    "reports",
    "vacations",
    "overtime-request",
    "overtime-management",
  ],
  "plant-manager": ["dashboard", "inventory", "employees", "vacations", "overtime-request", "overtime-management"],
  "admin-assistant": ["dashboard", "employees", "vacations", "overtime-request"],
  "warehouse-staff": ["dashboard", "inventory", "vacations", "overtime-request"],
  operators: ["dashboard", "vacations", "overtime-request"],
};

const navigationCategories = [
  {
    name: "Principal",
    items: [
      { path: "/dashboard", label: "Panel", icon: "Home", key: "dashboard" },
    ],
  },
  {
    name: "Recursos Humanos",
    items: [
      {
        path: "/dashboard/employees",
        label: "Empleados",
        icon: "Users",
        key: "employees",
        subItems: [
          { path: "/dashboard/employees", label: "Lista de Empleados" },
          { path: "/dashboard/employees/horas-extra", label: "Horas Extras" },
          { path: "/dashboard/employees/overtime-management", label: "Gestión Horas Extra" },
          { path: "/dashboard/employees/vacations", label: "Vacaciones" },
        ],
      },
      {
        path: "/dashboard/employees/overtime-request",
        label: "Registrar Horas Extra",
        icon: "Clock",
        key: "overtime-request",
      },
      {
        path: "/dashboard/vacations",
        label: "Solicitud de Vacaciones",
        icon: "Umbrella",
        key: "vacations",
      },
    ],
  },
  {
    name: "Operaciones",
    items: [
      {
        path: "/dashboard/inventory",
        label: "Inventario",
        icon: "Package",
        key: "inventory",
        subItems: [{ path: "/dashboard/inventory", label: "Productos" }],
      },
      {
        path: "/dashboard/quotes",
        label: "Cotizaciones",
        icon: "FileText",
        key: "quotes",
      },
    ],
  },
  {
    name: "Finanzas",
    items: [
      {
        path: "/dashboard/accounting",
        label: "Facturas",
        icon: "Building",
        key: "accounting",
        subItems: [
          { path: "/dashboard/accounting", label: "Facturas" },
          { path: "/dashboard/categorias", label: "Categorias" },
          { path: "/dashboard/proyectos", label: "Proyectos" },
        ],
      },
      {
        path: "/dashboard/reports",
        label: "Reportes",
        icon: "BarChart2",
        key: "reports",
      },
    ],
  },
];

const positionTranslations: Record<string, string> = {
  "general-manager": "Gerente General",
  "admin-financial-manager": "Gerente Financiero",
  "operations-manager": "Gerente de Operaciones",
  "plant-manager": "Gerente de Planta",
  "admin-assistant": "Asistente Administrativo",
  "warehouse-staff": "Personal de Almacén",
  operators: "Operador",
};

export function DashboardSidebar() {
  const [userData, setUserData] = useState<{
    nombre: string;
    posicion: keyof typeof accessByRole;
    avatar?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("🔥 Usuario autenticado:", user.uid);
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      console.log("🔍 Buscando usuario en 'users' con UID:", uid);
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn("❌ No se encontró el usuario en Firestore.");
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      const cedula = userData.cedula;
      console.log("✅ Cédula obtenida:", cedula);

      console.log("🔍 Buscando empleado en 'employees' con cédula:", cedula);
      const employeeRef = doc(db, "employees", cedula);
      const employeeSnap = await getDoc(employeeRef);

      if (!employeeSnap.exists()) {
        console.warn("❌ No se encontró la información del empleado.");
        setLoading(false);
        return;
      }

      const employeeData = employeeSnap.data();
      const rawPosicion = employeeData.posicion || "operators";

      const formattedPosicion = Object.prototype.hasOwnProperty.call(accessByRole, rawPosicion)
        ? (rawPosicion as keyof typeof accessByRole)
        : "operators";

      console.log("✅ Posición asignada:", formattedPosicion);

      setUserData({
        nombre: employeeData.nombre || "Usuario",
        posicion: formattedPosicion,
        avatar: userData.photoURL || null,
      });

      console.log("✅ Datos obtenidos:", {
        nombre: employeeData.nombre,
        posicion: formattedPosicion,
      });
    } catch (error) {
      console.error("❌ Error al obtener datos del usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  const userRoutes = userData?.posicion
    ? accessByRole[userData.posicion] || []
    : [];

  const handleLogout = async () => {
    try {
      // Redireccionar inmediatamente
      window.location.href = "/";
      // Cerrar sesión en segundo plano
      await auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Asegurar redirección aún si hay error
      window.location.href = "/";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    return pathname.startsWith(path) && path !== "/dashboard";
  };

  const isSubItemActive = (path: string) => {
    return pathname === path;
  };

  return (
    <Sidebar className="h-screen ">
      <SidebarHeader className="py-3 px-4">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className=" flex items-center justify-center">
              <Image
                src="/img/logo_2.png"
                alt="Logo"
                width={39}
                height={39}
                priority
              />
            </div>
            <span className="font-bold text-lg">Arce & Vargas</span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-4">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            <div className="h-8 bg-muted rounded-md animate-pulse"></div>
            <div className="h-8 bg-muted rounded-md animate-pulse"></div>
            <div className="h-8 bg-muted rounded-md animate-pulse"></div>
          </div>
        ) : userRoutes.length > 0 ? (
          <>
            {navigationCategories.map((category) => {
              const accessibleItems = category.items.filter(({ key }) =>
                userRoutes.includes(key)
              );

              if (accessibleItems.length === 0) return null;

              return (
                <SidebarGroup key={category.name}>
                  <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground py-2">
                    {category.name}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {accessibleItems.map((item) => {
                        const IconComponent = icons[item.icon];

                        if (item.subItems) {
                          return (
                            <Collapsible
                              key={item.path}
                              className="w-full group/collapsible"
                            >
                              <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuButton
                                    isActive={isActive(item.path)}
                                    className="w-full justify-between"
                                  >
                                    <div className="flex items-center">
                                      <IconComponent className="mr-2 h-4 w-4" />
                                      <span>{item.label}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                  </SidebarMenuButton>
                                </CollapsibleTrigger>
                              </SidebarMenuItem>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  {item.subItems.map((subItem) => (
                                    <SidebarMenuSubItem key={subItem.path}>
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={isSubItemActive(subItem.path)}
                                      >
                                        <Link href={subItem.path}>
                                          {subItem.label}
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        }

                        // Regular menu item without subitems
                        return (
                          <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive(item.path)}
                            >
                              <Link href={item.path}>
                                <IconComponent className="mr-2 h-4 w-4" />
                                <span>{item.label}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })}
          </>
        ) : (
          <div className="text-center text-sm text-muted-foreground p-4 rounded-md bg-muted/50">
            No tienes acceso a ningún módulo.
          </div>
        )}
      </SidebarContent>

      <div className="mt-auto">
        <SidebarSeparator />
        <SidebarFooter className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userData?.avatar || ""} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {userData?.nombre ? getInitials(userData.nombre) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {loading ? "Cargando..." : userData?.nombre || "Usuario"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userData?.posicion
                  ? positionTranslations[userData.posicion] ||
                    "Posición desconocida"
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard/profile">
                <Settings className="h-4 w-4 mr-2" /> Perfil
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" /> Salir
            </Button>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
