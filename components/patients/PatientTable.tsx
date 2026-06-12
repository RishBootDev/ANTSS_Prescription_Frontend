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

interface PatientTableProps {
  patients: PatientData[];
  searchQuery: string;
  genderFilter: string;
  onConsult: (patient: PatientData) => void;
  onProfile: (patient: PatientData) => void;
}

export default function PatientTable({ patients, searchQuery, genderFilter, onConsult, onProfile }: PatientTableProps) {
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
        {filteredPatients.length === 0 ? (
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
                  <TableHead>Blood Group</TableHead>
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
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        {patient.bloodGroup || "N/A"}
                      </span>
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
