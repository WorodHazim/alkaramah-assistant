
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { Settings } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                subtitle="Manage your account and application preferences."
            />
            <EmptyState
                title="Settings moved"
                description="Global settings are managed by the administrator."
                icon={<Settings className="h-6 w-6 text-slate-400" />}
            />
        </div>
    )
}
