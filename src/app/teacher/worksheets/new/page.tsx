
"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Sparkles, Wand2, CheckCircle2, Globe, GraduationCap, Image as ImageIcon } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { STUDENTS } from "@/mock/demoData"
import { cn } from "@/lib/utils"
import { generateWorksheet, GeneratedWorksheet } from "@/lib/worksheet-generator"
import { LearningPlan, StudentProfile } from "@/lib/ai-analyst"

export default function NewWorksheetPage() {
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [generated, setGenerated] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [worksheet, setWorksheet] = useState<GeneratedWorksheet | null>(null)

    // Form parameters
    const [topic, setTopic] = useState("Matching Colors & Shapes")
    const [supportLevel, setSupportLevel] = useState<1 | 2 | 3>(1)
    const [learningStyle, setLearningStyle] = useState<'Visual' | 'Tactile' | 'Auditory'>('Visual')

    const toggleStudent = (id: string) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(s => s !== id))
        } else {
            setSelectedStudents([...selectedStudents, id])
        }
    }

    const handleGenerate = () => {
        setIsGenerating(true)

        // Simulate AI generation with the new utility
        setTimeout(() => {
            const student = STUDENTS.find(s => s.id === selectedStudents[0]) || STUDENTS[0];

            // Simulate fetching an approved plan for this student
            // For demo: if Ahmed is selected, we assume he has an approved plan from today's log
            const hasApprovedPlan = student.id === "1";
            const mockApprovedPlan: LearningPlan | undefined = hasApprovedPlan ? {
                studentId: student.id,
                date: new Date().toISOString(),
                generatedPlan: "Use high-contrast visual borders and Burj Khalifa icons for familiarity.",
                objective: "Matching Colors - Level 2 (Enhanced)",
                formattedParagraph: "Student mastered Level 1; advancing to Level 2 with cultural scaffolds.",
                status: 'approved',
                isApproved: true
            } : undefined;

            const content = generateWorksheet({
                studentName: student.name,
                age: student.age,
                supportLevel: supportLevel,
                learningStyle: learningStyle,
                objective: topic,
                todayPerformance: "Achieved with moderate prompts",
                tomorrowPlan: "Progress to independent matching",
                approvedPlan: mockApprovedPlan
            });

            setWorksheet(content)
            setIsGenerating(false)
            setGenerated(true)
        }, 2000)
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-500 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/teacher/worksheets">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <PageHeader
                    title="Create New Worksheet"
                    subtitle="AI-tailored learning materials with UAE cultural alignment."
                    className="px-0"
                />
            </div>

            {!generated ? (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* 1. SELECT STUDENTS */}
                    <Card className="h-fit lg:col-span-1">
                        <CardHeader className="pb-3 border-b border-slate-50 mb-4">
                            <CardTitle className="text-sm font-bold text-slate-900 border-l-4 border-[#63AFA5] pl-3">1. Select Student(s)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {STUDENTS.map((student) => (
                                <div
                                    key={student.id}
                                    onClick={() => toggleStudent(student.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                        selectedStudents.includes(student.id)
                                            ? "border-[#63AFA5] bg-[#63AFA5]/5 ring-1 ring-[#63AFA5]/20"
                                            : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "h-4 w-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                        selectedStudents.includes(student.id) ? "bg-[#63AFA5] border-[#63AFA5]" : "border-slate-300"
                                    )}>
                                        {selectedStudents.includes(student.id) && <CheckCircle2 className="h-2 w-2 text-white" />}
                                    </div>
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback className="text-[10px] uppercase font-bold bg-[#EAF2F1] text-[#63AFA5]">{student.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="truncate">
                                        <p className="text-xs font-bold text-slate-900">{student.name}</p>
                                        <p className="text-[10px] text-slate-400">{student.diagnosis}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* 2. PARAMETERS */}
                    <Card className="h-fit lg:col-span-2">
                        <CardHeader className="pb-3 border-b border-slate-50 mb-4">
                            <CardTitle className="text-sm font-bold text-slate-900 border-l-4 border-[#63AFA5] pl-3">2. AI Generation Parameters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="h-3 w-3 text-[#63AFA5]" /> Topic / skill Area
                                    </label>
                                    <select
                                        className="h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#63AFA5] outline-none"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                    >
                                        <option>Matching Colors & Shapes</option>
                                        <option>Number Recognition 1-10</option>
                                        <option>Social Story: Group Play</option>
                                        <option>My Home & Family (UAE context)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <GraduationCap className="h-3 w-3 text-[#63AFA5]" /> Support Level
                                    </label>
                                    <select
                                        className="h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#63AFA5] outline-none"
                                        value={supportLevel}
                                        onChange={(e) => setSupportLevel(parseInt(e.target.value) as any)}
                                    >
                                        <option value={1}>Level 1 (Highest Support - Visual Only)</option>
                                        <option value={2}>Level 2 (Moderate - Visual + Simple Text)</option>
                                        <option value={3}>Level 3 (Low - Text Primary)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        Learning Style
                                    </label>
                                    <div className="flex gap-2">
                                        {(['Visual', 'Tactile', 'Auditory'] as const).map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => setLearningStyle(style)}
                                                className={cn(
                                                    "flex-1 py-2 text-[10px] font-bold border rounded-md transition-colors",
                                                    learningStyle === style ? "bg-[#63AFA5] text-white border-[#63AFA5]" : "bg-white text-slate-600 border-slate-200 hover:border-[#63AFA5] hover:text-[#63AFA5]"
                                                )}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Globe className="h-3 w-3 text-[#63AFA5]" /> UAE Context
                                    </label>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
                                        <div className="h-4 w-4 rounded-full bg-emerald-500 shrink-0" />
                                        <span className="text-[10px] font-bold text-slate-600">ENABLED: Arabic-translated terms & UAE cultural icons.</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 py-4 border-t border-slate-100">
                            <Button
                                className="w-full bg-slate-900 border-none h-12 text-sm font-bold uppercase tracking-widest group"
                                disabled={selectedStudents.length === 0 || isGenerating}
                                onClick={handleGenerate}
                            >
                                {isGenerating ? (
                                    <span className="flex items-center gap-2"><div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Tailoring material...</span>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4 text-[#63AFA5] group-hover:scale-125 transition-transform" />
                                        Generate Printable Worksheet
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            ) : (
                <div className="space-y-6 max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
                    <div className="bg-[#63AFA5]/10 border border-[#63AFA5]/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="h-16 w-16 bg-[#63AFA5] rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#63AFA5]/20">
                            <Wand2 className="h-8 w-8" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-bold text-slate-900">Personalized Sheet Ready</h3>
                            <p className="text-sm text-slate-500">AI has integrated IEP goals for {selectedStudents.length} student(s) with level {supportLevel} {learningStyle.toLowerCase()} supports.</p>
                        </div>
                    </div>

                    <div className="aspect-[1/1.4] w-full bg-white border-2 border-slate-100 shadow-2xl rounded-2xl flex flex-col p-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <Button className="bg-[#63AFA5] border-none shadow-xl">Download Printable PDF</Button>
                        </div>

                        {/* Mock Visual Worksheet Content */}
                        <div className="flex justify-between items-start mb-8 border-b pb-4">
                            <div>
                                <h1 className="text-xl font-black text-slate-900 uppercase">{worksheet?.title}</h1>
                                <p className="text-xs text-slate-400 font-bold tracking-widest">PERSONALIZED FOR: {selectedStudents.map(id => STUDENTS.find(s => s.id === id)?.name).join(", ")}</p>
                            </div>
                            <LogoPlaceholder />
                        </div>

                        <div className="space-y-8 flex-1 mt-4">
                            {worksheet?.tasks.map((task, i) => (
                                <div key={i} className="space-y-4">
                                    <p className="text-sm font-bold text-slate-900 border-l-4 border-[#63AFA5] pl-3">{task.instruction}</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {task.items.map((item, idx) => (
                                            <div key={idx} className="aspect-video bg-slate-50 rounded-xl border-2 border-slate-100 flex flex-col items-center justify-center p-4">
                                                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                                                    <ImageIcon className="h-4 w-4 text-slate-200" />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 text-center">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-slate-50/50 rounded-lg flex items-center gap-3 border border-slate-100">
                            <Globe className="h-4 w-4 text-[#63AFA5]" />
                            <p className="text-[10px] text-slate-500 font-medium">{worksheet?.cultureContext}</p>
                        </div>

                        <div className="mt-4 p-4 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/20">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Teacher Guidance</p>
                            <p className="text-[10px] text-slate-600 leading-relaxed italic">"{worksheet?.teacherNotes}"</p>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button variant="outline" className="h-12 px-8" onClick={() => setGenerated(false)}>Reset & Edit</Button>
                        <Button className="h-12 px-8 bg-[#63AFA5] border-none">Publish to Student Library</Button>
                    </div>
                </div>
            )}
        </div>
    )
}

function LogoPlaceholder() {
    return (
        <div className="h-10 w-10 flex items-center justify-center border-2 border-[#63AFA5] rounded-lg">
            <span className="text-[10px] font-black text-[#63AFA5]">AK</span>
        </div>
    )
}
