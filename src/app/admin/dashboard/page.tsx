
import {
    Users,
    UserCheck,
    FileBarChart,
    School,
    TrendingUp,
    AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { PageHeader } from "@/components/ui/PageHeader"
import { Badge } from "@/components/ui/Badge"

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            {/* Welcome Section */}
            <section className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        School Overview
                    </h1>
                    <p className="mt-2 text-slate-500 text-lg">
                        Welcome to the AlKaramah management dashboard.
                    </p>
                </div>
            </section>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Students"
                    value="142"
                    icon={<Users className="h-4 w-4" />}
                    trend={{ value: 4, label: "from last month", positive: true }}
                />
                <StatCard
                    title="Active Teachers"
                    value="28"
                    icon={<UserCheck className="h-4 w-4" />}
                />
                <StatCard
                    title="Reports Generated"
                    value="1,204"
                    icon={<FileBarChart className="h-4 w-4" />}
                    trend={{ value: 12, label: "from last month", positive: true }}
                />
                <StatCard
                    title="Pending Issues"
                    value="3"
                    icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
                    action={
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">Action Required</Badge>
                    }
                />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent School Activity</CardTitle>
                        <CardDescription>Latest updates across all classes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { text: "Ms. Sarah submitted weekly report for Class 3A", time: "2h ago" },
                                { text: "New student enrollment: Khalid Al-Qasimi", time: "4h ago" },
                                { text: "Updated IEP templates for 2026", time: "1d ago" },
                                { text: "Fire drill scheduled for next Tuesday", time: "2d ago" },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center border-b last:border-0 border-slate-100 pb-2 last:pb-0">
                                    <span className="text-sm text-slate-700">{item.text}</span>
                                    <span className="text-xs text-slate-400">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Student Distribution</CardTitle>
                        <CardDescription>By support program.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: "Autism Support", value: "45%", color: "bg-[#63AFA5]" },
                                { label: "Speech Therapy", value: "30%", color: "bg-[#A9D6F5]" },
                                { label: "Behavioral Support", value: "15%", color: "bg-indigo-300" },
                                { label: "Occupational Therapy", value: "10%", color: "bg-orange-200" },
                            ].map((item) => (
                                <div key={item.label} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium text-slate-500">
                                        <span>{item.label}</span>
                                        <span>{item.value}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: item.value }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
