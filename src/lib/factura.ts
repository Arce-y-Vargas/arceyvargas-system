import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
} from "firebase/firestore";

interface Factura {
  id: string;
  fecha: string;
  factura: string;
  monto: number;
  fechaPago: string;
  saldo: number;
  proyecto: string;
  categoria: string; // Nuevo campo agregado
}

export const addFactura = async (factura: Factura) => {
  const facturaRef = doc(db, "facturas", factura.id);

  const existingDoc = await getDoc(facturaRef);
  if (existingDoc.exists()) {
    throw new Error("Ya existe una factura con este ID.");
  }

  await setDoc(facturaRef, {
    fecha: factura.fecha,
    factura: factura.factura,
    monto: factura.monto,
    fechaPago: factura.fechaPago,
    saldo: factura.saldo,
    proyecto: factura.proyecto,
    categoria: factura.categoria, // Agregado el campo categoria
  });

  return factura;
};

export const getFacturas = async (): Promise<Factura[]> => {
  const snapshot = await getDocs(collection(db, "facturas"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      fecha: data.fecha || "",
      factura: data.factura || "",
      monto: data.monto || 0,
      fechaPago: data.fechaPago || "",
      saldo: data.saldo || 0,
      proyecto: data.proyecto || "",
      categoria: data.categoria || "", // Agregado el campo categoria
    } as Factura;
  });
};

export const updateFactura = async (factura: Factura) => {
  const facturaRef = doc(db, "facturas", factura.id);

  const existingDoc = await getDoc(facturaRef);
  if (!existingDoc.exists()) {
    throw new Error("La factura no existe.");
  }

  await updateDoc(facturaRef, {
    fecha: factura.fecha,
    factura: factura.factura,
    monto: factura.monto,
    fechaPago: factura.fechaPago,
    saldo: factura.saldo,
    proyecto: factura.proyecto,
    categoria: factura.categoria, // Agregado el campo categoria
  });
};
