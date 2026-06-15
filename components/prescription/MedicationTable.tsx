import React from "react";
import { MappedMedicine } from "@/types/prescription";

interface MedicationTableProps {
  medicines: MappedMedicine[];
}

const formatFrequency = (frequency: string) => {
  const normalized = frequency.trim().toLowerCase();

  const frequencyMap: Record<string, string> = {
    "1-0-0": "1 Morning (Before/After Food)",
    "once daily": "1 Daily",
    "daily": "1 Daily",
    "od": "1 Daily",
    "1-0-1": "1 Morning, 1 Night (After Food)",
    "twice daily": "1 Morning, 1 Night",
    "bd": "1 Morning, 1 Night",
    "1-1-1": "1 Morning, 1 Afternoon, 1 Night",
    "three times daily": "1 Morning, 1 Afternoon, 1 Night",
    "tds": "1 Morning, 1 Afternoon, 1 Night",
    "0-0-1": "1 Night (At Bedtime)",
    "bedtime": "1 At Bedtime",
    "hs": "1 At Bedtime"
  };

  return frequencyMap[normalized] || frequency;
};

const calculateTotalQty = (frequency: string, duration: string) => {
  // Try to parse days out of duration (e.g., "5 days" or "5")
  const daysMatch = duration.match(/(\d+)\s*day/i) || duration.match(/^(\d+)$/);
  if (!daysMatch) return null;
  const days = parseInt(daysMatch[1]);
  
  let perDay = 0;
  const normalizedFreq = frequency.toLowerCase().trim();
  if (normalizedFreq.includes('-')) {
    perDay = normalizedFreq.split('-').reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  } else if (normalizedFreq === 'od' || normalizedFreq === 'once daily' || normalizedFreq === 'daily') {
    perDay = 1;
  } else if (normalizedFreq === 'bd' || normalizedFreq === 'twice daily') {
    perDay = 2;
  } else if (normalizedFreq === 'tds' || normalizedFreq === 'three times daily') {
    perDay = 3;
  } else if (normalizedFreq === 'hs' || normalizedFreq === 'bedtime') {
    perDay = 1;
  }
  
  if (days && perDay) {
    return days * perDay;
  }
  return null;
};

export const MedicationTable: React.FC<MedicationTableProps> = ({ medicines }) => {
  return (
    <div className="mt-3">
      <div className="text-xl font-bold text-slate-900 font-serif italic mb-2.5">Rx</div>
      
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-t border-b border-slate-400 text-[11px] font-bold text-slate-900">
            <th className="text-left py-2 w-[55%]">Medicine Name</th>
            <th className="text-left py-2 w-[30%]">Dosage</th>
            <th className="text-left py-2 w-[15%]">Duration</th>
          </tr>
        </thead>
        <tbody>
          {medicines && medicines.length > 0 ? (
            medicines.map((med, index) => {
              const totalQty = med.quantity || calculateTotalQty(med.frequency, med.duration);
              return (
                <tr key={med.id || index} className="border-b border-slate-200 text-[11px] text-slate-800 align-top">
                  {/* Name Column */}
                  <td className="py-2.5 pr-4">
                    <div className="font-bold text-slate-900">{index + 1}) {med.brandName?.toUpperCase() || med.genericName?.toUpperCase()}</div>
                    {/* Generic Composition in small blue capital text */}
                    {med.genericName && med.genericName !== med.brandName && (
                      <div className="text-[9px] text-blue-600 font-bold uppercase mt-0.5 tracking-wide">
                        {med.genericName}
                      </div>
                    )}
                  </td>
                  
                  {/* Dosage Column */}
                  <td className="py-2.5 pr-4">
                    <div className="font-semibold text-slate-900">{formatFrequency(med.frequency)}</div>
                    {med.instructions && (
                      <div className="text-[10px] text-slate-500 mt-0.5 italic">
                        ({med.instructions})
                      </div>
                    )}
                  </td>
                  
                  {/* Duration Column */}
                  <td className="py-2.5">
                    <div className="font-semibold text-slate-900">{med.duration}</div>
                    {totalQty !== null && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        (Tot: {totalQty} Tab)
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3} className="py-4 text-center text-[11px] text-slate-400 italic">
                No medicines prescribed
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
