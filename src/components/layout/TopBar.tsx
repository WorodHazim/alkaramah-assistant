
"use client"

import { Bell, Search, Menu, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"

export function TopBar() {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#63AFA5]/10 rounded-full border border-[#63AFA5]/20 animate-pulse">
                    <Sparkles className="h-3.5 w-3.5 text-[#63AFA5]" />
                    <span className="text-[10px] font-black text-[#63AFA5] uppercase tracking-widest">Demo Mode: AI Mock Running</span>
                </div>
                <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="search"
                        placeholder="Search students, goals, reports..."
                        className="h-10 w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-[#63AFA5] focus:ring-1 focus:ring-[#63AFA5] md:w-80"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-slate-500">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    <span className="sr-only">Notifications</span>
                </Button>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                    <div className="hidden flex-col items-end md:flex">
                        <span className="text-sm font-medium text-slate-700">Ms. Sarah</span>
                        <span className="text-xs text-slate-500">Teacher</span>
                    </div>
                    <Avatar className="h-9 w-9 border border-slate-200 bg-[#EAF2F1]">
                        <AvatarFallback className="bg-[#EAF2F1] text-[#63AFA5]">MS</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}
