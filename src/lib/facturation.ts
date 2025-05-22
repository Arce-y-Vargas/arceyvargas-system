import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore";

interface Factura {
  id?: string;
  fecha: string;
  numeroFactura: string;
  monto: number;
  fechaPago: string;
  saldo: number;
  proyecto: string;
  estado: "activa" | "inactiva";
  creadoPor?: string;
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

export const agregarFactura = async (
  uid: string,
  factura: Omit<Factura, "id" | "creadoPor" | "estado">
) => {
  const userName = await getUserName(uid);
  const newDocRef = doc(collection(db, "facturas"));

  await setDoc(newDocRef, {
    ...factura,
    estado: "activa",
    creadoPor: userName,
  });
};

export const obtenerFacturas = async (): Promise<Factura[]> => {
  const snapshot = await getDocs(collection(db, "facturas"));
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        fecha: data.fecha || new Date().toISOString(),
        numeroFactura: data.numeroFactura || "",
        monto: data.monto || 0,
        fechaPago: data.fechaPago || "",
        saldo: data.saldo || 0,
        proyecto: data.proyecto || "Sin proyecto",
        estado: data.estado || "activa",
        creadoPor: data.creadoPor || "Desconocido",
      } as Factura;
    })
    .filter((factura) => factura.estado === "activa");
};

export const obtenerResumenFacturacion = async () => {
  const facturas = await obtenerFacturas();

  const totalFacturado = facturas.reduce((acc, f) => acc + f.monto, 0);
  const totalSaldo = facturas.reduce((acc, f) => acc + f.saldo, 0);
  const totalPagado = totalFacturado - totalSaldo;

  return {
    totalFacturado,
    totalPagado,
    totalSaldo,
  };
};
