
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { FileBarChart } from "lucide-react"

export default function AdminReportsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Reports"
                subtitle="School-wide analytics and performance reports."
            />
            <EmptyState
                title="Analytics Dashboard"
                description="Generate and view school-wide progress reports."
                icon={<FileBarChart className="h-6 w-6 text-slate-400" />}
            />
        </div>
    )
}
