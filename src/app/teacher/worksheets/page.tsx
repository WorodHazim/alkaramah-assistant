
import Link from "next/link"
import { Plus, FileText, Download, Calendar } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Button, buttonVariants } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/utils"

const RECENT_WORKSHEETS = [
    { id: 1, title: "Color Matching - Level 1", students: "Ahmed, Layla", date: "Feb 10, 2026", type: "Matching" },
    { id: 2, title: "Emotion Recognition", students: "Zayed", date: "Feb 09, 2026", type: "Social" },
    { id: 3, title: "Number Tracing 1-5", students: "Sarah", date: "Feb 08, 2026", type: "Writing" },
]

export default function WorksheetsPage() {
    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <PageHeader
                    title="Worksheets"
                    subtitle="Generate and manage personalized learning materials."
                    className="px-0"
                />
                <Link href="/teacher/worksheets/new" className={cn(buttonVariants({ variant: "default" }), "bg-[#63AFA5] hover:bg-[#4A8F86]")}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Worksheet
                </Link>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Worksheets</CardTitle>
                        <CardDescription>history of generated materials.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {RECENT_WORKSHEETS.map((worksheet) => (
                                <div key={worksheet.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-[#63AFA5]/10 flex items-center justify-center text-[#63AFA5]">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{worksheet.title}</h4>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                <Badge variant="outline" className="text-xs font-normal">{worksheet.type}</Badge>
                                                <span>•</span>
                                                <span>For: {worksheet.students}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-slate-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {worksheet.date}
                                        </span>
                                        <Button variant="ghost" size="icon">
                                            <Download className="h-4 w-4 text-slate-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
