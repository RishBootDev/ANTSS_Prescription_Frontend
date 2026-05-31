"use client";

import { useEffect, useState } from "react";
import { PrescriptionView, convertPatientDataToPrescription } from "@/components/prescription";

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

export default function PrescriptionDemoPage() {
  const [patientData, setPatientData] = useState(samplePatientData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Read patient data from localStorage (set by patient-form)
    try {
      const storedData = localStorage.getItem('prescriptionData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setPatientData(parsed);
      }
    } catch (e) {
      console.error('Failed to load prescription data:', e);
    }
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading prescription...</div>
      </div>
    );
  }

  const prescription = convertPatientDataToPrescription(patientData);
  
  return <PrescriptionView prescription={prescription} />;
}