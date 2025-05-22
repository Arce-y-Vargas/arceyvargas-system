import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export interface Planilla {
  id?: string;
  Empleado: string;
  Cédula: string;
  S_SEMANAL: string;
  H_EXTRAS: string;
  DOMINGO_FERIADO: string;
  ESFUERZO_VIATICOS: string;
  INGRESOS: string;
  CCSS: string;
  NO_LABORO: string;
  AHORROS: string;
  CAJA_AHORRO1: string;
  CAJA_AHORRO2: string;
  REBAJAS: string;
  TOTAL_REBAJAS: string;
  A_PAGAR: string;
}

export interface PlanillaUI {
  id?: string;
  empleado: string;
  cedula: string;
  dias: number;
  salario_semanal: number;
  horas_extras: number;
  domingo_feriado: number;
  esfuerzo_viaticos: number;
  total_ingresos: number;
  ccss: number;
  no_laboro: number;
  ahorros: number;
  caja_ahorro_1: number;
  caja_ahorro_2: number;
  rebajas_1: number;
  rebajas_2: number;
  total_rebajas: number;
  total_pagar: number;
}

const collectionName = "planillas";

export const addPlanilla = async (planilla: Planilla) => {
  const ref = doc(db, collectionName, planilla.Cédula);
  await setDoc(ref, planilla);
};

export const getPlanillas = async (): Promise<PlanillaUI[]> => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Planilla;
    return convertToUIModel(data);
  });
};

export const getPlanillaByCedula = async (
  cedula: string
): Promise<PlanillaUI | null> => {
  const ref = doc(db, collectionName, cedula);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as Planilla;
  return convertToUIModel(data);
};

export const updatePlanilla = async (planilla: Planilla) => {
  const ref = doc(db, collectionName, planilla.Cédula);
  const { id, ...data } = planilla;
  await updateDoc(ref, data);
};

export const deletePlanilla = async (cedula: string) => {
  if (!cedula) throw new Error("Cédula vacía");
  console.log("Intentando eliminar planilla con cédula:", cedula);
  const ref = doc(db, "planillas", cedula);
  await deleteDoc(ref);
};

function convertToUIModel(data: Planilla): PlanillaUI {
  return {
    id: data.id,
    empleado: data.Empleado,
    cedula: data.Cédula,
    dias: 6,
    salario_semanal: Number.parseFloat(data.S_SEMANAL) || 0,
    horas_extras: Number.parseFloat(data.H_EXTRAS) || 0,
    domingo_feriado: Number.parseFloat(data.DOMINGO_FERIADO) || 0,
    esfuerzo_viaticos: Number.parseFloat(data.ESFUERZO_VIATICOS) || 0,
    total_ingresos: Number.parseFloat(data.INGRESOS) || 0,
    ccss: Number.parseFloat(data.CCSS) || 0,
    no_laboro: Number.parseFloat(data.NO_LABORO) || 0,
    ahorros: Number.parseFloat(data.AHORROS) || 0,
    caja_ahorro_1: Number.parseFloat(data.CAJA_AHORRO1) || 0,
    caja_ahorro_2: Number.parseFloat(data.CAJA_AHORRO2) || 0,
    rebajas_1: Number.parseFloat(data.REBAJAS) || 0,
    rebajas_2: 0,
    total_rebajas: Number.parseFloat(data.TOTAL_REBAJAS) || 0,
    total_pagar: Number.parseFloat(data.A_PAGAR) || 0,
  };
}

export function convertToFirebaseModel(data: PlanillaUI): Planilla {
  return {
    Empleado: data.empleado,
    Cédula: data.cedula,
    S_SEMANAL: data.salario_semanal.toString(),
    H_EXTRAS: data.horas_extras.toString(),
    DOMINGO_FERIADO: data.domingo_feriado.toString(),
    ESFUERZO_VIATICOS: data.esfuerzo_viaticos.toString(),
    INGRESOS: data.total_ingresos.toString(),
    CCSS: data.ccss.toString(),
    NO_LABORO: data.no_laboro.toString(),
    AHORROS: data.ahorros.toString(),
    CAJA_AHORRO1: data.caja_ahorro_1.toString(),
    CAJA_AHORRO2: data.caja_ahorro_2.toString(),
    REBAJAS: data.rebajas_1.toString(),
    TOTAL_REBAJAS: data.total_rebajas.toString(),
    A_PAGAR: data.total_pagar.toString(),
  };
}
