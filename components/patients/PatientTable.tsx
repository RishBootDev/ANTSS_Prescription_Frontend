import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Users, User, Phone, Calendar, Stethoscope, Eye } from "lucide-react"
import { PatientData } from "@/types/patient"
import { Skeleton } from "@/components/ui/skeleton"

interface PatientTableProps {
  patients: PatientData[];
  searchQuery: string;
  genderFilter: string;
  isLoading?: boolean;
  onConsult: (patient: PatientData) => void;
  onProfile: (patient: PatientData) => void;
}

export default function PatientTable({ patients, searchQuery, genderFilter, isLoading = false, onConsult, onProfile }: PatientTableProps) {
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = !searchQuery || 
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.contactNumber?.includes(searchQuery) ||
      patient.id?.includes(searchQuery) ||
      patient.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGender = genderFilter === "all" || patient.gender === genderFilter

    return matchesSearch && matchesGender
  })

  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No patients found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || genderFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Register your first patient to get started"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reg. No</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Contact</TableHead>

                  <TableHead>Last Visit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-mono font-medium text-primary">
                      {patient.registrationNumber || "N/A"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {patient.id?.slice(0, 8) || "N/A"}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => onProfile(patient)}
                        title="View Dashboard"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        {patient.name}
                      </div>
                    </TableCell>
                    <TableCell>{patient.age || "N/A"}</TableCell>
                    <TableCell>{patient.gender || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {patient.contactNumber || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {patient.visitDate || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onProfile(patient)}
                          className="gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Dashboard
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onConsult(patient)}
                          className="gap-1.5"
                        >
                          <Stethoscope className="h-3.5 w-3.5" />
                          Consult
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
