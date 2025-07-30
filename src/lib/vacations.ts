import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";

interface Vacation {
  id?: string;
  cedula: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
  approvedBy?: string;
  approvedAt?: string;
}

export const requestVacation = async (vacation: Vacation) => {
  const vacationRef = collection(db, "vacations");

  const newVacation = await addDoc(vacationRef, {
    cedula: vacation.cedula,
    startDate: vacation.startDate,
    endDate: vacation.endDate,
    requestedDays: vacation.requestedDays,
    status: "pending",
    reason: vacation.reason,
    approvedBy: null,
    approvedAt: null,
  });

  return { id: newVacation.id, ...vacation };
};

export const getVacations = async (): Promise<Vacation[]> => {
  const snapshot = await getDocs(collection(db, "vacations"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      cedula: data.cedula || "",
      startDate: data.startDate || "",
      endDate: data.endDate || "",
      requestedDays: data.requestedDays || 0,
      status: data.status || "pending",
      reason: data.reason || "",
      approvedBy: data.approvedBy || null,
      approvedAt: data.approvedAt || null,
    } as Vacation;
  });
};

export const getEmployeeVacations = async (
  cedula: string
): Promise<Vacation[]> => {
  if (!cedula)
    throw new Error("La cédula es requerida para obtener vacaciones.");

  const snapshot = await getDocs(collection(db, "vacations"));
  return snapshot.docs
    .filter((doc) => doc.data().cedula === cedula)
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vacation[];
};

export const updateVacationStatus = async (
  vacationId: string,
  status: "approved" | "rejected",
  approvedBy: string
) => {
  if (!vacationId) throw new Error("El ID de la solicitud es requerido.");

  const vacationRef = doc(db, "vacations", vacationId);
  const existingDoc = await getDoc(vacationRef);
  if (!existingDoc.exists())
    throw new Error("La solicitud de vacaciones no existe.");

  await updateDoc(vacationRef, {
    status,
    approvedBy,
    approvedAt: new Date().toISOString(),
  });
};

export const deleteVacationRequest = async (vacationId: string) => {
  if (!vacationId) throw new Error("El ID de la solicitud es requerido.");

  const vacationRef = doc(db, "vacations", vacationId);
  const existingDoc = await getDoc(vacationRef);
  if (!existingDoc.exists())
    throw new Error("La solicitud de vacaciones no existe.");

  await deleteDoc(vacationRef);
};
