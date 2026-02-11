"use client"

import { useState, useEffect } from "react"
import { Sparkles, Loader2, CheckCircle2, TrendingUp, Brain, Target } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

interface Student {
    id: string
    name: string
    age: number
    support_level: string
}

interface AnalysisResult {
    accuracy: number
    supportLevel: string
    aetDomain: string
    strengths: string
    weaknesses: string
    recommendation: string
    goalGenerated: boolean
    studentName: string
}

export default function AIDemoPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [selectedStudent, setSelectedStudent] = useState<string>("")
    const [correct, setCorrect] = useState<number>(0)
    const [total, setTotal] = useState<number>(10)
    const [worksheetType, setWorksheetType] = useState<string>("vocabulary")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)

    const teacherId = 'f4a1e2b2-5678-4321-8765-abcdef123456'

    useEffect(() => {
        fetch(`/api/teacher/students?teacherId=${teacherId}`)
            .then(res => res.json())
            .then(data => {
                setStudents(data)
                if (data.length > 0) setSelectedStudent(data[0].id)
            })
            .catch(err => console.error(err))
    }, [])

    const handleAnalyze = async () => {
        if (!selectedStudent) return

        setIsAnalyzing(true)
        setResult(null)
        setShowSuccess(false)

        try {
            const res = await fetch('/api/ai/analyze-worksheet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: selectedStudent,
                    correct,
                    total,
                    worksheetType
                })
            })

            if (!res.ok) throw new Error('Analysis failed')

            const data = await res.json()

            setTimeout(() => {
                setResult(data)
                setShowSuccess(true)
                setIsAnalyzing(false)
            }, 1500)

        } catch (error) {
            console.error(error)
            setIsAnalyzing(false)
        }
    }

    const getSupportColor = (level: string) => {
        if (level === 'Low') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
        if (level === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200'
        return 'bg-rose-100 text-rose-700 border-rose-200'
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500 max-w-4xl mx-auto">
            <PageHeader
                title="AI Worksheet Analysis"
                subtitle="Intelligent adaptive support powered by AET framework"
                className="px-0"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-[#63AFA5]" />
                        Worksheet Input
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Select Student
                        </label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-[#63AFA5] focus:ring-1 focus:ring-[#63AFA5] outline-none"
                        >
                            {students.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.age} years old)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Correct Answers
                            </label>
                            <input
                                type="number"
                                min="0"
                                max={total}
                                value={correct}
                                onChange={(e) => setCorrect(Number(e.target.value))}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-[#63AFA5] focus:ring-1 focus:ring-[#63AFA5] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Total Questions
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={total}
                                onChange={(e) => setTotal(Number(e.target.value))}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-[#63AFA5] focus:ring-1 focus:ring-[#63AFA5] outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Worksheet Type
                        </label>
                        <select
                            value={worksheetType}
                            onChange={(e) => setWorksheetType(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-[#63AFA5] focus:ring-1 focus:ring-[#63AFA5] outline-none"
                        >
                            <option value="vocabulary">Vocabulary</option>
                            <option value="math">Math</option>
                            <option value="matching">Matching</option>
                        </select>
                    </div>

                    <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !selectedStudent}
                        className="w-full bg-[#63AFA5] hover:bg-[#4A8F86] h-12 text-base"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Analyzing with AI...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Analyze & Generate Plan
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <Card className="border-2 border-[#63AFA5]/20 animate-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="bg-gradient-to-r from-[#EAF2F1] to-white">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-[#63AFA5]" />
                            Analysis Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <div className="text-3xl font-bold text-[#63AFA5]">
                                    {result.accuracy}%
                                </div>
                                <div className="text-sm text-slate-600 mt-1">Accuracy</div>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <Badge className={`${getSupportColor(result.supportLevel)} text-base px-4 py-1`}>
                                    {result.supportLevel}
                                </Badge>
                                <div className="text-sm text-slate-600 mt-2">Support Level</div>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <div className="text-lg font-semibold text-slate-700">
                                    {result.aetDomain}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">AET Domain</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <div className="font-semibold text-emerald-900 mb-1">Strengths</div>
                                <div className="text-sm text-emerald-700">{result.strengths}</div>
                            </div>
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="font-semibold text-amber-900 mb-1">Areas for Growth</div>
                                <div className="text-sm text-amber-700">{result.weaknesses}</div>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="font-semibold text-blue-900 mb-1">Recommendation</div>
                                <div className="text-sm text-blue-700">{result.recommendation}</div>
                            </div>
                        </div>

                        {showSuccess && (
                            <div className="flex items-center justify-center gap-2 p-4 bg-[#EAF2F1] border border-[#63AFA5] rounded-lg animate-in zoom-in-95 duration-300">
                                <CheckCircle2 className="h-5 w-5 text-[#63AFA5]" />
                                <span className="font-semibold text-[#63AFA5]">
                                    IEP Goal Generated & Support Level Updated
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
