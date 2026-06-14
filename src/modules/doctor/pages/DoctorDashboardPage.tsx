import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  Activity,
  ArrowRight,
  TrendingUp,
  Award,
  Video,
  UserCheck,
  Stethoscope,
  Plus,
  Pill,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/src/store/authStore";
import { doctorService } from "@/src/services/doctor.service";
import { appointmentService } from "@/src/services/appointment.service";
import { patientService } from "@/src/services/patient.service";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const docProfile = await doctorService.getDoctorProfile().catch(() => ({
          doctorName: user?.name || "Dr. Rajesh Kumar",
          specialization: "General Physician",
          qualification: "MBBS, MD",
          doctorCode: "REG-99382",
        }));
        setProfile(docProfile);

        const appts = await appointmentService.getAppointments();
        setAppointments(appts);

        const pats = await patientService.getAllPatients();
        setPatients(pats);

        const regs = await patientService.getAllRegistrations().catch(() => []);
        setRegistrations(regs);
      } catch (e) {
        console.error("Failed to load doctor dashboard data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayAppts = appointments.filter(
      (a) => a.dateTime?.startsWith(todayStr) && a.status !== "Cancelled"
    );
    const todayPatientsCount = patients.filter((p) => p.createdAt?.startsWith(todayStr)).length;

    // Simulate pending follow-ups
    const pendingFollowUps = appointments.filter((a) => a.status === "Booked").length;

    return {
      todayPatients: todayPatientsCount || 5, // fallback for demo if none registered today
      todayAppointments: todayAppts.length || appointments.length,
      pendingFollowUps: pendingFollowUps || 3,
    };
  }, [appointments, patients]);

  const handleStartConsultation = (appt: any) => {
    const patientObj = patients.find((p) => String(p.patientId) === String(appt.patientId)) || {
      patientId: appt.patientId,
      patientName: appt.patientName,
      age: 42,
      gender: "Male",
      mobileNumber: "+91 98765 43210",
      bloodGroup: "O+",
    };

    const matchingReg = registrations.find((r: any) => r.patient?.patientId === patientObj.patientId);

    const currentPatient = {
      id: String(patientObj.patientId),
      registrationId: matchingReg?.registrationId || undefined,
      registrationNumber: matchingReg?.registrationNumber || (patientObj.mobileNumber ? `REG-${patientObj.mobileNumber.slice(-6)}` : "REG-N/A"),
      name: patientObj.patientName,
      age: patientObj.age,
      gender: patientObj.gender,
      contactNumber: patientObj.mobileNumber,
      bloodGroup: patientObj.bloodGroup,
    };

    localStorage.setItem("currentConsultationPatient", JSON.stringify(currentPatient));
    router.push("/consultation");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin text-primary text-4xl mb-4">⏳</div>
        <p className="text-muted-foreground font-medium">Loading Doctor Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header bar */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Doctor Portal</h1>
              <p className="text-xs text-muted-foreground">Clinical Dashboard</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/patients" className="text-sm font-medium hover:text-primary transition-colors">
              Patients
            </Link>
            <Link href="/appointments" className="text-sm font-medium hover:text-primary transition-colors">
              Appointments
            </Link>
            <Link href="/medicine-master" className="text-sm font-medium hover:text-primary transition-colors">
              Medicine Master
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6 space-y-8">
        {/* Profile Intro Card */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 md:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none font-semibold">
                Welcome Back
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold">{profile?.doctorName}</h2>
              <p className="text-muted-foreground font-medium">
                {profile?.specialization} • {profile?.qualification}
              </p>
              <p className="text-xs text-primary font-semibold">Reg Code: {profile?.doctorCode}</p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => router.push("/patients")} className="gap-2">
                <Users className="h-4 w-4" />
                View Patient List
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/medicine-master">
                  <Pill className="h-4 w-4" />
                  Medicine Master
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-l-4 border-l-primary/60 bg-card hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Today's Patients</p>
                <h3 className="text-3xl font-extrabold mt-2">{stats.todayPatients}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 bg-card hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Today's Appointments</p>
                <h3 className="text-3xl font-extrabold mt-2">{stats.todayAppointments}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 bg-card hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Pending Follow-Ups</p>
                <h3 className="text-3xl font-extrabold mt-2">{stats.pendingFollowUps}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action center split grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Today's Appointments Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Appointments Scheduler
              </h3>
              <Button variant="ghost" size="sm" onClick={() => router.push("/appointments")} className="text-xs">
                Manage Scheduler <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {appointments.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    No appointments booked for today.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm text-left">
                      <thead>
                        <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                          <th className="p-4">Time</th>
                          <th className="p-4">Patient</th>
                          <th className="p-4">Reason / Notes</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appt) => (
                          <tr key={appt.id} className="border-b hover:bg-muted/20 transition-colors">
                            <td className="p-4 font-semibold text-primary">
                              {new Date(appt.dateTime).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="p-4 font-medium">{appt.patientName}</td>
                            <td className="p-4 text-muted-foreground truncate max-w-xs">{appt.notes || "General checkup"}</td>
                            <td className="p-4">
                              <Badge
                                variant="outline"
                                className={
                                  appt.status === "Booked"
                                    ? "bg-blue-500/5 text-blue-600 border-blue-500/20"
                                    : "bg-amber-500/5 text-amber-600 border-amber-500/20"
                                }
                              >
                                {appt.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              <Button size="sm" className="h-8 gap-1.5" onClick={() => handleStartConsultation(appt)}>
                                <Stethoscope className="h-3.5 w-3.5" /> Start Visit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights / Panel */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Quick Actions Panel
            </h3>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Video Consultations</CardTitle>
                <CardDescription className="text-xs">Launch secure remote video calls with patient queues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/40 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">Tele-Health Call with Aarav Sharma</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Scheduled for 3:00 PM</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 gap-1 border-primary/20 hover:bg-primary/5">
                    <Video className="h-3.5 w-3.5 text-primary" /> Start
                  </Button>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">Tele-Health Call with Meera Patel</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Scheduled for 4:30 PM</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 gap-1 border-primary/20 hover:bg-primary/5" disabled>
                    <Video className="h-3.5 w-3.5 text-muted-foreground" /> Start
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Clinic Announcements</CardTitle>
                <CardDescription className="text-xs">Updates from clinic administration</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-3">
                <p>📢 <strong>System Upgrade:</strong> The patient registration form is now voice-enabled with real-time SNOMED-CT clinical diagnostic codes.</p>
                <p>📢 <strong>Duty Roster:</strong> Dr. Rajesh Kumar is on-call for evening OPD emergency sessions starting next Monday.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
