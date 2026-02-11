
import Link from "next/link"
import {
    Users,
    FileText,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ArrowRight,
    Plus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button, buttonVariants } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { StatCard } from "@/components/ui/StatCard"
import { PageHeader } from "@/components/ui/PageHeader"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { Separator } from "@/components/ui/Separator"
import { STUDENTS, PENDING_PLANS, ALERTS, SCHEDULE } from "@/mock/demoData"

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            {/* Welcome Section */}
            <section className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Welcome back, Ms. Sarah 👋
                        </h1>
                        <p className="mt-2 text-slate-500 max-w-2xl text-lg">
                            Based on yesterday&#39;s logs, Ahmed improved in matching color cards, while Layla showed great progress in verbal requests but needed more sensory breaks in the afternoon.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/teacher/reports" className={cn(buttonVariants({ variant: "default" }), "bg-[#63AFA5] hover:bg-[#4A8F86]")}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Report
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Students"
                    value={STUDENTS.length}
                    icon={<Users className="h-4 w-4" />}
                    action={
                        <Link href="/teacher/students" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}>View All</Link>
                    }
                />
                <StatCard
                    title="Pending Plans"
                    value={PENDING_PLANS.length}
                    icon={<FileText className="h-4 w-4" />}
                    action={
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                            Needs Review
                        </Badge>
                    }
                />
                <StatCard
                    title="Alerts Today"
                    value={ALERTS.length}
                    icon={<AlertTriangle className="h-4 w-4" />}
                    action={
                        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                            Requires Attention
                        </Badge>
                    }
                />
            </div>

            <div className="grid gap-8 md:grid-cols-7">
                {/* Today's Focus - Left Column */}
                <Card className="md:col-span-4 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Today&#39;s Focus</CardTitle>
                        <CardDescription>
                            Your scheduled sessions and key activities for today.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {SCHEDULE.map((item, index) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#63AFA5] border border-slate-200">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        {index !== SCHEDULE.length - 1 && (
                                            <div className="h-full w-px bg-slate-200 my-2" />
                                        )}
                                    </div>
                                    <div className="space-y-1 pb-8">
                                        <p className="text-sm font-medium leading-none text-slate-500">
                                            {item.time}
                                        </p>
                                        <p className="text-base font-semibold text-slate-900">
                                            {item.activity}
                                        </p>
                                        <p className="text-sm text-slate-500">{item.student}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Separator className="my-4" />
                        <div className="flex gap-2">
                            <Link href="/teacher/worksheets" className={buttonVariants({ variant: "outline", size: "sm" })}>Create Worksheet</Link>
                            <Link href="/teacher/reports" className={buttonVariants({ variant: "outline", size: "sm" })}>View Students</Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column Stack */}
                <div className="space-y-8 md:col-span-3">
                    {/* Pending Approvals */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Pending Approvals</CardTitle>
                            <CardDescription>
                                Daily plans needing your review.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {PENDING_PLANS.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className="flex items-center justify-between space-x-4 rounded-lg border border-slate-100 p-3 bg-slate-50/50"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-[10px]">{plan.studentName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                                </Avatar>
                                                <p className="text-sm font-medium leading-none text-slate-900">
                                                    {plan.studentName}
                                                </p>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-1 max-w-[180px]">
                                                {plan.goal}
                                            </p>
                                        </div>
                                        <Link href={`/teacher/students/${plan.studentId}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs text-[#63AFA5] hover:text-[#4A8F86] hover:bg-[#63AFA5]/10")}>
                                            Review
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Alerts */}
                    <Card className="border-red-100 bg-red-50/30">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-red-900">Recent Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {ALERTS.map((alert) => (
                                    <div key={alert.id} className="flex items-top gap-3">
                                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-900">
                                                {alert.title}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {alert.detail} • {alert.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* External Tools */}
                    <Card className="border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Quick Tools</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2">
                                {["ClassDojo", "Drive", "Canva"].map((tool) => (
                                    <Button key={tool} variant="outline" className="h-20 flex flex-col gap-1 items-center justify-center border-slate-200 hover:border-[#63AFA5] hover:text-[#63AFA5]">
                                        <span className="text-xs font-semibold">{tool}</span>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
