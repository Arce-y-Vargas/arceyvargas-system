import { useEffect, useState } from "react";

const getUserRole = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userRole") || "general-manager";
  }
  return "operators";
};

export function useUser() {
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const storedRole = getUserRole();
    setRole(storedRole);
  }, []);

  return { role };
}
