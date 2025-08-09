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

export interface HRRequest {
  id?: string;
  type: 'add_employee' | 'edit_employee' | 'salary_change' | 'position_change' | 'department_change' | 'status_change';
  requestedBy: string;
  requestedByName: string;
  requestedByRole: string;
  title: string;
  description: string;
  currentData?: any;
  proposedData: any;
  targetEmployeeId?: string;
  targetEmployeeName?: string;
  status: 'pending' | 'approved_by_gm' | 'approved_by_hr' | 'approved' | 'rejected';
  submittedAt: Date;
  generalManagerApproval?: {
    approvedBy: string;
    approvedAt: Date;
    comments?: string;
  };
  hrApproval?: {
    approvedBy: string;
    approvedAt: Date;
    comments?: string;
  };
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  processedAt?: Date;
}

const hrRequestsCollection = collection(db, "hr_requests");

export const submitHRRequest = async (
  request: Omit<HRRequest, 'id' | 'submittedAt' | 'status'>
): Promise<string> => {
  const newRequest = {
    ...request,
    status: 'pending' as const,
    submittedAt: Timestamp.fromDate(new Date()),
  };
  
  const docRef = await addDoc(hrRequestsCollection, newRequest);
  return docRef.id;
};

export const getHRRequests = async (
  filters?: {
    status?: string;
    type?: string;
    requestedBy?: string;
  }
): Promise<HRRequest[]> => {
  let q = query(hrRequestsCollection, orderBy("submittedAt", "desc"));
  
  if (filters?.status && filters.status !== 'all') {
    q = query(q, where("status", "==", filters.status));
  }
  
  if (filters?.type && filters.type !== 'all') {
    q = query(q, where("type", "==", filters.type));
  }
  
  if (filters?.requestedBy) {
    q = query(q, where("requestedBy", "==", filters.requestedBy));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      submittedAt: data.submittedAt.toDate(),
      generalManagerApproval: data.generalManagerApproval ? {
        ...data.generalManagerApproval,
        approvedAt: data.generalManagerApproval.approvedAt?.toDate(),
      } : undefined,
      hrApproval: data.hrApproval ? {
        ...data.hrApproval,
        approvedAt: data.hrApproval.approvedAt?.toDate(),
      } : undefined,
      rejectedAt: data.rejectedAt?.toDate(),
      processedAt: data.processedAt?.toDate(),
    } as HRRequest;
  });
};

export const updateHRRequestStatus = async (
  requestId: string,
  action: 'approve_gm' | 'approve_hr' | 'reject',
  approverName: string,
  approverRole: string,
  comments?: string
): Promise<void> => {
  const docRef = doc(hrRequestsCollection, requestId);
  const requestSnap = await getDoc(docRef);
  
  if (!requestSnap.exists()) {
    throw new Error("Solicitud no encontrada");
  }
  
  const requestData = requestSnap.data();
  const now = Timestamp.fromDate(new Date());
  
  let updateData: any = {};
  
  switch (action) {
    case 'approve_gm':
      updateData = {
        status: requestData.hrApproval ? 'approved' : 'approved_by_gm',
        generalManagerApproval: {
          approvedBy: approverName,
          approvedAt: now,
          comments: comments || '',
        },
      };
      // Si ya tiene aprobación de HR, está completamente aprobada
      if (requestData.hrApproval) {
        updateData.processedAt = now;
      }
      break;
      
    case 'approve_hr':
      updateData = {
        status: requestData.generalManagerApproval ? 'approved' : 'approved_by_hr',
        hrApproval: {
          approvedBy: approverName,
          approvedAt: now,
          comments: comments || '',
        },
      };
      // Si ya tiene aprobación de GM, está completamente aprobada
      if (requestData.generalManagerApproval) {
        updateData.processedAt = now;
      }
      break;
      
    case 'reject':
      updateData = {
        status: 'rejected',
        rejectedBy: approverName,
        rejectedAt: now,
        rejectionReason: comments || 'Sin comentarios',
        processedAt: now,
      };
      break;
  }
  
  await updateDoc(docRef, updateData);
  
  // Si la solicitud está completamente aprobada, procesar los cambios
  if (updateData.status === 'approved') {
    // Obtener los datos actualizados del documento
    const updatedRequestSnap = await getDoc(docRef);
    if (updatedRequestSnap.exists()) {
      const fullRequestData = updatedRequestSnap.data();
      await processApprovedRequest(requestId, fullRequestData);
    }
  }
};

const processApprovedRequest = async (requestId: string, requestData: any) => {
  try {
    console.log('Processing approved request:', requestId);
    console.log('Request data:', requestData);
    console.log('Request type:', requestData.type);
    
    switch (requestData.type) {
      case 'add_employee':
        console.log('Processing add employee request');
        await processAddEmployee(requestData.proposedData);
        break;
      case 'edit_employee':
      case 'salary_change':
      case 'position_change':
      case 'department_change':
      case 'status_change':
        console.log('Processing edit employee request');
        await processEditEmployee(requestData.targetEmployeeId, requestData.proposedData);
        break;
      default:
        console.warn('Unknown request type:', requestData.type);
    }
    console.log('Request processed successfully');
  } catch (error) {
    console.error("Error processing approved request:", error);
    // Revertir estado si hay error
    const docRef = doc(hrRequestsCollection, requestId);
    await updateDoc(docRef, {
      status: 'pending',
      processedAt: null,
    });
    throw error;
  }
};

const processAddEmployee = async (employeeData: any) => {
  try {
    console.log('Processing add employee with data:', employeeData);
    
    // Importar dinámicamente para evitar dependencias circulares
    const { addEmployee } = await import('./employees');
    const { password, ...employeeInfo } = employeeData;
    
    console.log('Employee info:', employeeInfo);
    console.log('Password:', password ? 'Present' : 'Missing');
    
    await addEmployee(employeeInfo, password || 'temporal123');
    console.log('Employee added successfully');
  } catch (error) {
    console.error('Error in processAddEmployee:', error);
    throw error;
  }
};

const processEditEmployee = async (employeeId: string, updatedData: any) => {
  // Importar dinámicamente para evitar dependencias circulares
  const { updateEmployee } = await import('./employees');
  await updateEmployee(updatedData);
};

export const getRequestTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'add_employee': 'Agregar Empleado',
    'edit_employee': 'Editar Empleado',
    'salary_change': 'Cambio de Salario',
    'position_change': 'Cambio de Posición',
    'department_change': 'Cambio de Departamento',
    'status_change': 'Cambio de Estado',
  };
  return labels[type] || type;
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'pending': 'Pendiente',
    'approved_by_gm': 'Aprobada por Gerente General',
    'approved_by_hr': 'Aprobada por RRHH',
    'approved': 'Aprobada',
    'rejected': 'Rechazada',
  };
  return labels[status] || status;
};