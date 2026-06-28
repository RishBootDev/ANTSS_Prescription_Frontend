import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Syringe,
  Bell,
  CalendarCheck,
  AlertCircle,
  CalendarRange,
  Clock,
  CheckCircle,
  Stethoscope,
  Pill,
} from "lucide-react";
import { useAuthStore } from "@/src/store/authStore";
import { usePatientStore } from "@/src/store/patientStore";
import { usePrescriptionStore } from "@/src/store/prescriptionStore";
import { PatientData } from "../types";
import { prescriptionService } from "@/src/services/prescription.service";
import { patientService } from "@/src/services/patient.service";

import PatientRegistrationModal from "../components/PatientRegistrationModal";
import PatientTable from "../components/PatientTable";
import PatientStats from "../components/PatientStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, initialize, logout } = useAuthStore();
  const { patients, consultations, fetchPatients, loading } = usePatientStore();
  const { savePrescription } = usePrescriptionStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("patients");
  const [followUpFilter, setFollowUpFilter] = useState<string>("all");
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const fetchData = async () => {
    try {
      await fetchPatients();
    } catch (err) {
      console.error("Failed to load patients", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    if (pathname === '/patients') {
      fetchData();
    }

    // Listen to global route change event to refetch when restoring from Next.js cache
    const handleRouteChange = (e: any) => {
      if (e.detail === '/patients') {
        fetchData();
      }
    };

    window.addEventListener('app-route-change', handleRouteChange);
    return () => window.removeEventListener('app-route-change', handleRouteChange);
  }, [pathname]);

  const handlePatientRegistered = (newPatient: PatientData) => {
    fetchData();
  };

  const handleConsult = (patient: PatientData) => {
    localStorage.setItem("currentConsultationPatient", JSON.stringify(patient));
    router.push("/consultation");
  };

  const handleProfile = (patient: PatientData) => {
    router.push(`/patients/${patient.id}`);
  };

  const triggerNotification = (name: string, phone: string) => {
    setNotificationToast(`Reminder SMS queued successfully for ${name} (${phone})`);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  const mappedPatients: PatientData[] = useMemo(() => {
    return patients.map((p: any) => {
      return {
        id: String(p.patientId),
        registrationId: p.registrationId || undefined,
        registrationNumber: p.registrationNumber || (p.mobileNumber ? `REG-${p.mobileNumber.slice(-6)}` : "REG-N/A"),
        name: p.patientName,
        age: p.age,
        gender: p.gender,
        contactNumber: p.mobileNumber,
        localAddress: p.address,
        state: p.state,
        district: p.city,
        pincode: p.pincode,
        visitDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : null,
        weight: null,
        height: null,
        bloodPressureSystolic: null,
        bloodPressureDiastolic: null,
        pulse: null,
        temperature: null,
        oxygenSaturation: null,
        bloodGroup: p.bloodGroup || null,
        lmp: null,
        dateOfBirth: p.dateOfBirth || null,
        allergies: p.allergies || null,
        currentMedications: p.currentMedications || null,
        chiefComplaint: null,
        symptoms: null,
        medicalHistory: p.medicalHistory || null,
        quickNotes: null,
        complaints: [],
        generalExamination: null,
        diagnoses: [],
        advice: null,
        testsRequested: null,
        nextVisit: null,
        investigations: null,
        payment: null,
        followUp: null,
        emergencyContact: null,
        insuranceId: null,
        medicines: [],
      };
    });
  }, [patients]);

  const followUps = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const list: any[] = [];

    consultations.forEach((c) => {
      if (!c.followUpDate) return;

      const followUpDate = new Date(c.followUpDate);
      followUpDate.setHours(0, 0, 0, 0);
      const followUpTime = followUpDate.getTime();

      const patientId = c.patientId;
      const pInfo = mappedPatients.find((p) => p.id === String(patientId));

      const patientName = pInfo?.name || c.patientName || "Unknown Patient";
      const contactNumber = pInfo?.contactNumber || c.mobileNumber || "N/A";
      const diagnosis = c.diagnosisName || "Diagnosis Pending";

      const subsequentVisits = consultations.filter((otherC) => {
        if (String(otherC.patientId) !== String(patientId)) return false;

        const otherVisitDate = new Date(otherC.createdAt);
        return otherVisitDate.getTime() > new Date(c.followUpDate).getTime();
      });

      const hasVisitedSinceThen = subsequentVisits.length > 0;

      let status = "upcoming";
      if (followUpTime === todayTime) {
        status = "today";
      } else if (followUpTime < todayTime) {
        status = hasVisitedSinceThen ? "completed" : "missed";
      }

      list.push({
        id: c.consultationId,
        patientId,
        patientName,
        contactNumber,
        doctorName: c.doctorName || "Dr. Rajesh Kumar",
        diagnosis,
        followUpDate: c.followUpDate,
        formattedDate: new Date(c.followUpDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        status,
        patientObj: pInfo,
      });
    });

    return list.sort((a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime());
  }, [consultations, mappedPatients]);

  const followUpStats = useMemo(() => {
    const todayCount = followUps.filter((f) => f.status === "today").length;
    const missedCount = followUps.filter((f) => f.status === "missed").length;
    const upcomingCount = followUps.filter((f) => f.status === "upcoming").length;
    return { todayCount, missedCount, upcomingCount };
  }, [followUps]);

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((f) => {
      const matchesSearch =
        !searchQuery ||
        f.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.contactNumber.includes(searchQuery);

      const matchesStatus = followUpFilter === "all" || f.status === followUpFilter;

      return matchesSearch && matchesStatus;
    });
  }, [followUps, searchQuery, followUpFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Syringe className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Compounder AI</h1>
              <p className="text-xs text-muted-foreground">Patient Management System</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/patients" className="text-sm font-medium text-primary">
              Patients
            </Link>
            <Link href="/medicine-master" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Medicine Master
            </Link>
            <Link href="/doctor/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
            <button
              onClick={() => logout()}
              className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {notificationToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl animate-bounce">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{notificationToast}</span>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 relative">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-[url('/doctor-bg.png')] bg-no-repeat bg-[length:700px_700px] bg-[position:45%_18%] opacity-30 blur-4xl"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Clinic Directory
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage registrations and view schedule follow-ups
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push("/medicine-master")} className="gap-2">
                <Pill className="h-4 w-4" />
                Medicine Master
              </Button>
              <PatientRegistrationModal onPatientRegistered={handlePatientRegistered} />
            </div>
          </div>

          <Tabs defaultValue="patients" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md bg-muted/60 mb-6">
              <TabsTrigger value="patients" className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Patient List
              </TabsTrigger>
              <TabsTrigger value="followups" className="flex items-center gap-1.5">
                <CalendarCheck className="h-4 w-4" />
                Follow-Up Manager
                {followUpStats.todayCount + followUpStats.missedCount > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0 h-5 text-[10px] font-bold">
                    {followUpStats.todayCount + followUpStats.missedCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patients" className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, Reg Number, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4"
                  />
                </div>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <PatientTable
                patients={mappedPatients}
                searchQuery={searchQuery}
                genderFilter={genderFilter}
                isLoading={loading}
                onConsult={handleConsult}
                onProfile={handleProfile}
              />

              <PatientStats patients={mappedPatients} />
            </TabsContent>

            <TabsContent value="followups" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-500/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between text-red-700">
                      <span>Missed / Overdue</span>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-extrabold text-red-700">{followUpStats.missedCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Patients with overdue schedules</p>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between text-amber-700">
                      <span>Today's Follow-Ups</span>
                      <Clock className="h-5 w-5 text-amber-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-extrabold text-amber-700">{followUpStats.todayCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Patients due for consultations today</p>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between text-blue-700">
                      <span>Upcoming Follow-Ups</span>
                      <CalendarRange className="h-5 w-5 text-blue-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-extrabold text-blue-700">{followUpStats.upcomingCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Future follow-up appointments</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4"
                  />
                </div>
                <Select value={followUpFilter} onValueChange={setFollowUpFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Follow-Ups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schedules</SelectItem>
                    <SelectItem value="today">Due Today</SelectItem>
                    <SelectItem value="missed">Missed / Overdue</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-6 space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-8 w-[250px]" />
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-8 w-[150px]" />
                          <Skeleton className="h-8 w-32" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : filteredFollowUps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <CalendarCheck className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No follow-ups found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your filters or search keywords.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm text-left">
                        <thead>
                          <tr className="border-b bg-muted/20 text-xs font-semibold text-muted-foreground uppercase">
                            <th className="p-3">Patient Name</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Doctor</th>
                            <th className="p-3">Last Diagnosis</th>
                            <th className="p-3">Follow-Up Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFollowUps.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-3 font-semibold text-primary">
                                <div
                                  className="cursor-pointer hover:underline"
                                  onClick={() => item.patientId && router.push(`/patients/${item.patientId}`)}
                                >
                                  {item.patientName}
                                </div>
                              </td>
                              <td className="p-3 font-mono">{item.contactNumber}</td>
                              <td className="p-3">{item.doctorName}</td>
                              <td className="p-3">
                                <Badge variant="outline" className="border-primary/20 text-primary text-[11px]">
                                  {item.diagnosis}
                                </Badge>
                              </td>
                              <td className="p-3 font-medium">{item.formattedDate}</td>
                              <td className="p-3">
                                <Badge
                                  variant="default"
                                  className={`text-xs ${
                                    item.status === "missed"
                                      ? "bg-red-500/10 text-red-700 hover:bg-red-500/20"
                                      : item.status === "today"
                                      ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                                      : "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20"
                                  }`}
                                >
                                  {item.status === "missed"
                                    ? "Overdue"
                                    : item.status === "today"
                                    ? "Due Today"
                                    : "Upcoming"}
                                </Badge>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => triggerNotification(item.patientName, item.contactNumber)}
                                    className="gap-1.5 text-xs h-8"
                                  >
                                    <Bell className="h-3.5 w-3.5" />
                                    Remind
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => item.patientObj && handleConsult(item.patientObj)}
                                    className="gap-1.5 text-xs h-8"
                                  >
                                    <Stethoscope className="h-3.5 w-3.5" />
                                    Consult
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
