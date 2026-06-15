import React from "react";
import { MappedClinicInfo, MappedDoctorInfo } from "@/types/prescription";

interface PrescriptionHeaderProps {
  clinic: MappedClinicInfo;
  doctor: MappedDoctorInfo;
}

export const PrescriptionHeader: React.FC<PrescriptionHeaderProps> = ({ clinic, doctor }) => {
  return (
    <div className="flex justify-between items-start gap-4">
      {/* Left Column: Doctor Details */}
      <div className="w-[38%] text-left">
        <h2 className="text-lg font-bold text-slate-900 leading-tight">{doctor.name}</h2>
        <p className="text-xs text-slate-800 font-medium mt-0.5">{doctor.qualification}</p>
        <p className="text-[11px] text-slate-600 mt-1">Reg. No: {doctor.registrationNo}</p>
        {doctor.specialization && (
          <p className="text-[11px] text-slate-500 mt-0.5">{doctor.specialization}</p>
        )}
      </div>
      
      {/* Center Column: Logo */}
      <div className="w-[24%] flex justify-center items-center">
        {clinic.logo ? (
          <img 
            src={clinic.logo} 
            alt="Clinic Logo" 
            className="h-14 w-auto object-contain max-h-14 max-w-full" 
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs italic">
            Logo
          </div>
        )}
      </div>

      {/* Right Column: Clinic Details */}
      <div className="w-[38%] text-right">
        <h1 className="text-xl font-bold text-blue-600 leading-tight uppercase">{clinic.name}</h1>
        <p className="text-[11px] text-slate-800 mt-1 leading-normal">{clinic.address}</p>
        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
          Ph: {clinic.phone} <br />
          {clinic.timings || "Timing: 09:00 AM - 01:00 PM, 06:00 PM - 08:00 PM | Closed: Sunday"}
        </p>
      </div>
    </div>
  );
};
