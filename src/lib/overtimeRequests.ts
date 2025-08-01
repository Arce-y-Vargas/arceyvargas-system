import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { addOvertimeHoursFromRequest } from "./horasExtras";

export interface OvertimeRequest {
  id?: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  overtimeHours: number;
  description: string;
  photoEvidence?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewComments?: string;
}

const overtimeRequestsCollection = collection(db, "overtime_requests");

export const submitOvertimeRequest = async (
  request: Omit<OvertimeRequest, 'id' | 'submittedAt' | 'status'>
): Promise<string> => {
  const newRequest = {
    ...request,
    status: 'pending' as const,
    submittedAt: Timestamp.fromDate(new Date()),
    date: Timestamp.fromDate(request.date),
  };
  
  const docRef = await addDoc(overtimeRequestsCollection, newRequest);
  return docRef.id;
};

export const getOvertimeRequests = async (
  filters?: {
    employeeId?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<OvertimeRequest[]> => {
  let q = query(overtimeRequestsCollection, orderBy("submittedAt", "desc"));
  
  if (filters?.employeeId) {
    q = query(q, where("employeeId", "==", filters.employeeId));
  }
  
  if (filters?.status && filters.status !== 'all') {
    q = query(q, where("status", "==", filters.status));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date.toDate(),
      submittedAt: data.submittedAt.toDate(),
      reviewedAt: data.reviewedAt?.toDate(),
    } as OvertimeRequest;
  });
};

export const updateOvertimeRequestStatus = async (
  requestId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  reviewComments?: string
): Promise<void> => {
  try {
    const docRef = doc(overtimeRequestsCollection, requestId);
    
    const requestSnap = await getDoc(docRef);
    if (!requestSnap.exists()) {
      throw new Error("Solicitud no encontrada");
    }
    
    const requestData = requestSnap.data();
    
    // Actualizar el estado de la solicitud
    await updateDoc(docRef, {
      status,
      reviewedBy,
      reviewedAt: Timestamp.fromDate(new Date()),
      reviewComments: reviewComments || '',
    });

    // Si es aprobada, agregar las horas al registro
    if (status === 'approved') {
      try {
        // Verificar que tenemos todos los datos necesarios
        if (!requestData.employeeId || !requestData.employeeName || !requestData.date || !requestData.overtimeHours) {
          throw new Error("Datos incompletos en la solicitud");
        }
        
        // Convertir la fecha de Firestore a Date
        const dateToProcess = requestData.date.toDate ? requestData.date.toDate() : new Date(requestData.date);
        
        await addOvertimeHoursFromRequest(
          requestData.employeeId,
          requestData.employeeName,
          dateToProcess,
          requestData.overtimeHours
        );
      } catch (error) {
        // Revertir el estado de la solicitud si falla
        await updateDoc(docRef, {
          status: 'pending',
          reviewedBy: null,
          reviewedAt: null,
          reviewComments: `Error al procesar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        });
        
        throw new Error(`Error al agregar las horas extra: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  } catch (error) {
    throw error;
  }
};

export const getOvertimeRequestById = async (requestId: string): Promise<OvertimeRequest | null> => {
  const docRef = doc(overtimeRequestsCollection, requestId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      date: data.date.toDate(),
      submittedAt: data.submittedAt.toDate(),
      reviewedAt: data.reviewedAt?.toDate(),
    } as OvertimeRequest;
  }
  
  return null;
};