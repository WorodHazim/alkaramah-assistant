
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { UserCheck } from "lucide-react"

export default function AdminTeachersPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Teachers"
                subtitle="Manage teaching staff and assignments."
            />
            <EmptyState
                title="Teacher Directory"
                description="View and manage teacher profiles and class assignments."
                icon={<UserCheck className="h-6 w-6 text-slate-400" />}
            />
        </div>
    )
}
