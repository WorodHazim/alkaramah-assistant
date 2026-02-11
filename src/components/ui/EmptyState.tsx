
import * as React from "react"
import { cn } from "@/lib/utils"
import { FileQuestion } from "lucide-react"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description?: string
    icon?: React.ReactNode
    action?: React.ReactNode
}

export function EmptyState({
    title,
    description,
    icon,
    action,
    className,
    ...props
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center animate-in fade-in-50",
                className
            )}
            {...props}
        >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                {icon || <FileQuestion className="h-6 w-6 text-slate-400" />}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
            {description && (
                <p className="mt-2 mb-4 text-sm text-slate-500 max-w-sm">
                    {description}
                </p>
            )}
            {action}
        </div>
    )
}
