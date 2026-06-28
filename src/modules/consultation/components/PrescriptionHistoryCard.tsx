import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Eye } from "lucide-react";

interface PrescriptionHistoryCardProps {
  prescriptionHistory: any[];
  viewingPrescriptionId: number | null;
  handleLoadPrescription: (prescription: any) => void;
  handleReset: () => void;
}

export function PrescriptionHistoryCard({
  prescriptionHistory,
  viewingPrescriptionId,
  handleLoadPrescription,
  handleReset,
}: PrescriptionHistoryCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-xl bg-white flex flex-col overflow-hidden pointer-events-auto">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            Prescription History
          </div>
          {viewingPrescriptionId && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
              onClick={handleReset}
            >
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-[300px] p-4">
        {prescriptionHistory.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">No prescription history found.</div>
        ) : (
          <div className="space-y-3">
            {prescriptionHistory.map((item) => (
              <div
                key={item.prescriptionId}
                onClick={() => handleLoadPrescription(item)}
                className={`p-3 rounded-lg border text-sm transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                  viewingPrescriptionId === item.prescriptionId ? "border-sky-500 bg-sky-50/50" : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-xs">
                      {item.consultation?.consultationNumber || `Prescription #${item.prescriptionId}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 transition-colors ${
                        viewingPrescriptionId === item.prescriptionId 
                          ? "text-sky-600 bg-sky-100" 
                          : "text-slate-400 group-hover:text-sky-600"
                      }`}
                      title="View Prescription"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {item.consultation?.diagnosisName && (
                  <p className="text-xs text-muted-foreground font-medium truncate">
                    Diagnosis: <span className="text-foreground">{item.consultation.diagnosisName}</span>
                  </p>
                )}

                {item.medicines && item.medicines.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.medicines.slice(0, 3).map((med: any, i: number) => (
                      <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0">
                        {med.medicineName}
                      </Badge>
                    ))}
                    {item.medicines.length > 3 && (
                      <span className="text-[9px] text-muted-foreground font-medium pl-1">
                        +{item.medicines.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default PrescriptionHistoryCard;
