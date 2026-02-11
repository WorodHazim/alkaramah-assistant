"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Custom simple tabs component to fix build error (no Radix dependency)

const TabsContext = React.createContext<{
    activeTab: string
    setActiveTab: (value: string) => void
} | null>(null)

export function Tabs({
    defaultValue,
    value,
    onValueChange,
    className,
    children,
    ...props
}: {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
    className?: string
    children: React.ReactNode
}) {
    const [internalTab, setInternalTab] = React.useState(defaultValue || "")
    const activeTab = value !== undefined ? value : internalTab

    const setActiveTab = (newValue: string) => {
        if (value === undefined) {
            setInternalTab(newValue)
        }
        onValueChange?.(newValue)
    }

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn("", className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

export function TabsList({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function TabsTrigger({
    value,
    className,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsTrigger must be used within Tabs")

    const isActive = context.activeTab === value

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive
                    ? "bg-white text-slate-950 shadow-sm"
                    : "hover:bg-slate-200/50 hover:text-slate-900",
                className
            )}
            onClick={() => context.setActiveTab(value)}
            {...props}
        >
            {children}
        </button>
    )
}

export function TabsContent({
    value,
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsContent must be used within Tabs")

    if (context.activeTab !== value) return null

    return (
        <div
            className={cn(
                "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 animate-in fade-in-50",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
