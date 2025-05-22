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
