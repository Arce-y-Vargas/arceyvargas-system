"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Wrapper } from "@/components/utils/Wrapper";

const Home = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (!user) return null;

  return (
    <Wrapper>
      <Dashboard />
    </Wrapper>
  );
};

export default Home;
