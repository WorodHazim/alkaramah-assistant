
import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    subtitle?: string
    actions?: React.ReactNode
}

export function PageHeader({
    title,
    subtitle,
    actions,
    className,
    ...props
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1",
                className
            )}
            {...props}
        >
            <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-sm text-slate-500">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    )
}
