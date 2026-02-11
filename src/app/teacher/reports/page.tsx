
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { BarChart } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Reports"
                subtitle="View student progress and performance analytics."
                actions={<Button variant="outline">Export Data</Button>}
            />
            <EmptyState
                title="No reports available"
                description="Select a student and time range to generate a progress report."
                icon={<BarChart className="h-6 w-6 text-slate-400" />}
            />
        </div>
    )
}
