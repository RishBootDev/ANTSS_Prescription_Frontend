import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Calendar, Activity, Thermometer, Heart, AlertTriangle } from "lucide-react";
import { PatientData } from "@/components/patient-form";

interface PatientInfoCardProps {
  patientData: PatientData;
  prescriptionHistoryLength: number;
}

export function PatientInfoCard({ patientData, prescriptionHistoryLength }: PatientInfoCardProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Patient Information
          </div>
          {prescriptionHistoryLength > 0 && (
            <Badge variant="default" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
              Total Past Visits: {prescriptionHistoryLength}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  {patientData.name || "N/A"}
                  {patientData.registrationNumber && (
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">
                      {patientData.registrationNumber}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {patientData.age ? `${patientData.age} years` : ""} {patientData.gender ? `• ${patientData.gender}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Contact:</span>
              <span>{patientData.contactNumber || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Visit:</span>
              <span>{patientData.visitDate || "N/A"}</span>
            </div>
          </div>

          <div className="space-y-1">
            {patientData.bloodPressureSystolic && patientData.bloodPressureDiastolic && (
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">BP:</span>
                <span className="font-medium">
                  {patientData.bloodPressureSystolic}/{patientData.bloodPressureDiastolic} mmHg
                </span>
              </div>
            )}
            {patientData.pulse && (
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Pulse:</span>
                <span className="font-medium">{patientData.pulse} bpm</span>
              </div>
            )}
            {patientData.temperature && (
              <div className="flex items-center gap-2 text-sm">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Temp:</span>
                <span className="font-medium">{patientData.temperature}°F</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            {patientData.oxygenSaturation && (
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">SpO2:</span>
                <span className="font-medium">{patientData.oxygenSaturation}%</span>
              </div>
            )}
          </div>
        </div>

        {patientData.allergies && patientData.allergies !== "None" && patientData.allergies !== "N/A" && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">
              <strong>Allergies:</strong> {patientData.allergies}
            </span>
          </div>
        )}

        <Separator className="my-3" />

        <div className="grid gap-2 md:grid-cols-3 text-sm">
          {patientData.chiefComplaint && (
            <div>
              <span className="text-muted-foreground">Chief Complaint: </span>
              <span className="font-medium">{patientData.chiefComplaint}</span>
            </div>
          )}
          {patientData.medicalHistory && (
            <div>
              <span className="text-muted-foreground">Medical History: </span>
              <span className="font-medium">{patientData.medicalHistory}</span>
            </div>
          )}
          {patientData.currentMedications && (
            <div>
              <span className="text-muted-foreground">Current Medications: </span>
              <span className="font-medium">{patientData.currentMedications}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
export default PatientInfoCard;
