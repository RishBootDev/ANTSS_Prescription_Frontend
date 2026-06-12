export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  dateTime: string;
  status: "Booked" | "Rescheduled" | "Cancelled";
  notes?: string;
}

export const appointmentService = {
  getAppointments: async (): Promise<Appointment[]> => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("appointments");
    if (!stored) {
      const initial: Appointment[] = [
        {
          id: "appt-1",
          patientId: "1",
          patientName: "Aarav Sharma",
          doctorName: "Dr. Rajesh Kumar",
          dateTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
          status: "Booked",
          notes: "Routine follow-up.",
        },
        {
          id: "appt-2",
          patientId: "2",
          patientName: "Meera Patel",
          doctorName: "Dr. Rajesh Kumar",
          dateTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          status: "Booked",
          notes: "Consultation on symptoms.",
        },
      ];
      localStorage.setItem("appointments", JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(stored);
  },

  bookAppointment: async (appointment: Omit<Appointment, "id" | "status">): Promise<Appointment> => {
    const list = await appointmentService.getAppointments();
    const newAppt: Appointment = {
      ...appointment,
      id: `appt-${Date.now()}`,
      status: "Booked",
    };
    list.push(newAppt);
    localStorage.setItem("appointments", JSON.stringify(list));
    return newAppt;
  },

  rescheduleAppointment: async (id: string, dateTime: string): Promise<Appointment> => {
    const list = await appointmentService.getAppointments();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Appointment not found");
    list[index].dateTime = dateTime;
    list[index].status = "Rescheduled";
    localStorage.setItem("appointments", JSON.stringify(list));
    return list[index];
  },

  cancelAppointment: async (id: string): Promise<Appointment> => {
    const list = await appointmentService.getAppointments();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Appointment not found");
    list[index].status = "Cancelled";
    localStorage.setItem("appointments", JSON.stringify(list));
    return list[index];
  },
};
