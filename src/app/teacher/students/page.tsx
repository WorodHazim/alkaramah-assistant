"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Loader2, AlertCircle } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Button, buttonVariants } from "@/components/ui/Button"
import { Card, CardContent, CardFooter } from "@/components/ui/Card"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/utils"

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    // Hardcoded for demo: Ms. Sarah's ID
    const teacherId = 'f4a1e2b2-5678-4321-8765-abcdef123456'

    useEffect(() => {
        const fetchStudents = async () => {
            setIsLoading(true)
            try {
                const res = await fetch(`/api/teacher/students?teacherId=${teacherId}`)
                if (!res.ok) throw new Error('Failed to fetch students')
                const data = await res.json()
                setStudents(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStudents()
    }, [teacherId])

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <PageHeader
                    title="Students"
                    subtitle="Manage your class roster and profiles."
                    className="px-0"
                />
                <div className="flex items-center gap-2">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="search"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-64 rounded-full border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#63AFA5] focus:ring-1 focus:ring-[#63AFA5]"
                        />
                    </div>
                    <Link href="/teacher/students/new" className={cn(buttonVariants({ variant: "default" }), "bg-[#63AFA5] hover:bg-[#4A8F86]")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Student
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-[#63AFA5]" />
                    <p>Loading your class roster...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-red-500 space-y-4">
                    <AlertCircle className="h-10 w-10" />
                    <p>Error: {error}</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                    <Search className="h-10 w-10 opacity-20" />
                    <p>No students found.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredStudents.map((student) => (
                        <Link key={student.id} href={`/teacher/students/${student.id}`}>
                            <Card className="h-full transition-all hover:shadow-md hover:border-[#63AFA5]/50 group">
                                <CardContent className="flex flex-col items-center p-6 text-center space-y-4">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm group-hover:border-[#63AFA5]/10 transition-colors">
                                            <AvatarFallback className="text-2xl bg-[#EAF2F1] text-[#63AFA5]">
                                                {student.avatar_label || student.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className={cn(
                                            "absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white",
                                            "bg-emerald-500" // Hardcoded present for demo
                                        )} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg text-slate-900 group-hover:text-[#63AFA5] transition-colors">
                                            {student.name}
                                        </h3>
                                        <div className="text-sm text-slate-500">
                                            ID: {student.id.substring(0, 8)}... • {student.age} Years Old
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                                        Support: {student.support_level}
                                    </Badge>
                                </CardContent>
                                <CardFooter className="bg-slate-50/50 p-4 border-t border-slate-100">
                                    <div className="w-full text-center text-xs font-medium text-slate-500">
                                        Click to view profile
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
