"use client";

import { Wrapper } from "@/components/utils/Wrapper";
import { VacationRequestForm } from "@/components/dashboard/vacations/VacationRequestForm";
import { VacationTable } from "@/components/dashboard/vacations/VacationTable";

export default function VacationsPage() {
  return (
    <Wrapper>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 space-y-6 p-8 pt-6">
          <VacationRequestForm />
          <VacationTable />
        </div>
      </div>
    </Wrapper>
  );
}
