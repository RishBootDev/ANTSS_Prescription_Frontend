"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PrescriptionView, convertPatientDataToPrescription } from "@/components/prescription";
import { MappedPrescription } from "@/types/prescription";
import { prescriptionApi } from "@/services/api";

// Sample patient data for demo purposes (fallback)
const samplePatientData = {
  name: "Rahul Sharma",
  age: 34,
  gender: "Male" as const,
  weight: 70,
  height: 175,
  bloodPressureSystolic: 120,
  bloodPressureDiastolic: 80,
  pulse: 78,
  temperature: 99.2,
  oxygenSaturation: 97,
  bloodGroup: "B+",
  visitDate: new Date().toISOString().split('T')[0],
  
  allergies: "Penicillin (severe rash), Sulfa drugs (mild reaction)",
  currentMedications: "None regular",
  chiefComplaint: null,
  symptoms: null,
  medicalHistory: "No known chronic illnesses, No previous hospitalizations",
  
  quickNotes: "Patient advised rest",
  complaints: [
    { id: "1", complaint: "Dry cough", frequency: "Throughout day", severity: "Moderate", duration: "5 days", date: null },
    { id: "2", complaint: "Chest tightness", frequency: "Intermittent", severity: "Mild", duration: "3 days", date: null }
  ],
  generalExamination: "Mild wheezing on auscultation",
  diagnoses: [
    { id: "1", diagnosis: "Acute Bronchitis", snomedCode: "J20.9", duration: "7-10 days", date: null }
  ],
  
  advice: "Get adequate rest and sleep (8-10 hours)\nDrink warm fluids frequently\nUse steam inhalation 2-3 times daily\nAvoid cold drinks and refrigerated foods",
  testsRequested: "Complete Blood Count (CBC), Chest X-Ray (PA View)",
  investigations: "C-Reactive Protein (CRP)",
  nextVisit: "Review if symptoms persist or worsen",
  followUp: "5",
  
  medicines: [
    { id: "1", name: "Azithromycin", dose: "500mg", frequency: "1-0-0", duration: "5 days", instructions: "Take on empty stomach" },
    { id: "2", name: "Ambroxol + Guaifenesin", dose: "10ml", frequency: "1-1-1", duration: "7 days", instructions: "Take after meals" },
    { id: "3", name: "Montelukast + Levocetirizine", dose: "10mg + 5mg", frequency: "0-0-1", duration: "7 days", instructions: "Take at bedtime" },
    { id: "4", name: "Paracetamol", dose: "650mg", frequency: "1-1-1 (SOS)", duration: "3 days", instructions: "Only if fever > 100°F" },
    { id: "5", name: "Vitamin C + Zinc", dose: "500mg", frequency: "1-0-0", duration: "10 days", instructions: "Take after breakfast" }
  ],
  
  contactNumber: "+91 98765 43210",
  emergencyContact: "+91 98765 00000",
  insuranceId: ""
};

function PrescriptionDemoContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const [localPrescription, setLocalPrescription] = useState<MappedPrescription | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!idParam) {
      const fetchLocalAndProfile = async () => {
        try {
          let patientData = samplePatientData;
          try {
            const storedData = localStorage.getItem('prescriptionData');
            if (storedData) {
              patientData = JSON.parse(storedData);
            }
          } catch (e) {
            console.error('Failed to load prescription data from local storage:', e);
          }

          const mapped = convertPatientDataToPrescription(patientData);

          // Fetch logged-in doctor profile to overlay actual details
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
                  console.warn("Failed to fetch clinic details for demo preview", e);
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
                  console.warn("Failed to fetch hospital details for demo preview", e);
                }
              }
            }
          } catch (e) {
            console.warn("Could not fetch doctor profile for demo preview", e);
          }

          setLocalPrescription(mapped);
        } catch (e) {
          console.error("Failed to map demo prescription:", e);
        } finally {
          setIsLoaded(true);
        }
      };

      fetchLocalAndProfile();
    } else {
      setIsLoaded(true);
    }
  }, [idParam]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading prescription...</div>
      </div>
    );
  }

  if (idParam) {
    const prescriptionId = parseInt(idParam, 10);
    return <PrescriptionView prescriptionId={isNaN(prescriptionId) ? undefined : prescriptionId} />;
  }

  if (localPrescription) {
    return <PrescriptionView prescription={localPrescription} />;
  }

  return null;
}

export default function PrescriptionDemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <PrescriptionDemoContent />
    </Suspense>
  );
}