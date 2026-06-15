import { useState, useEffect, useCallback } from "react";
import { prescriptionApi } from "@/services/api";
import { 
  MappedPrescription, 
  ApiDetailedPrescriptionResponse, 
  ApiDoctorResponse, 
  ApiHospitalResponse, 
  ApiClinicResponse,
  MappedClinicInfo,
  MappedDoctorInfo,
  MappedPatientInfo,
  MappedVital,
  MappedMedicine,
  MappedTest
} from "@/types/prescription";

const DEFAULT_CLINIC: MappedClinicInfo = {
  name: "SMS Hospital & Clinic",
  address: "B/503, Business Center, MG Road, Pune - 411000",
  phone: "+91 20 5465 6476",
  timings: "Timing: 09:00 AM - 01:00 PM, 06:00 PM - 08:00 PM | Closed: Sunday",
  logo: "/_DOCTOR.jpeg"
};

const DEFAULT_DOCTOR: MappedDoctorInfo = {
  name: "Dr. Akshara",
  qualification: "M.S., D.N.B.",
  registrationNo: "MMC 2018/03/0842",
  specialization: "General Physician",
  signatureUrl: undefined
};

/**
 * Validates the API prescription response to ensure it has required structure
 */
function validatePrescriptionResponse(data: any): data is ApiDetailedPrescriptionResponse {
  if (!data || typeof data !== "object") return false;
  if (typeof data.prescriptionId !== "number") return false;
  if (!data.consultation || typeof data.consultation !== "object") return false;
  if (typeof data.consultation.patientName !== "string") return false;
  return true;
}

export function usePrescription(prescriptionId: number | null) {
  const [prescription, setPrescription] = useState<MappedPrescription | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptionData = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch prescription details from backend API
      const rawPrescription = await prescriptionApi.getDetailedPrescription(id);
      
      // Validate response structure
      if (!validatePrescriptionResponse(rawPrescription)) {
        throw new Error("Invalid prescription data structure received from the server.");
      }

      const consultation = rawPrescription.consultation;
      let doctorDetails: ApiDoctorResponse | null = null;
      let clinicDetails: ApiClinicResponse | null = null;
      let hospitalDetails: ApiHospitalResponse | null = null;

      // 2. Fetch doctor details if doctorId is present
      if (consultation.doctorId) {
        try {
          const docRes = await prescriptionApi.getDoctorDetails(consultation.doctorId);
          if (docRes && docRes.success && docRes.data) {
            doctorDetails = docRes.data;
          }
        } catch (e) {
          console.warn(`Could not fetch doctor details for ID: ${consultation.doctorId}. Using consultation fallback.`, e);
        }
      }

      // 3. Fetch clinic details if clinicId is present in doctor response
      if (doctorDetails?.clinicId) {
        try {
          const clinicRes = await prescriptionApi.getClinicDetails(doctorDetails.clinicId);
          if (clinicRes && clinicRes.success && clinicRes.data) {
            clinicDetails = clinicRes.data;
          }
        } catch (e) {
          console.warn(`Could not fetch clinic details for ID: ${doctorDetails.clinicId}`, e);
        }
      }

      // 4. Fetch hospital details if hospitalId is present in doctor response (and clinic wasn't fetched/found)
      if (doctorDetails?.hospitalId && !clinicDetails) {
        try {
          const hospRes = await prescriptionApi.getHospitalDetails(doctorDetails.hospitalId);
          if (hospRes && hospRes.success && hospRes.data) {
            hospitalDetails = hospRes.data;
          }
        } catch (e) {
          console.warn(`Could not fetch hospital details for ID: ${doctorDetails.hospitalId}`, e);
        }
      }

      // 5. Map the fetched API data into UI component friendly structures

      // Map Clinic/Hospital Info
      let mappedClinic: MappedClinicInfo = { ...DEFAULT_CLINIC };
      if (clinicDetails) {
        const addressParts = [
          clinicDetails.addressLine1,
          clinicDetails.city,
          clinicDetails.state,
          clinicDetails.pincode
        ].filter(Boolean);
        mappedClinic = {
          name: clinicDetails.clinicName,
          address: addressParts.join(", ") || DEFAULT_CLINIC.address,
          phone: clinicDetails.mobileNumber || DEFAULT_CLINIC.phone,
          timings: DEFAULT_CLINIC.timings, // default timings fallback
          logo: DEFAULT_CLINIC.logo
        };
      } else if (hospitalDetails) {
        const addressParts = [
          hospitalDetails.addressLine1,
          hospitalDetails.city,
          hospitalDetails.state,
          hospitalDetails.pincode
        ].filter(Boolean);
        mappedClinic = {
          name: hospitalDetails.hospitalName,
          address: addressParts.join(", ") || DEFAULT_CLINIC.address,
          phone: hospitalDetails.mobileNumber || DEFAULT_CLINIC.phone,
          timings: DEFAULT_CLINIC.timings,
          logo: DEFAULT_CLINIC.logo
        };
      }

      // Map Doctor Info
      const mappedDoctor: MappedDoctorInfo = {
        name: doctorDetails?.doctorName || consultation.doctorName || DEFAULT_DOCTOR.name,
        qualification: doctorDetails?.qualification || consultation.qualification || DEFAULT_DOCTOR.qualification,
        registrationNo: doctorDetails?.registrationNumber || consultation.doctorCode || DEFAULT_DOCTOR.registrationNo,
        specialization: doctorDetails?.specialization || consultation.specialization || DEFAULT_DOCTOR.specialization,
        signatureUrl: doctorDetails?.signatureUrl || undefined
      };

      // Format visit date & time from createdAt ISO string (e.g. 2026-06-15T12:00:00)
      let visitDateStr = "N/A";
      let visitTimeStr = "";
      if (rawPrescription.createdAt) {
        try {
          const dateObj = new Date(rawPrescription.createdAt);
          if (!isNaN(dateObj.getTime())) {
            visitDateStr = dateObj.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });
            visitTimeStr = dateObj.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            });
          }
        } catch (_) {}
      }

      // Map Patient Info
      const mappedPatient: MappedPatientInfo = {
        id: consultation.registrationNumber || String(consultation.patientId || ""),
        name: consultation.patientName,
        age: consultation.age,
        gender: consultation.gender,
        contactNumber: consultation.mobileNumber || undefined,
        visitDate: visitDateStr,
        visitTime: visitTimeStr,
        prescriptionId: String(rawPrescription.prescriptionId)
      };

      // Map Clinical Vitals dynamically
      const mappedVitals: MappedVital[] = [];
      if (consultation.bp) {
        mappedVitals.push({ label: "Blood Pressure", value: consultation.bp, unit: "mmHg" });
      }
      if (consultation.pulse) {
        mappedVitals.push({ label: "Pulse Rate", value: String(consultation.pulse), unit: "bpm" });
      }
      if (consultation.temperature) {
        mappedVitals.push({ label: "Body Temp", value: String(consultation.temperature), unit: "°F" });
      }
      if (consultation.spo2) {
        mappedVitals.push({ label: "Oxygen Saturation", value: String(consultation.spo2), unit: "%" });
      }
      if (consultation.weight) {
        mappedVitals.push({ label: "Weight", value: String(consultation.weight), unit: "kg" });
      }
      if (consultation.height) {
        mappedVitals.push({ label: "Height", value: String(consultation.height), unit: "cm" });
      }
      if (consultation.respiratoryRate) {
        mappedVitals.push({ label: "Resp. Rate", value: String(consultation.respiratoryRate), unit: "bpm" });
      }

      // Map chief complaints
      const chiefComplaints: string[] = [];
      if (consultation.complaintName) {
        let comp = consultation.complaintName;
        if (consultation.severity) comp += ` (${consultation.severity})`;
        if (consultation.complaintDuration) comp += ` - ${consultation.complaintDuration}`;
        if (consultation.complaintFrequency) comp += ` (${consultation.complaintFrequency})`;
        chiefComplaints.push(comp);
      }

      // Map general examinations
      const clinicalFindings: string[] = [];
      if (consultation.generalExamination) {
        clinicalFindings.push(consultation.generalExamination);
      }

      // Map medical history & allergies
      const pastHistory: string[] = [];
      if (consultation.medicalHistory) {
        pastHistory.push(consultation.medicalHistory);
      }
      if (consultation.currentMedicine) {
        pastHistory.push(`On medications: ${consultation.currentMedicine}`);
      }

      const allergies: string[] = [];
      if (consultation.allergies) {
        allergies.push(consultation.allergies);
      }

      // Map diagnosis
      let diagnosisStr = "";
      if (consultation.diagnosisName) {
        diagnosisStr = consultation.diagnosisName;
        if (consultation.diagnosisCode) {
          diagnosisStr += ` (SNOMED: ${consultation.diagnosisCode})`;
        }
        if (consultation.diagnosisDuration) {
          diagnosisStr += ` - ${consultation.diagnosisDuration}`;
        }
      }

      // Map medicines
      const mappedMedicines: MappedMedicine[] = (rawPrescription.medicines || []).map((med, idx) => ({
        id: med.prescriptionMedicineId || idx,
        genericName: med.medicineName,
        dosage: med.dosage,
        frequency: med.frequency,
        instructions: med.instruction || "As directed by physician",
        duration: med.duration,
        quantity: med.quantity
      }));

      // Map tests recommended (merge testRequested and investigations)
      const tests: MappedTest[] = [];
      if (rawPrescription.testRequested) {
        rawPrescription.testRequested.forEach(tr => {
          tests.push({ id: `tr-${tr.id}`, name: tr.testName });
        });
      }
      if (rawPrescription.investigations) {
        rawPrescription.investigations.forEach(inv => {
          tests.push({ id: `inv-${inv.id}`, name: inv.investigationName });
        });
      }

      // Map advice
      const advice: string[] = consultation.advice
        ? consultation.advice.split("\n").map(s => s.trim()).filter(Boolean)
        : [];

      // Calculate follow-up date and days
      let followUp: MappedPrescription["followUp"] = undefined;
      if (consultation.followUpDate) {
        try {
          const followUpDateObj = new Date(consultation.followUpDate);
          if (!isNaN(followUpDateObj.getTime())) {
            const diffTime = followUpDateObj.getTime() - new Date().getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            followUp = {
              days: diffDays > 0 ? diffDays : 0,
              date: followUpDateObj.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              }),
              note: diffDays > 0 ? `In ${diffDays} days` : "As scheduled"
            };
          }
        } catch (_) {}
      }

      const mappedPrescription: MappedPrescription = {
        prescriptionId: rawPrescription.prescriptionId,
        clinic: mappedClinic,
        doctor: mappedDoctor,
        patient: mappedPatient,
        vitals: mappedVitals,
        chiefComplaints,
        clinicalFindings,
        pastHistory,
        allergies,
        diagnosis: diagnosisStr,
        medicines: mappedMedicines,
        testsRecommended: tests,
        advice,
        followUp,
        additionalNotes: rawPrescription.notes,
        documents: rawPrescription.documents
      };

      setPrescription(mappedPrescription);
    } catch (e: any) {
      console.error("Error loading prescription details:", e);
      setError(e.message || "Failed to load prescription details from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (prescriptionId !== null) {
      fetchPrescriptionData(prescriptionId);
    }
  }, [prescriptionId, fetchPrescriptionData]);

  const refresh = useCallback(() => {
    if (prescriptionId !== null) {
      fetchPrescriptionData(prescriptionId);
    }
  }, [prescriptionId, fetchPrescriptionData]);

  return {
    prescription,
    loading,
    error,
    refresh
  };
}
