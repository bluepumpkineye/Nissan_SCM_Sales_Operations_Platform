import { useState } from "react";
import { cn } from "../utils/cn";
import TabOverview from "./reconciliation/TabOverview";
import TabOwnership from "./reconciliation/TabOwnership";
import TabRoutes from "./reconciliation/TabRoutes";
import TabDiscrepancy from "./reconciliation/TabDiscrepancy";
import TabIndependent from "./reconciliation/TabIndependent";

type ReconciliationTab = "overview" | "ownership" | "routes" | "discrepancy" | "independent";

const tabLabels: { id: ReconciliationTab; label: string }[] = [
  { id: "overview", label: "Reconciliation Overview" },
  { id: "ownership", label: "Ownership & Invoice Flow" },
  { id: "routes", label: "Route Schematics & Status Codes" },
  { id: "discrepancy", label: "Discrepancy Analysis" },
  { id: "independent", label: "Independent Markets" },
];

const tabNameMap: Record<ReconciliationTab, string> = {
  overview: "Reconciliation Overview",
  ownership: "Ownership & Invoice Flow",
  routes: "Route Schematics & Status Codes",
  discrepancy: "Discrepancy Analysis",
  independent: "Independent Markets",
};

export default function StockReconciliationPage() {
  const [tab, setTab] = useState<ReconciliationTab>("overview");

  return (
    <div className="space-y-4 bg-[#F0F0F0] p-4 lg:p-6">
      {/* Breadcrumb */}
      <p className="text-[11px] text-slate-500">
        SCM Operations &gt; Stock Reconciliation &gt; {tabNameMap[tab]}
      </p>

      {/* Page Header */}
      <div>
        <p className="text-[20px] font-bold text-slate-900">Stock Reconciliation</p>
        <p className="text-[13px] text-slate-500">
          Physical vs Financial Inventory Reconciliation — NISA European Stock
        </p>
      </div>

      {/* Status Banner */}
      <div className="flex flex-wrap items-center gap-6 rounded-md border-l-4 border-amber-500 bg-[#FFF8E1] px-5 py-4">
        <div>
          <p className="text-[24px] font-bold text-[#FF8F00]">Discrepancy: 2,147 units</p>
          <p className="text-[12px] text-slate-600">Physical stock not matched to financial records</p>
        </div>
        <div className="hidden text-[14px] text-slate-700 md:block">
          Total NISA Stock: <span className="font-semibold">48,247</span> physical |{" "}
          <span className="font-semibold">46,100</span> financial
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-right text-[12px] text-slate-600">
            <p>Last Reconciliation: 28-Mar-2026</p>
            <p>Next Due: 04-Apr-2026</p>
          </div>
          <div className="relative h-12 w-12">
            <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#FF8F00" strokeWidth="3"
                strokeDasharray={`${(2 / 7) * 94.2} 94.2`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[8px] font-semibold text-slate-700">
              <span>Day 2</span>
              <span>of 7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-1 border-b border-slate-300 pb-0">
        {tabLabels.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-t-md border border-b-0 px-4 py-2 text-[13px] font-medium transition",
              tab === t.id
                ? "border-slate-300 bg-white text-[#C3002F]"
                : "border-transparent bg-transparent text-slate-600 hover:bg-white/60"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tab === "overview" && <TabOverview />}
        {tab === "ownership" && <TabOwnership />}
        {tab === "routes" && <TabRoutes />}
        {tab === "discrepancy" && <TabDiscrepancy />}
        {tab === "independent" && <TabIndependent />}
      </div>
    </div>
  );
}
