"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import PrescriptionView from "@/components/prescription/PrescriptionView";
import { convertPatientDataToPrescription } from "@/components/prescription/convert";
import { MappedPrescription } from "@/types/prescription";
import { prescriptionApi } from "@/services/api";

function PrescriptionContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const [localPrescription, setLocalPrescription] = useState<MappedPrescription | null>(null);

  // If no ID is specified, check localStorage for preview fallback
  useEffect(() => {
    if (!idParam) {
      const fetchLocalAndProfile = async () => {
        try {
          const stored = localStorage.getItem("prescriptionData");
          if (!stored) return;
          const patientData = JSON.parse(stored);
          
          // Start with mapping patient data
          const mapped = convertPatientDataToPrescription(patientData);
          
          // Try to fetch logged-in doctor details
          try {
            const docRes = await prescriptionApi.getDoctorProfile();
            if (docRes && docRes.success && docRes.data) {
              const doc = docRes.data;
              mapped.doctor = {
                name: doc.doctorName || mapped.doctor.name,
                qualification: doc.qualification || mapped.doctor.qualification,
                registrationNo: doc.registrationNumber || mapped.doctor.registrationNo,
                specialization: doc.specialization || mapped.doctor.specialization,
                signatureUrl: doc.signatureUrl || undefined
              };

              // Try to fetch clinic/hospital info based on doctor's associated ID
              if (doc.clinicId) {
                try {
                  const clinicRes = await prescriptionApi.getClinicDetails(doc.clinicId);
                  if (clinicRes && clinicRes.success && clinicRes.data) {
                    const clinic = clinicRes.data;
                    const addressParts = [
                      clinic.addressLine1,
                      clinic.city,
                      clinic.state,
                      clinic.pincode
                    ].filter(Boolean);
                    mapped.clinic = {
                      name: clinic.clinicName,
                      address: addressParts.join(", ") || mapped.clinic.address,
                      phone: clinic.mobileNumber || mapped.clinic.phone,
                      timings: mapped.clinic.timings,
                      logo: mapped.clinic.logo
                    };
                  }
                } catch (e) {
                  console.warn("Failed to fetch clinic details for local preview", e);
                }
              } else if (doc.hospitalId) {
                try {
                  const hospRes = await prescriptionApi.getHospitalDetails(doc.hospitalId);
                  if (hospRes && hospRes.success && hospRes.data) {
                    const hosp = hospRes.data;
                    const addressParts = [
                      hosp.addressLine1,
                      hosp.city,
                      hosp.state,
                      hosp.pincode
                    ].filter(Boolean);
                    mapped.clinic = {
                      name: hosp.hospitalName,
                      address: addressParts.join(", ") || mapped.clinic.address,
                      phone: hosp.mobileNumber || mapped.clinic.phone,
                      timings: mapped.clinic.timings,
                      logo: mapped.clinic.logo
                    };
                  }
                } catch (e) {
                  console.warn("Failed to fetch hospital details for local preview", e);
                }
              }
            }
          } catch (e) {
            console.warn("Could not fetch logged-in doctor profile for local preview fallback", e);
          }
          
          setLocalPrescription(mapped);
        } catch (e) {
          console.error("Failed to parse local prescription fallback:", e);
        }
      };
      
      fetchLocalAndProfile();
    }
  }, [idParam]);

  if (idParam) {
    const prescriptionId = parseInt(idParam, 10);
    if (isNaN(prescriptionId)) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 shadow-lg text-center">
            <h2 className="text-lg font-bold text-red-600">Invalid Prescription ID</h2>
            <p className="text-sm text-slate-600 mt-2">The provided prescription ID is not valid.</p>
          </div>
        </div>
      );
    }

    return <PrescriptionView prescriptionId={prescriptionId} />;
  }

  // Fallback to local storage (for unsaved patient form prints)
  if (localPrescription) {
    return <PrescriptionView prescription={localPrescription} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 shadow-lg text-center">
        <h2 className="text-lg font-bold text-slate-900">No Prescription Selected</h2>
        <p className="text-sm text-slate-600 mt-2">Please load this page with a valid prescription ID (e.g., /prescription?id=1) or print from the consultation workspace.</p>
      </div>
    </div>
  );
}

export default function PrescriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <PrescriptionContent />
    </Suspense>
  );
}
