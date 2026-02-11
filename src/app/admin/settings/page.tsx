
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { Settings } from "lucide-react"

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Global Settings"
                subtitle="System configuration and user management."
            />
            <EmptyState
                title="System Configuration"
                description="Manage global settings for the platform."
                icon={<Settings className="h-6 w-6 text-slate-400" />}
            />
        </div>
    )
}
