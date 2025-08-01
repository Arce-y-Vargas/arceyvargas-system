import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { getEmployees } from "./employees";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

const horasExtrasCollection = collection(db, "horas_extras");

export const initializeHorasExtras = async () => {
  const empleados = await getEmployees();

  for (const emp of empleados) {
    const docRef = doc(horasExtrasCollection, emp.cedula);
    const existing = await getDoc(docRef);

    if (!existing.exists()) {
      const nuevoRegistro: HorasExtras = {
        cedula: emp.cedula,
        nombre: emp.nombre,
        lunes: 0,
        martes: 0,
        miércoles: 0,
        jueves: 0,
        viernes: 0,
        sábado: 0,
        domingo: 0,
      };
      await setDoc(docRef, nuevoRegistro);
    }
  }
};

export const updateHorasExtras = async (
  cedula: string,
  data: Partial<Omit<HorasExtras, "cedula" | "nombre">>
) => {
  const docRef = doc(horasExtrasCollection, cedula);
  const existing = await getDoc(docRef);
  if (!existing.exists()) {
    throw new Error("No se encontró el registro de horas extras.");
  }
  await updateDoc(docRef, data);
};

export const getHorasExtras = async (): Promise<HorasExtras[]> => {
  const snapshot = await getDocs(horasExtrasCollection);
  return snapshot.docs.map((doc) => doc.data() as HorasExtras);
};

export const addOvertimeHoursFromRequest = async (
  employeeId: string,
  employeeName: string,
  date: Date,
  hours: number
) => {
  try {
    // employeeId ahora es directamente la cédula del empleado
    const docRef = doc(horasExtrasCollection, employeeId);
    let existing = await getDoc(docRef);

    if (!existing.exists()) {
      const nuevoRegistro: HorasExtras = {
        cedula: employeeId,
        nombre: employeeName,
        lunes: 0,
        martes: 0,
        miércoles: 0,
        jueves: 0,
        viernes: 0,
        sábado: 0,
        domingo: 0,
      };
      await setDoc(docRef, nuevoRegistro);
      existing = await getDoc(docRef);
    }

    const currentData = existing.data() as HorasExtras;
    
    // Obtener el día de la semana usando el formato correcto
    const dayOfWeek = format(date, "EEEE", { locale: es });
    
    let dayField: keyof Omit<HorasExtras, "cedula" | "nombre">;
    switch (dayOfWeek.toLowerCase()) {
      case "lunes":
        dayField = "lunes";
        break;
      case "martes":
        dayField = "martes";
        break;
      case "miércoles":
      case "miercoles":
        dayField = "miércoles";
        break;
      case "jueves":
        dayField = "jueves";
        break;
      case "viernes":
        dayField = "viernes";
        break;
      case "sábado":
      case "sabado":
        dayField = "sábado";
        break;
      case "domingo":
        dayField = "domingo";
        break;
      default:
        throw new Error(`Día de la semana no válido: ${dayOfWeek}`);
    }

    const currentHours = currentData[dayField] || 0;
    const updatedHours = currentHours + hours;
    const updateData = { [dayField]: updatedHours };
    
    await updateDoc(docRef, updateData);
    
  } catch (error) {
    throw error;
  }
};
