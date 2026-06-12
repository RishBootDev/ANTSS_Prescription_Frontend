import { Card, CardContent } from "@/components/ui/card";
import { Users, User, Stethoscope } from "lucide-react";
import { PatientData } from "../types";

export default function PatientStats({ patients }: { patients: PatientData[] }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{patients.length}</p>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {patients.filter((p) => p.gender === "Male").length}
              </p>
              <p className="text-sm text-muted-foreground">Male Patients</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <User className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {patients.filter((p) => p.gender === "Female").length}
              </p>
              <p className="text-sm text-muted-foreground">Female Patients</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {
                  patients.filter(
                    (p) => p.visitDate === new Date().toISOString().split("T")[0]
                  ).length
                }
              </p>
              <p className="text-sm text-muted-foreground">Today's Visits</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
