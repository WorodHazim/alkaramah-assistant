
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-[#63AFA5] text-white hover:bg-[#63AFA5]/80",
                secondary:
                    "border-transparent bg-[#A9D6F5] text-slate-900 hover:bg-[#A9D6F5]/80",
                destructive:
                    "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80",
                outline: "text-slate-950",
            },
            status: {
                success: "border-transparent bg-emerald-100 text-emerald-700",
                warning: "border-transparent bg-amber-100 text-amber-700",
                danger: "border-transparent bg-red-100 text-red-700",
                neutral: "border-transparent bg-slate-100 text-slate-700",
            }
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, status, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, status }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
