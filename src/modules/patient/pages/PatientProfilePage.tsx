import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Activity,
  Search,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Printer,
  Download,
  Edit,
  Plus,
  History,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { patientService } from "@/src/services/patient.service";
import { prescriptionService } from "@/src/services/prescription.service";
import { printHeadersService, type PrintHeader } from "@/src/services/printHeaders.service";
import { tokenService } from "@/src/modules/auth/services/token.service";
import { useAuthStore } from "@/src/store/authStore";

interface RegistrationInfo {
  registrationId?: number;
  registrationNumber: string;
  registrationDate: string;
  clinicName: string;
  status: string;
}

export default function PatientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const patientId = Number(params.id);
  const { isAuthenticated, initialize } = useAuthStore();

  const [patient, setPatient] = useState<any>(null);
  const [registration, setRegistration] = useState<RegistrationInfo | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allPatients, setAllPatients] = useState<any[]>([]);

  const [previewPrescription, setPreviewPrescription] = useState<any | null>(null);
  const [printingPrescriptionId, setPrintingPrescriptionId] = useState<number | null>(null);

  const [consultationSearch, setConsultationSearch] = useState("");
  const [consultationFilterDoctor, setConsultationFilterDoctor] = useState("all");
  const [consultationPage, setConsultationPage] = useState(1);
  const [prescriptionPage, setPrescriptionPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const patientData = await patientService.getRegistrationById(patientId) as any;
        setPatient(patientData);

        const detailedPrescriptions = await prescriptionService.getDetailedPrescriptionsByPatientId(patientId);
        const sortedHistory = (detailedPrescriptions || []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setHistory(sortedHistory);

        const registrations = await patientService.getAllRegistrations();
        const patientReg = registrations.find((reg: any) => reg.registrationId === patientId) as any;

        if (patientReg) {
          setRegistration({
            registrationId: patientReg.registrationId,
            registrationNumber: patientReg.registrationNumber || "N/A",
            registrationDate: patientReg.createdAt ? new Date(patientReg.createdAt).toLocaleDateString() : "N/A",
            clinicName: patientReg.clinicName || patientReg.hospitalName || "General Clinic",
            status: patientReg.status || "Active",
          });
        } else {
          setRegistration({
            registrationNumber: `REG-${String(patientId).padStart(5, "0")}`,
            registrationDate: patientData.createdAt ? new Date(patientData.createdAt).toLocaleDateString() : "N/A",
            clinicName: "General Clinic",
            status: "Active",
          });
        }

        const allPatientsData = await patientService.getAllRegistrations();
        const mappedPatients = allPatientsData.map((p: any) => {
          const matchingReg = registrations.find((r: any) => r.registrationId === p.registrationId);
          return {
            ...p,
            patientId: p.patientId || p.registrationId,
            registrationNumber: matchingReg?.registrationNumber || p.registrationNumber || `REG-${String(p.registrationId).padStart(5, "0")}`,
          };
        });
        setAllPatients(mappedPatients);
      } catch (err) {
        console.error("Failed to load patient profile data", err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const matches = allPatients
      .filter(
        (p) =>
          p.patientName?.toLowerCase().includes(query) ||
          p.mobileNumber?.includes(query) ||
          p.registrationNumber?.toLowerCase().includes(query)
      )
      .slice(0, 5);
    setSuggestions(matches);
  }, [searchQuery, allPatients]);

  const latestPrescription = history[0] || null;
  const latestConsultation = latestPrescription?.consultation || null;

  const stats = useMemo(() => {
    const totalConsults = history.length;
    const totalPrescriptions = history.filter((h) => h.medicines && h.medicines.length > 0).length;

    let nextFollowUp = "None Scheduled";
    const futureFollowUps = history
      .map((h) => h.consultation?.followUpDate)
      .filter((d) => d && new Date(d).getTime() > Date.now())
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    if (futureFollowUps.length > 0) {
      nextFollowUp = new Date(futureFollowUps[0]).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    return {
      totalConsults,
      totalPrescriptions,
      nextFollowUp,
      lastVisitDate: latestConsultation?.createdAt
        ? new Date(latestConsultation.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "N/A",
      lastPrescriptionDate: latestPrescription?.createdAt
        ? new Date(latestPrescription.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "N/A",
    };
  }, [history, latestConsultation, latestPrescription]);

  const todayPrescription = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return history.find((p) => p.createdAt?.startsWith(todayStr));
  }, [history]);

  const alerts = useMemo(() => {
    const list = [];
    const todayStr = new Date().toISOString().split("T")[0];

    const visitedToday = history.some((h) => h.createdAt?.startsWith(todayStr));
    if (visitedToday) {
      list.push({
        id: "visited-today",
        type: "info",
        message: "Patient has checked in and visited the clinic today.",
      });
    }

    if (todayPrescription) {
      list.push({
        id: "rx-created-today",
        type: "warning",
        message: "Today's Prescription is already recorded. Click 'Edit Today's Prescription' to modify it.",
        action: "edit-today",
      });
    }

    const pastFollowUps = history
      .map((h) => h.consultation?.followUpDate)
      .filter((d) => d && new Date(d).getTime() < Date.now())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (pastFollowUps.length > 0 && latestConsultation) {
      const latestFollowUpTime = new Date(pastFollowUps[0]).getTime();
      const latestConsultTime = new Date(latestConsultation.createdAt).getTime();
      if (latestFollowUpTime > latestConsultTime) {
        list.push({
          id: "followup-overdue",
          type: "danger",
          message: `Scheduled follow-up date (${new Date(pastFollowUps[0]).toLocaleDateString()}) is overdue.`,
        });
      }
    }

    if (latestConsultation) {
      const bpStr = latestConsultation.bp || "";
      const systolic = parseInt(bpStr.split("/")[0]);
      const pulse = parseInt(latestConsultation.pulse);

      if (systolic > 140 || pulse > 100) {
        list.push({
          id: "high-risk-vitals",
          type: "danger",
          message: `High risk vitals detected during last visit: BP: ${bpStr || "N/A"}, Pulse: ${
            latestConsultation.pulse || "N/A"
          } bpm.`,
        });
      }
    }

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentVisitsCount = history.filter((h) => new Date(h.createdAt).getTime() > sevenDaysAgo).length;
    if (recentVisitsCount >= 2) {
      list.push({
        id: "frequent-visits",
        type: "warning",
        message: `Frequent visits warning: Patient visited ${recentVisitsCount} times within the last 7 days.`,
      });
    }

    return list;
  }, [history, todayPrescription, latestConsultation]);

  const doctorsList = useMemo(() => {
    const docs = new Set<string>();
    history.forEach((h) => {
      const name = h.consultation?.doctorName;
      if (name) docs.add(name);
    });
    return Array.from(docs);
  }, [history]);

  const filteredConsultations = useMemo(() => {
    return history.filter((item) => {
      const c = item.consultation || {};
      const matchesSearch =
        !consultationSearch ||
        c.diagnosisName?.toLowerCase().includes(consultationSearch.toLowerCase()) ||
        c.doctorName?.toLowerCase().includes(consultationSearch.toLowerCase());

      const matchesDoctor = consultationFilterDoctor === "all" || c.doctorName === consultationFilterDoctor;

      return matchesSearch && matchesDoctor;
    });
  }, [history, consultationSearch, consultationFilterDoctor]);

  const paginatedConsultations = useMemo(() => {
    const startIndex = (consultationPage - 1) * itemsPerPage;
    return filteredConsultations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredConsultations, consultationPage]);

  const paginatedPrescriptions = useMemo(() => {
    const startIndex = (prescriptionPage - 1) * itemsPerPage;
    return history.slice(startIndex, startIndex + itemsPerPage);
  }, [history, prescriptionPage]);

  const getPrintHeaderId = (header: PrintHeader): number | null => {
    const value = Number(header.headerId ?? header.id);
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  const getPrintHeaderLookupCandidates = () => {
    const user = tokenService.getUser() as any;
    const candidates: Array<{ entityId?: number; entityType?: string }> = [];

    const addCandidate = (entityId: unknown, entityType: string) => {
      const numericEntityId = Number(entityId);
      if (Number.isFinite(numericEntityId) && numericEntityId > 0) {
        candidates.push({ entityId: numericEntityId, entityType });
      }
    };

    addCandidate(user?.doctorId, "DOCTOR");
    addCandidate(user?.clinicId, "CLINIC");
    addCandidate(user?.hospitalId, "HOSPITAL");
    candidates.push({});

    return candidates;
  };

  const resolvePrintHeaderId = async () => {
    for (const params of getPrintHeaderLookupCandidates()) {
      const headers = await printHeadersService.getHeaders(params);
      const headerId = headers
        .sort((a, b) => {
          const aTime = Date.parse(a.updatedAt || a.createdAt || "");
          const bTime = Date.parse(b.updatedAt || b.createdAt || "");
          return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
        })
        .map(getPrintHeaderId)
        .find((id): id is number => Boolean(id));

      if (headerId) return headerId;
    }

    return 0;
  };

  const openPrescriptionPdf = async (prescriptionId: number) => {
    try {
      setPrintingPrescriptionId(prescriptionId);
      const pdf = await printHeadersService.getPrescriptionPdf(
        await resolvePrintHeaderId(),
        prescriptionId
      );
      const pdfBlob = pdf.type === "application/pdf" ? pdf : new Blob([pdf], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      const openedWindow = window.open(url, "_blank", "noopener,noreferrer");

      if (!openedWindow) {
        const link = document.createElement("a");
        link.href = url;
        link.download = `prescription-${prescriptionId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error: any) {
      console.error("Failed to open prescription PDF:", error);
      window.alert(error?.message || "Failed to generate prescription PDF. Please try again.");
    } finally {
      setPrintingPrescriptionId(null);
    }
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleEditPrescription = (item: any) => {
    const currentPatient = {
      id: String(patientId),
      registrationId: registration?.registrationId || item.consultation?.registrationId,
      registrationNumber: registration?.registrationNumber || item.consultation?.registrationNumber,
      name: patient?.patientName,
      age: patient?.age,
      gender: patient?.gender,
      contactNumber: patient?.mobileNumber,
      bloodGroup: patient?.bloodGroup,
      visitDate: item.createdAt ? item.createdAt.split("T")[0] : null,
    };
    localStorage.setItem("currentConsultationPatient", JSON.stringify(currentPatient));
    router.push("/consultation");
  };

  const handleCreateNewPrescription = () => {
    const currentPatient = {
      id: String(patientId),
      registrationId: registration?.registrationId,
      registrationNumber: registration?.registrationNumber,
      name: patient?.patientName,
      age: patient?.age,
      gender: patient?.gender,
      contactNumber: patient?.mobileNumber,
      bloodGroup: patient?.bloodGroup,
    };
    localStorage.setItem("currentConsultationPatient", JSON.stringify(currentPatient));
    router.push("/consultation");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin text-primary text-4xl mb-4">⏳</div>
        <p className="text-muted-foreground font-medium">Loading patient history dashboard...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Patient Not Found</h2>
        <p className="text-muted-foreground max-w-md mt-2">
          The patient record you are attempting to view does not exist or has been removed from the database.
        </p>
        <Button onClick={() => router.push("/patients")} className="mt-6">
          Back to Patient List
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 print:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/patients"
              className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                Patient Health Overview
                {todayPrescription && (
                  <Badge variant="default" className="bg-green-600/10 text-green-600 hover:bg-green-600/20 text-xs font-semibold">
                    Today's Prescription Exists
                  </Badge>
                )}
              </h1>
              <p className="text-xs text-muted-foreground">UHID: {registration?.registrationNumber || "N/A"}</p>
            </div>
          </div>

          <div className="relative w-80 max-w-xs md:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Quick search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-9"
              />
            </div>
            {suggestions.length > 0 && (
              <div className="absolute right-0 top-11 z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
                <ul className="py-1">
                  {suggestions.map((p) => (
                    <li
                      key={p.patientId}
                      className="px-4 py-2 text-sm hover:bg-muted cursor-pointer flex flex-col"
                      onClick={() => {
                        setSearchQuery("");
                        setSuggestions([]);
                        router.push(`/patients/${p.patientId}`);
                      }}
                    >
                      <span className="font-semibold">{p.patientName}</span>
                      <span className="text-xs text-muted-foreground">
                        UHID: {p.registrationNumber} • {p.mobileNumber}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 relative print:p-0">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden print:hidden">
          <div
            className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent blur-3xl"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 grid gap-6 lg:grid-cols-3 print:block print:space-y-6">
          <div className="lg:col-span-2 space-y-6 print:block print:w-full print:space-y-6">
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">{patient.patientName}</CardTitle>
                      <CardDescription className="text-xs font-semibold">
                        {patient.gender} • {patient.age} Years • Blood: {patient.bloodGroup || "Unknown"}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 print:hidden">
                    {todayPrescription ? (
                      <Button
                        onClick={() => handleEditPrescription(todayPrescription)}
                        className="gap-1.5 bg-amber-600 hover:bg-amber-700"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Today's Prescription
                      </Button>
                    ) : (
                      <Button onClick={handleCreateNewPrescription} className="gap-1.5">
                        <Plus className="h-4 w-4" />
                        New Consultation
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                  <div className="p-3 bg-card rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground">Registration Date</p>
                    <p className="font-semibold mt-1">{registration?.registrationDate || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground">Last Visit Date</p>
                    <p className="font-semibold mt-1">{stats.lastVisitDate}</p>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground">Next Follow-Up</p>
                    <p className="font-semibold mt-1 text-primary">{stats.nextFollowUp}</p>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground">Total Encounters</p>
                    <p className="font-semibold mt-1">
                      {stats.totalConsults}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        Visits ({stats.totalPrescriptions} Rx)
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {alerts.length > 0 && (
              <div className="space-y-2 print:hidden">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                      alert.type === "danger"
                        ? "bg-red-500/10 border-red-500/30 text-red-700"
                        : alert.type === "warning"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-700"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-700"
                    }`}
                  >
                    {alert.type === "danger" ? (
                      <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                    ) : alert.type === "warning" ? (
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
                    )}

                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                    </div>
                    {alert.action === "edit-today" && (
                      <Button
                        size="sm"
                        variant="link"
                        className="text-amber-800 font-bold p-0 h-auto"
                        onClick={() => handleEditPrescription(todayPrescription)}
                      >
                        Edit Now
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Tabs defaultValue="consultations" className="w-full print:block">
              <TabsList className="grid grid-cols-3 w-full bg-muted/60 print:hidden">
                <TabsTrigger value="consultations">Consultations</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="timeline">Visit Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="consultations" className="mt-4 print:block">
                <Card>
                  <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">Encounter & Consultation History</CardTitle>
                      <CardDescription className="text-xs">Medical records indexed by doctor diagnostics</CardDescription>
                    </div>

                    <div className="flex items-center gap-2 print:hidden">
                      <Input
                        placeholder="Search diagnosis..."
                        value={consultationSearch}
                        onChange={(e) => {
                          setConsultationSearch(e.target.value);
                          setConsultationPage(1);
                        }}
                        className="w-40 h-8 text-xs"
                      />
                      {doctorsList.length > 0 && (
                        <select
                          value={consultationFilterDoctor}
                          onChange={(e) => {
                            setConsultationFilterDoctor(e.target.value);
                            setConsultationPage(1);
                          }}
                          className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm focus:outline-none"
                        >
                          <option value="all">All Doctors</option>
                          {doctorsList.map((doc) => (
                            <option key={doc} value={doc}>
                              {doc}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6 sm:pt-0">
                    {paginatedConsultations.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-sm">
                        No matching consultation visits found.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm text-left">
                          <thead>
                            <tr className="border-b bg-muted/20 text-xs font-semibold text-muted-foreground uppercase">
                              <th className="p-3">Visit Date</th>
                              <th className="p-3">Doctor</th>
                              <th className="p-3">Diagnosis</th>
                              <th className="p-3">Follow-Up Date</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedConsultations.map((item, idx) => {
                              const c = item.consultation || {};
                              return (
                                <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                                  <td className="p-3 font-medium">
                                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </td>
                                  <td className="p-3">{c.doctorName || "Dr. Rajesh Kumar"}</td>
                                  <td className="p-3">
                                    <Badge variant="outline" className="border-primary/20 text-primary">
                                      {c.diagnosisName || "Diagnosis Pending"}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    {c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : "None"}
                                  </td>
                                  <td className="p-3 text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs hover:text-primary"
                                      onClick={() => setPreviewPrescription(item)}
                                    >
                                      Full Record
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {filteredConsultations.length > itemsPerPage && (
                          <div className="flex items-center justify-between p-3 border-t print:hidden">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={consultationPage === 1}
                              onClick={() => setConsultationPage((p) => p - 1)}
                            >
                              Previous
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Page {consultationPage} of {Math.ceil(filteredConsultations.length / itemsPerPage)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={consultationPage >= Math.ceil(filteredConsultations.length / itemsPerPage)}
                              onClick={() => setConsultationPage((p) => p + 1)}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prescriptions" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Prescription Logs & Versions</CardTitle>
                    <CardDescription className="text-xs">Detailed audit history of prescription records</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6 sm:pt-0">
                    {history.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-sm">
                        No prescriptions documented yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm text-left">
                          <thead>
                            <tr className="border-b bg-muted/20 text-xs font-semibold text-muted-foreground uppercase">
                              <th className="p-3">Date</th>
                              <th className="p-3">Doctor</th>
                              <th className="p-3">Last Updated</th>
                              <th className="p-3">Auditing Doctor</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedPrescriptions.map((item, idx) => {
                              const c = item.consultation || {};
                              const hasUpdate =
                                new Date(item.updatedAt || item.createdAt).getTime() >
                                new Date(item.createdAt).getTime() + 60000;
                              return (
                                <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                                  <td className="p-3 font-medium">
                                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </td>
                                  <td className="p-3">{c.doctorName || "Dr. Rajesh Kumar"}</td>
                                  <td className="p-3 text-xs">
                                    {new Date(item.updatedAt || item.createdAt).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                    {hasUpdate && (
                                      <span className="ml-1 text-[10px] text-amber-600 bg-amber-500/10 px-1 rounded">
                                        Edited
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-xs text-muted-foreground">
                                    {item.updatedBy || c.doctorName || "Doctor"}
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs gap-1"
                                        disabled={printingPrescriptionId === item.prescriptionId}
                                        onClick={() => openPrescriptionPdf(item.prescriptionId)}
                                      >
                                        {printingPrescriptionId === item.prescriptionId ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <Printer className="h-3.5 w-3.5" />
                                        )}
                                        {printingPrescriptionId === item.prescriptionId ? "Printing..." : "Print"}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs gap-1"
                                        onClick={() => handleEditPrescription(item)}
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                        Edit
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {history.length > itemsPerPage && (
                          <div className="flex items-center justify-between p-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={prescriptionPage === 1}
                              onClick={() => setPrescriptionPage((p) => p - 1)}
                            >
                              Previous
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Page {prescriptionPage} of {Math.ceil(history.length / itemsPerPage)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={prescriptionPage >= Math.ceil(history.length / itemsPerPage)}
                              onClick={() => setPrescriptionPage((p) => p + 1)}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Visit & Event Timeline</CardTitle>
                    <CardDescription className="text-xs">
                      Chronological timeline of consultations and prescriptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    {history.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-sm">
                        No events recorded in patient journey yet.
                      </div>
                    ) : (
                      <div className="flow-root mt-2">
                        <ul className="-mb-8">
                          {history
                            .flatMap((item, idx) => {
                              const c = item.consultation || {};
                              const events = [];

                              const isEdited =
                                new Date(item.updatedAt || item.createdAt).getTime() >
                                new Date(item.createdAt).getTime() + 60000;
                              if (isEdited) {
                                events.push({
                                  date: item.updatedAt,
                                  type: "update",
                                  title: "Prescription Updated",
                                  desc: `Prescription ID RX-${item.prescriptionId} edited by ${
                                    item.updatedBy || c.doctorName || "Doctor"
                                  }.`,
                                  doctor: c.doctorName,
                                });
                              }

                              events.push({
                                date: item.createdAt,
                                type: "prescription",
                                title: "Prescription Generated",
                                desc: `Prescription created with ${item.medicines?.length || 0} medicines.`,
                                doctor: c.doctorName,
                              });

                              events.push({
                                date: c.createdAt || item.createdAt,
                                type: "consultation",
                                title: `Consultation Visit`,
                                desc: `Diagnosed with: ${c.diagnosisName || "Diagnosis Pending"}. Advice: ${
                                  c.advice || "None"
                                }.`,
                                doctor: c.doctorName,
                              });

                              if (idx === history.length - 1) {
                                events.push({
                                  date: patient.createdAt || c.createdAt || item.createdAt,
                                  type: "registration",
                                  title: "Patient Registration Created",
                                  desc: `Patient profile registered under Registration Number: ${
                                    registration?.registrationNumber || "N/A"
                                  }.`,
                                  doctor: "System",
                                });
                              }

                              return events;
                            })
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((event, idx, arr) => (
                              <li key={idx}>
                                <div className="relative pb-8">
                                  {idx !== arr.length - 1 && (
                                    <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                                  )}
                                  <div className="relative flex space-x-3">
                                    <div>
                                      <span
                                        className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-background ${
                                          event.type === "registration"
                                            ? "bg-blue-500/10 text-blue-600"
                                            : event.type === "consultation"
                                            ? "bg-green-500/10 text-green-600"
                                            : event.type === "prescription"
                                            ? "bg-purple-500/10 text-purple-600"
                                            : "bg-amber-500/10 text-amber-600"
                                        }`}
                                      >
                                        {event.type === "registration" && <User className="h-5 w-5" />}
                                        {event.type === "consultation" && <Activity className="h-5 w-5" />}
                                        {event.type === "prescription" && <FileText className="h-5 w-5" />}
                                        {event.type === "update" && <History className="h-5 w-5" />}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                                      <div>
                                        <p className="text-sm font-semibold text-foreground">{event.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{event.desc}</p>
                                        {event.doctor && event.doctor !== "System" && (
                                          <p className="text-[10px] text-muted-foreground mt-0.5">Doctor: {event.doctor}</p>
                                        )}
                                      </div>
                                      <div className="text-right text-xs whitespace-nowrap text-muted-foreground">
                                        {new Date(event.date).toLocaleDateString("en-IN", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                        <span className="block text-[10px] opacity-80">
                                          {new Date(event.date).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6 print:hidden">
            {latestConsultation ? (
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>Recent Consultation</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                      Latest
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Consulting Doctor</span>
                    <span className="font-semibold">{latestConsultation.doctorName || "Dr. Rajesh Kumar"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Date / Time</span>
                    <span className="font-medium text-xs">{new Date(latestConsultation.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Symptoms / Complaint</span>
                    <p className="font-medium text-xs bg-muted/40 p-2 rounded mt-1">
                      {latestConsultation.complaintName
                        ? `${latestConsultation.complaintName} (${latestConsultation.complaintFrequency || "N/A"})`
                        : "None recorded"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Diagnosis</span>
                    <p className="font-semibold text-xs text-primary mt-0.5">
                      {latestConsultation.diagnosisName || "Diagnosis Pending"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Advice</span>
                    <p className="text-xs text-muted-foreground italic mt-0.5 truncate">
                      {latestConsultation.advice || "No advice entered."}
                    </p>
                  </div>
                  <div className="pt-2 flex justify-between border-t text-xs">
                    <span className="text-muted-foreground">Follow-Up Date</span>
                    <span className="font-semibold text-primary">
                      {latestConsultation.followUpDate
                        ? new Date(latestConsultation.followUpDate).toLocaleDateString()
                        : "None scheduled"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed flex items-center justify-center p-6 text-center text-muted-foreground text-sm">
                No recent consultations.
              </Card>
            )}

            {latestPrescription ? (
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>Recent Prescription Preview</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                      Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Rx ID</span>
                    <span className="font-semibold">RX-{latestPrescription.prescriptionId}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Prescribed Date</span>
                    <span>{new Date(latestPrescription.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">
                      Medicines ({latestPrescription.medicines?.length || 0})
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {latestPrescription.medicines?.map((med: any, idx: number) => (
                        <div key={idx} className="p-2 bg-muted/40 rounded text-xs flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{med.medicineName}</p>
                            <p className="text-[10px] text-muted-foreground">{med.instruction}</p>
                          </div>
                          <span className="font-mono text-[10px] bg-background px-1.5 py-0.5 border rounded">
                            {med.strength || med.dosage} • {med.frequency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={printingPrescriptionId === latestPrescription.prescriptionId}
                      onClick={() => openPrescriptionPdf(latestPrescription.prescriptionId)}
                      className="text-xs gap-1 px-1"
                    >
                      {printingPrescriptionId === latestPrescription.prescriptionId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Printer className="h-3 w-3" />
                      )}
                      {printingPrescriptionId === latestPrescription.prescriptionId ? "Printing" : "Print"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPrescription(latestPrescription)}
                      className="text-xs gap-1 px-1"
                    >
                      <Edit className="h-3 w-3" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={printingPrescriptionId === latestPrescription.prescriptionId}
                      onClick={() => openPrescriptionPdf(latestPrescription.prescriptionId)}
                      className="text-xs gap-1 px-1"
                    >
                      {printingPrescriptionId === latestPrescription.prescriptionId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      {printingPrescriptionId === latestPrescription.prescriptionId ? "Printing" : "PDF"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed flex items-center justify-center p-6 text-center text-muted-foreground text-sm">
                No prescriptions recorded.
              </Card>
            )}

            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Doctor Quick Insights</CardTitle>
                <CardDescription className="text-[10px]">Patient clinical notes and history checks</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Allergies</span>
                  <div
                    className={`p-2 rounded text-xs font-semibold ${
                      patient.allergies && patient.allergies !== "None" && patient.allergies !== "N/A"
                        ? "bg-red-500/10 text-red-700 border border-red-500/20"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {patient.allergies || "No active allergies recorded"}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Chronic Diseases / Medical History</span>
                  <div className="p-2 bg-muted/40 rounded text-xs font-medium">
                    {patient.medicalHistory || "No chronic illnesses documented."}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Current Medications</span>
                  <div className="p-2 bg-muted/40 rounded text-xs font-medium">
                    {patient.currentMedications || "No ongoing medications recorded."}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Recent Diagnostic Reports</span>
                  <div className="p-2 bg-muted/40 rounded text-xs italic text-muted-foreground">
                    No lab investigation files uploaded.
                  </div>
                </div>
              </CardContent>
            </Card>

            {latestPrescription && (
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <History className="h-4 w-4 text-muted-foreground" />
                    Prescription Audit Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2.5">
                  <div>
                    <p className="text-muted-foreground">Created Date & Time</p>
                    <p className="font-semibold">{new Date(latestPrescription.createdAt).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Created By: {latestConsultation?.doctorName || "Dr. Rajesh Kumar"}
                    </p>
                  </div>

                  {new Date(latestPrescription.updatedAt || latestPrescription.createdAt).getTime() >
                    new Date(latestPrescription.createdAt).getTime() + 60000 && (
                    <div className="border-t pt-2">
                      <p className="text-amber-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Last Modified Date & Time
                      </p>
                      <p className="font-semibold text-amber-700 mt-0.5">
                        {new Date(latestPrescription.updatedAt).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Modified By: {latestPrescription.updatedBy || "Doctor"}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-2 flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>Audit Version</span>
                    <span className="font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                      v{new Date(latestPrescription.updatedAt || latestPrescription.createdAt).getTime() >
                      new Date(latestPrescription.createdAt).getTime() + 60000
                        ? "2.0"
                        : "1.0"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {previewPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden overflow-y-auto animate-fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b bg-slate-950 px-6 py-4 text-white">
              <div>
                <h3 className="font-bold">Prescription Details</h3>
                <p className="text-xs text-slate-300">
                  RX-{previewPrescription.prescriptionId} • {formatDateTime(previewPrescription.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  disabled={printingPrescriptionId === previewPrescription.prescriptionId}
                  onClick={() => openPrescriptionPdf(previewPrescription.prescriptionId)}
                >
                  {printingPrescriptionId === previewPrescription.prescriptionId ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Printer className="h-3.5 w-3.5" />
                  )}
                  {printingPrescriptionId === previewPrescription.prescriptionId ? "Printing..." : "Print"}
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setPreviewPrescription(null)}
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-5">
              {(() => {
                const detail = previewPrescription;
                const c = detail.consultation || {};
                const complaints = c.complaints?.length
                  ? c.complaints
                  : c.complaintName
                  ? [c]
                  : [];
                const diagnoses = c.diagnoses?.length
                  ? c.diagnoses
                  : c.diagnosisName
                  ? [c]
                  : [];
                const histories = c.pastMedicalHistories?.length
                  ? c.pastMedicalHistories
                  : c.medicalHistory || c.allergies || c.currentMedicine
                  ? [c]
                  : [];
                const vitals = [
                  c.height ? ["Height", `${c.height} cm`] : null,
                  c.weight ? ["Weight", `${c.weight} kg`] : null,
                  c.temperature ? ["Temperature", `${c.temperature} °F`] : null,
                  c.pulse ? ["Pulse", `${c.pulse} bpm`] : null,
                  c.spo2 ? ["SpO2", `${c.spo2}%`] : null,
                  c.bp ? ["BP", c.bp] : null,
                  c.respiratoryRate ? ["Resp. Rate", String(c.respiratoryRate)] : null,
                ].filter(Boolean) as string[][];

                const Section = ({
                  title,
                  children,
                }: {
                  title: string;
                  children: React.ReactNode;
                }) => (
                  <section className="rounded-lg border bg-white p-4 shadow-sm">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h4>
                    {children}
                  </section>
                );

                const Empty = ({ label }: { label: string }) => (
                  <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">{label}</p>
                );

                return (
                  <div className="space-y-4 text-slate-900">
                    <section className="rounded-lg border bg-white p-4 shadow-sm">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">Patient</p>
                          <p className="mt-1 font-semibold">{patient?.patientName || c.patientName || "Patient"}</p>
                          <p className="text-sm text-slate-600">
                            {[patient?.gender || c.gender, patient?.age || c.age ? `${patient?.age || c.age} yrs` : null]
                              .filter(Boolean)
                              .join(" • ") || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">Doctor</p>
                          <p className="mt-1 font-semibold">{c.doctorName || "N/A"}</p>
                          <p className="text-sm text-slate-600">
                            {[c.qualification, c.specialization, c.doctorCode].filter(Boolean).join(" • ") || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">Visit</p>
                          <p className="mt-1 font-semibold">{formatDateTime(detail.createdAt)}</p>
                          <p className="text-sm text-slate-600">Follow-up: {formatDate(c.followUpDate)}</p>
                        </div>
                      </div>
                    </section>

                    <Section title="Vitals">
                      {vitals.length ? (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {vitals.map(([label, value]) => (
                            <div key={label} className="rounded-md bg-slate-50 px-3 py-2">
                              <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
                              <p className="text-sm font-semibold">{value}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Empty label="No vitals recorded." />
                      )}
                    </Section>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Section title="Chief Complaints">
                        {complaints.length ? (
                          <ul className="space-y-2 text-sm">
                            {complaints.map((item: any, index: number) => (
                              <li key={index} className="rounded-md bg-slate-50 px-3 py-2">
                                <span className="font-medium">{item.complaintName}</span>
                                <span className="text-slate-600">
                                  {" "}
                                  {[item.complaintFrequency, item.severity, item.complaintDuration]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Empty label="No complaints recorded." />
                        )}
                      </Section>

                      <Section title="Clinical Findings">
                        {c.generalExaminations?.length ? (
                          <ul className="space-y-2 text-sm">
                            {c.generalExaminations.map((item: string, index: number) => (
                              <li key={index} className="rounded-md bg-slate-50 px-3 py-2">
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Empty label="No clinical findings recorded." />
                        )}
                      </Section>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Section title="Past History">
                        {histories.length ? (
                          <ul className="space-y-2 text-sm">
                            {histories.map((item: any, index: number) => (
                              <li key={index} className="rounded-md bg-slate-50 px-3 py-2">
                                {item.allergies && <p>Allergies: {item.allergies}</p>}
                                {item.currentMedicine && <p>Current medicine: {item.currentMedicine}</p>}
                                {item.medicalHistory && <p>Medical history: {item.medicalHistory}</p>}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Empty label="No past history recorded." />
                        )}
                      </Section>

                      <Section title="Diagnosis">
                        {diagnoses.length ? (
                          <ul className="space-y-2 text-sm">
                            {diagnoses.map((item: any, index: number) => (
                              <li key={index} className="rounded-md bg-slate-50 px-3 py-2">
                                <span className="font-medium">{item.diagnosisName}</span>
                                <span className="text-slate-600">
                                  {" "}
                                  {[item.diagnosisCode, item.diagnosisDuration].filter(Boolean).join(" • ")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Empty label="No diagnosis recorded." />
                        )}
                      </Section>
                    </div>

                    <Section title="Medicines">
                      {detail.medicines?.length ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="border-b text-xs uppercase text-slate-500">
                              <tr>
                                <th className="py-2 pr-3">Medicine</th>
                                <th className="py-2 pr-3">Dose</th>
                                <th className="py-2 pr-3">Frequency</th>
                                <th className="py-2 pr-3">Duration</th>
                                <th className="py-2 pr-3">Instructions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detail.medicines.map((med: any, index: number) => (
                                <tr key={med.prescriptionMedicineId || index} className="border-b last:border-0">
                                  <td className="py-2 pr-3 font-medium">{med.medicineName || "N/A"}</td>
                                  <td className="py-2 pr-3">{med.dosage || med.strength || "N/A"}</td>
                                  <td className="py-2 pr-3">{med.frequency || "N/A"}</td>
                                  <td className="py-2 pr-3">{med.duration || "N/A"}</td>
                                  <td className="py-2 pr-3">{med.instruction || "N/A"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <Empty label="No medicines recorded." />
                      )}
                    </Section>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Section title="Investigations / Tests">
                        {detail.investigations?.length || detail.diagnostics?.length || detail.testRequested?.length ? (
                          <ul className="space-y-2 text-sm">
                            {[...(detail.investigations || []), ...(detail.diagnostics || []), ...(detail.testRequested || [])].map(
                              (item: any, index: number) => (
                                <li key={index} className="rounded-md bg-slate-50 px-3 py-2">
                                  {item.investigationName || item.testName || item.diagnosticName || "Investigation"}
                                  {item.notes ? <span className="text-slate-600"> • {item.notes}</span> : null}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <Empty label="No investigations or tests recorded." />
                        )}
                      </Section>

                      <Section title="Advice / Notes">
                        {c.advice || detail.notes ? (
                          <div className="space-y-2 text-sm">
                            {c.advice && <p className="rounded-md bg-slate-50 px-3 py-2">{c.advice}</p>}
                            {detail.notes && <p className="rounded-md bg-slate-50 px-3 py-2">{detail.notes}</p>}
                          </div>
                        ) : (
                          <Empty label="No advice or notes recorded." />
                        )}
                      </Section>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
