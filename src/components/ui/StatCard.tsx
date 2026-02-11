
import * as React from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: string | number
    icon?: React.ReactNode
    trend?: {
        value: number
        label: string
        positive?: boolean
    }
    className?: string
    action?: React.ReactNode
}

export function StatCard({
    title,
    value,
    icon,
    trend,
    className,
    action,
}: StatCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <span className="text-sm font-medium text-slate-500">{title}</span>
                    {icon && <div className="text-slate-400">{icon}</div>}
                </div>
                <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold text-slate-900">{value}</div>
                    {action}
                </div>
                {trend && (
                    <p className="mt-1 text-xs text-slate-500">
                        <span
                            className={cn(
                                "font-medium",
                                trend.positive ? "text-emerald-600" : "text-red-600"
                            )}
                        >
                            {trend.positive ? "+" : ""}
                            {trend.value}%
                        </span>{" "}
                        {trend.label}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
