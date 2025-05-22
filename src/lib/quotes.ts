import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

interface Quote {
  id?: string;
  client: string;
  date: string;
  total: number;
  status: "Pending" | "Approved" | "Rejected";
  items: number;
  createdBy?: string;
  active: boolean;
}

const getUserName = async (uid: string): Promise<string> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return "Desconocido";

  const userData = userSnap.data();
  const employeeRef = doc(db, "employees", userData.cedula);
  const employeeSnap = await getDoc(employeeRef);

  return employeeSnap.exists() ? employeeSnap.data().nombre : "Desconocido";
};

const getClientName = async (clientId: string): Promise<string> => {
  try {
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    return clientSnap.exists() ? clientSnap.data().nombre : clientId;
  } catch {
    return clientId;
  }
};

export const addQuote = async (
  uid: string,
  quote: Omit<Quote, "id" | "createdBy">
) => {
  const userName = await getUserName(uid);
  const newDocRef = doc(collection(db, "quotes"));

  await setDoc(newDocRef, {
    ...quote,
    active: true,
    createdBy: userName,
  });
};

export const getQuotes = async (): Promise<Quote[]> => {
  const snapshot = await getDocs(collection(db, "quotes"));
  const quotes: Quote[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const clientName = await getClientName(data.client || "");

    quotes.push({
      id: docSnap.id,
      client: clientName,
      date: data.date || new Date().toISOString(),
      total: data.total || 0,
      status: data.status || "Pending",
      items: data.items || 0,
      createdBy: data.createdBy || "Desconocido",
      active: data.active !== false,
    });
  }

  return quotes.filter((quote) => quote.active);
};

export const updateQuote = async (id: string, updatedQuote: Partial<Quote>) => {
  const quoteRef = doc(db, "quotes", id);
  await updateDoc(quoteRef, updatedQuote);
};

export const deleteQuote = async (id: string) => {
  const quoteRef = doc(db, "quotes", id);
  await updateDoc(quoteRef, { active: false });
};
