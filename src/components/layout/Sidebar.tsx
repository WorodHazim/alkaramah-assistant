
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    FileText,
    BarChart,
    Settings,
    LogOut,
    GraduationCap,
    CheckCircle2
} from "lucide-react"

const navigation = [
    { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/teacher/students", icon: Users },
    { name: "Worksheets", href: "/teacher/worksheets", icon: FileText },
    { name: "Approvals", href: "/teacher/approvals", icon: CheckCircle2 },
    { name: "Reports", href: "/teacher/reports", icon: BarChart },
    { name: "Settings", href: "/teacher/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full min-h-screen w-64 flex-col border-r border-slate-200 bg-white">
            <div className="flex h-16 items-center border-b border-slate-100 px-6">
                <GraduationCap className="mr-2 h-6 w-6 text-[#63AFA5]" />
                <span className="text-lg font-bold text-slate-900">AlKaramah</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-[#63AFA5]/10 text-[#63AFA5]"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0",
                                        isActive
                                            ? "text-[#63AFA5]"
                                            : "text-slate-400 group-hover:text-slate-500"
                                    )}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t border-slate-100 p-4">
                <button className="group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600">
                    <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
