import { db, auth } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

interface Empleado {
  cedula: string;
  nombre: string;
  posicion: string;
  departamento: string;
  fechaInicio: string;
  salario: number;
  status: string;
  vacaciones: number;
}

export const addEmployee = async (empleado: Empleado, password: string) => {
  console.log('addEmployee called with:', empleado);
  console.log('Password provided:', password ? 'Yes' : 'No');
  
  const employeeRef = doc(db, "employees", empleado.cedula);

  const existingDoc = await getDoc(employeeRef);
  if (existingDoc.exists()) {
    throw new Error("Ya existe un empleado con esta cédula.");
  }

  try {
    const username = empleado.nombre.replace(/\s+/g, "").toLowerCase();
    const email = `${username}@arceyvargas.app`;

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(employeeRef, {
      nombre: empleado.nombre,
      posicion: empleado.posicion,
      departamento: empleado.departamento,
      fechaInicio: empleado.fechaInicio,
      salario: empleado.salario,
      status: "Activo",
      vacaciones: 0,
    });

    const userRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userRef, {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      cedula: empleado.cedula,
    });

    console.log('Employee and user created successfully:', empleado.cedula);
    return empleado;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === "auth/email-already-in-use") {
      throw new Error("Este usuario ya está registrado.");
    }
    throw error;
  }
};

export const getEmployees = async (): Promise<Empleado[]> => {
  const snapshot = await getDocs(collection(db, "employees"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      cedula: doc.id,
      nombre: data.nombre || "",
      posicion: data.posicion || "",
      departamento: data.departamento || "",
      fechaInicio: data.fechaInicio || "",
      salario: data.salario || 0,
      status: data.status || "Inactivo",
      vacaciones: data.vacaciones || 0,
    } as Empleado;
  });
};

export const updateEmployeeStatus = async (cedula: string, status: string) => {
  if (!cedula) {
    throw new Error(
      "La cédula es requerida para actualizar el estado del empleado."
    );
  }

  const employeeRef = doc(db, "employees", cedula);
  const existingDoc = await getDoc(employeeRef);
  if (!existingDoc.exists()) {
    throw new Error("El empleado no existe.");
  }

  await updateDoc(employeeRef, { status });
};

export const updateEmployee = async (employee: Empleado) => {
  const employeeRef = doc(db, "employees", employee.cedula);

  const existingDoc = await getDoc(employeeRef);
  if (!existingDoc.exists()) {
    throw new Error("El empleado no existe.");
  }

  await updateDoc(employeeRef, {
    nombre: employee.nombre,
    posicion: employee.posicion,
    departamento: employee.departamento,
    fechaInicio: employee.fechaInicio,
    salario: employee.salario,
    status: employee.status,
  });
};

export const updateVacaciones = async () => {
  const empleados = await getEmployees();

  for (const emp of empleados) {
    const fechaInicio = new Date(emp.fechaInicio);
    const hoy = new Date();

    const mesesTrabajados =
      hoy.getFullYear() * 12 +
      hoy.getMonth() -
      (fechaInicio.getFullYear() * 12 + fechaInicio.getMonth());

    const employeeRef = doc(db, "employees", emp.cedula);

    await updateDoc(employeeRef, {
      vacaciones: mesesTrabajados >= 0 ? mesesTrabajados : 0,
    });
  }
};
