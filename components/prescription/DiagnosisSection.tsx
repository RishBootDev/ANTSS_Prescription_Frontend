import React from "react";
import { AlertTriangle } from "lucide-react";

interface DiagnosisSectionProps {
  chiefComplaints: string[];
  clinicalFindings: string[];
  pastHistory: string[];
  allergies: string[];
  diagnosis: string;
}

export const DiagnosisSection: React.FC<DiagnosisSectionProps> = ({
  chiefComplaints,
  clinicalFindings,
  pastHistory,
  allergies,
  diagnosis
}) => {
  return (
    <div className="space-y-4">
      {/* Two Column Layout: Chief Complaints & Clinical Findings */}
      <div className="grid grid-cols-2 border-t border-b border-slate-300 py-3.5 gap-x-6">
        
        {/* Left Column: Chief Complaints */}
        <div className="border-r border-slate-300 pr-4">
          <h3 className="text-[12px] font-bold text-slate-900 mb-2 uppercase tracking-wide">Chief Complaints</h3>
          {chiefComplaints && chiefComplaints.length > 0 ? (
            <ul className="space-y-1.5">
              {chiefComplaints.map((item, index) => (
                <li key={index} className="text-[11px] text-slate-800 flex items-start gap-1">
                  <span className="font-bold">*</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-slate-400 italic">None reported</p>
          )}
        </div>

        {/* Right Column: Clinical Findings */}
        <div className="pl-2">
          <h3 className="text-[12px] font-bold text-slate-900 mb-2 uppercase tracking-wide">Clinical Findings</h3>
          {clinicalFindings && clinicalFindings.length > 0 ? (
            <ul className="space-y-1.5">
              {clinicalFindings.map((item, index) => (
                <li key={index} className="text-[11px] text-slate-800 flex items-start gap-1">
                  <span className="font-bold">*</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-slate-400 italic">None noted</p>
          )}
        </div>
      </div>

      {/* History and Allergies row */}
      {(pastHistory.length > 0 || allergies.length > 0) && (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* Past History */}
          <div>
            {pastHistory.length > 0 && (
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
            )}
          </div>
          
          {/* Allergies Warning */}
          <div>
            {allergies.length > 0 && (
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
            )}
          </div>
        </div>
      )}

      {/* Diagnosis */}
      <div className="mt-3">
        <h3 className="text-[12px] font-bold text-slate-900 mb-1 uppercase tracking-wide">Diagnosis:</h3>
        {diagnosis ? (
          <ul className="space-y-1">
            {diagnosis.split(',').map((diag, index) => (
              <li key={index} className="text-[11px] text-slate-800 flex items-start gap-1 font-semibold">
                <span className="font-bold">*</span>
                <span>{diag.trim()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-slate-400 italic">None entered</p>
        )}
      </div>
    </div>
  );
};
