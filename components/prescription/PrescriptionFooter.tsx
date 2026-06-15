import React from "react";
import { MappedDoctorInfo } from "@/types/prescription";

interface PrescriptionFooterProps {
  doctor: MappedDoctorInfo;
}

export const PrescriptionFooter: React.FC<PrescriptionFooterProps> = ({ doctor }) => {
  return (
    <div className="mt-8">
      {/* Signature Placement */}
      <div className="flex justify-end items-end mb-6">
        <div className="text-center pr-4">
          <div className="h-16 w-44 flex flex-col justify-end items-center border-b border-dashed border-slate-300 mb-1 pb-1">
            {doctor.signatureUrl ? (
              <img 
                src={doctor.signatureUrl} 
                alt="Doctor Signature" 
                className="max-h-14 object-contain" 
              />
            ) : (
              <div className="h-12 w-full" />
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Doctor Signature / Stamp
          </div>
        </div>
      </div>

      {/* Footer Divider & Disclaimer */}
      <div className="border-t border-slate-300 pt-2 text-center">
        <p className="text-[10px] text-slate-500 italic">
          Substitute with equivalent Generics as required. • This is a digitally signed prescription.
        </p>
      </div>
    </div>
  );
};
