import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  CalendarDays,
  User,
  Stethoscope,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { appointmentService, Appointment } from "@/src/services/appointment.service";
import { patientService } from "@/src/services/patient.service";
import { useAuthStore } from "@/src/store/authStore";

export default function AppointmentPage() {
  const router = useRouter();
  const { isAuthenticated, initialize } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
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

  // Form states for booking
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [doctorName, setDoctorName] = useState("Dr. Rajesh Kumar");
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");

  // Edit / Reschedule state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDateTime, setNewDateTime] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const appts = await appointmentService.getAppointments();
        setAppointments(appts);

        const pats = await patientService.getAllPatients();
        setPatients(pats);
        if (pats.length > 0) {
          setSelectedPatientId(String(pats[0].patientId));
        }
      } catch (e) {
        console.error("Failed to load appointments", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !dateTime) {
      toast.error("Please select a patient and select a valid date/time.");
      return;
    }

    const patientObj = patients.find((p) => String(p.patientId) === String(selectedPatientId));
    if (!patientObj) {
      toast.error("Selected patient details could not be found.");
      return;
    }

    try {
      const payload = {
        patientId: String(selectedPatientId),
        patientName: patientObj.patientName,
        doctorName,
        dateTime,
        notes,
      };

      const newAppt = await appointmentService.bookAppointment(payload);
      setAppointments((prev) => [...prev, newAppt]);
      setDateTime("");
      setNotes("");
      toast.success("Appointment booked successfully!");
    } catch (err) {
      toast.error("Failed to book appointment.");
    }
  };

  const handleReschedule = async (id: string) => {
    if (!newDateTime) {
      toast.error("Please enter a new date and time.");
      return;
    }
    try {
      const updated = await appointmentService.rescheduleAppointment(id, newDateTime);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setReschedulingId(null);
      setNewDateTime("");
      toast.success("Appointment rescheduled successfully!");
    } catch (err) {
      toast.error("Failed to reschedule appointment.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const updated = await appointmentService.cancelAppointment(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success("Appointment cancelled successfully!");
    } catch (err) {
      toast.error("Failed to cancel appointment.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin text-primary text-4xl mb-4">⏳</div>
        <p className="text-muted-foreground font-medium">Loading Appointment Scheduler...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/doctor"
              className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                Appointment Scheduler
              </h1>
              <p className="text-xs text-muted-foreground">Manage OPD Consultation Slots</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6 grid gap-8 lg:grid-cols-3">
        {/* Left column: Appointment List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Scheduled OPD Visits ({appointments.filter((a) => a.status !== "Cancelled").length})
          </h2>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="border-dashed flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <AlertTriangle className="h-10 w-10 text-muted-foreground/60 mb-2" />
                <p className="text-sm">No appointments scheduled.</p>
              </Card>
            ) : (
              appointments.map((appt) => (
                <Card key={appt.id} className={`border-l-4 ${
                  appt.status === "Cancelled"
                    ? "border-l-red-500 bg-red-500/5"
                    : appt.status === "Rescheduled"
                    ? "border-l-amber-500"
                    : "border-l-primary"
                }`}>
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-primary">
                          {new Date(appt.dateTime).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            appt.status === "Booked"
                              ? "bg-blue-500/5 text-blue-600 border-blue-500/20 text-[10px]"
                              : appt.status === "Rescheduled"
                              ? "bg-amber-500/5 text-amber-600 border-amber-500/20 text-[10px]"
                              : "bg-red-500/5 text-red-600 border-red-500/20 text-[10px]"
                          }
                        >
                          {appt.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-base flex items-center gap-1.5">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {appt.patientName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Doctor: {appt.doctorName} {appt.notes && `• Note: ${appt.notes}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {reschedulingId === appt.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="datetime-local"
                            value={newDateTime}
                            onChange={(e) => setNewDateTime(e.target.value)}
                            className="h-8 text-xs w-44"
                          />
                          <Button size="sm" onClick={() => handleReschedule(appt.id)} className="h-8 text-xs bg-green-600 hover:bg-green-700">
                            Confirm
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setReschedulingId(null)} className="h-8 text-xs">
                            Cancel
                          </Button>
                        </div>
                      ) : appt.status !== "Cancelled" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReschedulingId(appt.id);
                              setNewDateTime(appt.dateTime.slice(0, 16));
                            }}
                            className="h-8 text-xs gap-1 border-primary/20"
                          >
                            <Edit2 className="h-3 w-3" /> Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancel(appt.id)}
                            className="h-8 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-500/5"
                          >
                            <Trash2 className="h-3 w-3" /> Cancel
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right column: Book New Appointment Form */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Book OPD Slot
          </h2>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Scheduler Form</CardTitle>
              <CardDescription className="text-xs">Schedule clinical OPD sessions for registered patients</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBook} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Select Patient</label>
                  {patients.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No registered patients found. Please add a patient first.</p>
                  ) : (
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none"
                    >
                      {patients.map((p) => (
                        <option key={p.patientId} value={String(p.patientId)}>
                          {p.patientName} (UHID: {p.registrationNumber || `REG-${p.patientId}`})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Assigned Practitioner</label>
                  <select
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none"
                  >
                    <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar (General Physician)</option>
                    <option value="Dr. Ananya Sen">Dr. Ananya Sen (Pediatrician)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Appointment Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Chief Symptoms / Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any complaints or visit symptoms..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none min-h-[80px]"
                  />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={patients.length === 0}>
                  Confirm OPD Booking
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
