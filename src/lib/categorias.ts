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

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
}

export const addCategoria = async (categoria: Categoria) => {
  const categoriaRef = doc(db, "categorias", categoria.id);

  const existingDoc = await getDoc(categoriaRef);
  if (existingDoc.exists()) {
    throw new Error("Ya existe una categoría con este ID.");
  }

  await setDoc(categoriaRef, {
    nombre: categoria.nombre,
    descripcion: categoria.descripcion,
    color: categoria.color,
  });

  return categoria;
};

export const getCategorias = async (): Promise<Categoria[]> => {
  const categoriasQuery = query(
    collection(db, "categorias"),
    orderBy("nombre")
  );
  const snapshot = await getDocs(categoriasQuery);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nombre: data.nombre || "",
      descripcion: data.descripcion || "",
      color: data.color || "#6b7280",
    } as Categoria;
  });
};

export const updateCategoria = async (categoria: Categoria) => {
  const categoriaRef = doc(db, "categorias", categoria.id);

  const existingDoc = await getDoc(categoriaRef);
  if (!existingDoc.exists()) {
    throw new Error("La categoría no existe.");
  }

  await updateDoc(categoriaRef, {
    nombre: categoria.nombre,
    descripcion: categoria.descripcion,
    color: categoria.color,
  });
};

export const deleteCategoria = async (id: string) => {
  const categoriaRef = doc(db, "categorias", id);

  const existingDoc = await getDoc(categoriaRef);
  if (!existingDoc.exists()) {
    throw new Error("La categoría no existe.");
  }

  await deleteDoc(categoriaRef);
};
