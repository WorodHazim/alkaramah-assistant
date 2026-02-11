
"use client"

import { PageHeader } from "@/components/ui/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function AddStudentPage() {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/teacher/students">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <PageHeader
                    title="Add New Student"
                    subtitle="Enter student details to create a profile."
                    className="px-0"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                    <CardDescription>Basic details for the new student record.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <input type="text" className="h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#63AFA5]" placeholder="e.g. Khalid Al-Qasimi" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Date of Birth</label>
                            <input type="date" className="h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#63AFA5]" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Program</label>
                            <select className="h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#63AFA5] bg-white">
                                <option>Autism Support</option>
                                <option>Speech Therapy</option>
                                <option>Behavioral Support</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Parent Contact</label>
                        <input type="text" className="h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#63AFA5]" placeholder="+971 50 123 4567" />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="/teacher/students">Cancel</Link>
                    </Button>
                    <Button className="bg-[#63AFA5] hover:bg-[#4A8F86]">Create Profile</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
