import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: "activo" | "completado" | "cancelado";
  cliente: string;
}

export const addProyecto = async (proyecto: Proyecto) => {
  const proyectoRef = doc(db, "proyectos", proyecto.id);

  const existingDoc = await getDoc(proyectoRef);
  if (existingDoc.exists()) {
    throw new Error("Ya existe un proyecto con este ID.");
  }

  await setDoc(proyectoRef, {
    nombre: proyecto.nombre,
    descripcion: proyecto.descripcion,
    fechaInicio: proyecto.fechaInicio,
    fechaFin: proyecto.fechaFin || "",
    estado: proyecto.estado,
    cliente: proyecto.cliente,
  });

  return proyecto;
};

export const getProyectos = async (): Promise<Proyecto[]> => {
  const proyectosQuery = query(collection(db, "proyectos"), orderBy("nombre"));
  const snapshot = await getDocs(proyectosQuery);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nombre: data.nombre || "",
      descripcion: data.descripcion || "",
      fechaInicio: data.fechaInicio || "",
      fechaFin: data.fechaFin || "",
      estado: data.estado || "activo",
      cliente: data.cliente || "",
    } as Proyecto;
  });
};

export const updateProyecto = async (proyecto: Proyecto) => {
  const proyectoRef = doc(db, "proyectos", proyecto.id);

  const existingDoc = await getDoc(proyectoRef);
  if (!existingDoc.exists()) {
    throw new Error("El proyecto no existe.");
  }

  await updateDoc(proyectoRef, {
    nombre: proyecto.nombre,
    descripcion: proyecto.descripcion,
    fechaInicio: proyecto.fechaInicio,
    fechaFin: proyecto.fechaFin || "",
    estado: proyecto.estado,
    cliente: proyecto.cliente,
  });
};

export const deleteProyecto = async (id: string) => {
  const proyectoRef = doc(db, "proyectos", id);

  const existingDoc = await getDoc(proyectoRef);
  if (!existingDoc.exists()) {
    throw new Error("El proyecto no existe.");
  }

  await deleteDoc(proyectoRef);
};
