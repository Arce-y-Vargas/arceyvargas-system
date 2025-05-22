import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

interface Transaction {
  id?: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  description?: string;
  status: "active" | "inactive";
  createdBy?: string;
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

export const addTransaction = async (
  uid: string,
  transaction: Omit<Transaction, "id" | "createdBy">
) => {
  const userName = await getUserName(uid);
  const newDocRef = doc(collection(db, "transactions"));

  await setDoc(newDocRef, {
    ...transaction,
    status: "active",
    createdBy: userName,
  });
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const snapshot = await getDocs(collection(db, "transactions"));
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type || "income",
        amount: data.amount || 0,
        category: data.category || "Uncategorized",
        date: data.date || new Date().toISOString(),
        description: data.description || "",
        status: data.status || "active",
        createdBy: data.createdBy || "Desconocido",
      } as Transaction;
    })
    .filter((transaction) => transaction.status === "active");
};

export const getFinanceSummary = async () => {
  const transactions = await getTransactions();

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + parseFloat(t.amount.toString()), 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + parseFloat(t.amount.toString()), 0);

  return {
    totalIncome: income,
    totalExpenses: expenses,
    balance: income - expenses,
  };
};
