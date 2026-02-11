
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { Users } from "lucide-react"

export default function AdminStudentsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Students"
                subtitle="School-wide student directory and enrollment."
            />
            <EmptyState
                title="Student Directory"
                description="Manage student records and program enrollment."
                icon={<Users className="h-6 w-6 text-slate-400" />}
            />
        </div>
    )
}
