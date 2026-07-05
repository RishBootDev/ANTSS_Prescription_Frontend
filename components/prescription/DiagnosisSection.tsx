import React from "react";
import { AlertTriangle } from "lucide-react";

interface DiagnosisSectionProps {
  chiefComplaints: string[];
  clinicalFindings: string[];
  pastHistory: string[];
  allergies: string[];
  diagnosis: string;
  showPrimary?: boolean;
  showHistory?: boolean;
  showDiagnosis?: boolean;
}

export const DiagnosisSection: React.FC<DiagnosisSectionProps> = ({
  chiefComplaints,
  clinicalFindings,
  pastHistory,
  allergies,
  diagnosis,
  showPrimary = true,
  showHistory = true,
  showDiagnosis = true,
}) => {
  const hasComplaints = showPrimary && chiefComplaints.length > 0;
  const hasFindings = showPrimary && clinicalFindings.length > 0;
  const hasHistory = showHistory && pastHistory.length > 0;
  const hasAllergies = showHistory && allergies.length > 0;
  const hasDiagnosis = showDiagnosis && Boolean(diagnosis.trim());

  if (!hasComplaints && !hasFindings && !hasHistory && !hasAllergies && !hasDiagnosis) {
    return null;
  }

  return (
    <section className="space-y-4">
      {/* Two Column Layout: Chief Complaints & Clinical Findings */}
      {(hasComplaints || hasFindings) && (
      <div
        className={`grid border-y border-slate-300 py-3.5 ${
          hasComplaints && hasFindings ? "grid-cols-2 gap-x-6" : "grid-cols-1"
        }`}
      >
        {/* Left Column: Chief Complaints */}
        {hasComplaints && (
        <div className={hasFindings ? "border-r border-slate-300 pr-4" : ""}>
          <h3 className="text-[12px] font-bold text-slate-900 mb-2 uppercase tracking-wide">Chief Complaints</h3>
          <ul className="space-y-1.5">
            {chiefComplaints.map((item, index) => (
              <li key={index} className="text-[11px] text-slate-800 flex items-start gap-1">
                <span className="font-bold">*</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        )}

        {/* Right Column: Clinical Findings */}
        {hasFindings && (
        <div className={hasComplaints ? "pl-2" : ""}>
          <h3 className="text-[12px] font-bold text-slate-900 mb-2 uppercase tracking-wide">Clinical Findings</h3>
          <ul className="space-y-1.5">
            {clinicalFindings.map((item, index) => (
              <li key={index} className="text-[11px] text-slate-800 flex items-start gap-1">
                <span className="font-bold">*</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        )}
      </div>
      )}

      {/* History and Allergies row */}
      {(hasHistory || hasAllergies) && (
        <div className={`grid gap-4 mt-2 ${hasHistory && hasAllergies ? "grid-cols-2" : "grid-cols-1"}`}>
          {/* Past History */}
          {hasHistory && (
          <div>
              <>
                <h3 className="text-[11px] font-bold text-slate-900 mb-1 uppercase tracking-wide">Past History</h3>
                <ul className="space-y-1">
                  {pastHistory.map((item, index) => (
                    <li key={index} className="text-[11px] text-slate-700 flex items-start gap-1">
                      <span className="text-slate-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
          </div>
          )}

          {/* Allergies Warning */}
          {hasAllergies && (
          <div>
              <div className="bg-red-50 border-l-2 border-red-500 p-2 rounded-r-md">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-800 text-[10px] uppercase tracking-wider mb-0.5">Allergies Warning</h4>
                    <ul className="space-y-0.5">
                      {allergies.map((allergy, index) => (
                        <li key={index} className="text-[10px] text-red-700 font-semibold">
                          • {allergy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
          </div>
          )}
        </div>
      )}

      {/* Diagnosis */}
      {hasDiagnosis && (
      <div className="mt-3">
        <h3 className="text-[12px] font-bold text-slate-900 mb-1 uppercase tracking-wide">Diagnosis:</h3>
        <ul className="space-y-1">
          {diagnosis.split(',').map((diag, index) => (
            <li key={index} className="text-[11px] text-slate-800 flex items-start gap-1 font-semibold">
              <span className="font-bold">*</span>
              <span>{diag.trim()}</span>
            </li>
          ))}
        </ul>
      </div>
      )}
    </section>
  );
};
