import React from "react";
import { MappedTest } from "@/types/prescription";

interface TestRecommendationsProps {
  tests: MappedTest[];
}

export const TestRecommendations: React.FC<TestRecommendationsProps> = ({ tests }) => {
  if (!tests || tests.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-[12px] font-bold text-slate-900 mb-1.5 uppercase tracking-wide">Recommended Investigations / Lab Tests</h3>
      <ul className="space-y-1">
        {tests.map((test, index) => (
          <li key={test.id || index} className="text-[11px] text-slate-800 flex items-start gap-1 font-semibold">
            <span className="font-bold">*</span>
            <span>{test.name}</span>
            {test.notes && <span className="font-normal text-slate-500 italic"> ({test.notes})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};
