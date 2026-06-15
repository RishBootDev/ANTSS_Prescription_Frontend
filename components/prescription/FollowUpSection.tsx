import React from "react";

interface FollowUpSectionProps {
  advice: string[];
  followUp?: {
    days: number;
    date?: string;
    note?: string;
  };
  additionalNotes?: string;
}

export const FollowUpSection: React.FC<FollowUpSectionProps> = ({
  advice,
  followUp,
  additionalNotes
}) => {
  return (
    <div className="space-y-4">
      {/* Advice Section */}
      {advice && advice.length > 0 && (
        <div className="mt-5">
          <h3 className="text-[12px] font-bold text-slate-900 mb-1.5 uppercase tracking-wide">Advice / Instructions:</h3>
          <ul className="space-y-1">
            {advice.map((item, index) => (
              <li key={index} className="text-[11px] text-slate-800 flex items-start gap-1">
                <span className="font-bold">*</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Notes */}
      {additionalNotes && (
        <div className="mt-4 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
          <span className="font-bold block text-slate-900 mb-0.5 uppercase tracking-wide text-[10px]">Additional Notes</span>
          <p className="whitespace-pre-line leading-relaxed">{additionalNotes}</p>
        </div>
      )}

      {/* Follow Up block */}
      {followUp && (
        <div className="text-[12px] font-bold text-slate-900 mt-6">
          <span>Follow Up: {followUp.date || `after ${followUp.days} days`} {followUp.note ? `(${followUp.note})` : ""}</span>
        </div>
      )}
    </div>
  );
};
