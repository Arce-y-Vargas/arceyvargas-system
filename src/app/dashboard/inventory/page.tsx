"use client";

import { Wrapper } from "../../../components/utils/Wrapper";
import { InventoryTable } from "../../../components/dashboard/inventory/InventoryTable";

export default function InventoryPage() {
  return (
    <Wrapper>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <InventoryTable />
        </div>
      </div>
    </Wrapper>
  );
}
