
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import {
    ChevronLeft,
    Sparkles,
    ClipboardList,
    Flag,
    Image as ImageIcon,
    FileText,
    TrendingUp,
    AlertCircle,
    Plus,
    ArrowRight,
    Search,
    Filter,
    CheckCircle2,
    BrainCircuit,
    MessageSquare,
    Video,
    File as FileIcon,
    Trash2,
    Eye,
    Edit2,
    XCircle,
    ScrollText,
    FileSearch,
    Trash,
    Download,
    BarChart,
    RefreshCw,
    Edit3
} from "lucide-react"
import Link from "next/link"
import { STUDENTS, IEP_GOALS, MOCK_LOGS, IEP_PLANS, MOCK_EVIDENCE, MOCK_REPORTS } from "@/mock/demoData"
import { cn } from "@/lib/utils"
import { analyzeLog, AIAnalysis, suggestObjectiveChange, IEPSuggestion, LogEntry, IEPGoal, generateGoalSuggestions, breakDownGoal, Evidence, EvidenceAnalysis, analyzeEvidence, analyzeEvidenceBatch, StudentProfile, Worksheet, generateWorksheet } from "@/lib/ai-analyst"
import { generateProgressReport, ProgressReport, refineReportSection, ReportInput } from "@/lib/report-generator"

export default function StudentProfilePage() {
    const params = useParams()
    const studentId = params.id as string
    const [student, setStudent] = useState<StudentProfile>(() => {
        const found = STUDENTS.find((s) => s.id === params.id) || STUDENTS[0];
        return {
            id: found.id,
            name: found.name,
            age: found.age,
            diagnosis: 'Autism Support',
            supportLevel: 'Medium',
            communicationLevel: 'verbal',
            preferredLearning: 'visual',
            interests: ['Cars', 'Colors', 'Puzzles']
        };
    })
    const [isLoading, setIsLoading] = useState(true)

    // Hardcoded for demo: Ms. Sarah's ID
    const teacherId = 'f4a1e2b2-5678-4321-8765-abcdef123456'

    // UI States
    const [showLogForm, setShowLogForm] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [recentAnalysis, setRecentAnalysis] = useState<AIAnalysis | null>(null)
    const [isEditingPlan, setIsEditingPlan] = useState(false)
    const [editedPlanText, setEditedPlanText] = useState("")
    const [iepSuggestions, setIepSuggestions] = useState<IEPSuggestion[]>([])
    const [isSuggestingIEP, setIsSuggestingIEP] = useState(false)
    const [generatedReport, setGeneratedReport] = useState<ProgressReport | null>(null)
    const [isGeneratingReport, setIsGeneratingReport] = useState(false)
    const [reportHistory, setReportHistory] = useState<ProgressReport[]>(MOCK_REPORTS.filter(r => r.title.includes(student.name)))
    const [isReportModalOpen, setIsReportModalOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [reportConfig, setReportConfig] = useState<{
        period: string;
        sections: string[];
    }>({
        period: "Last 7 days",
        sections: ["Logs", "Evidence", "IEP"]
    })
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)
    const [activeWorksheet, setActiveWorksheet] = useState<Worksheet | null>(null)
    const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false)

    // Data States
    const [allLogs, setAllLogs] = useState<LogEntry[]>(MOCK_LOGS.filter(l => l.studentId === student.id))
    const studentGoals = IEP_GOALS.filter(g => g.studentId === student.id)

    // Form States
    const [selectedDomains, setSelectedDomains] = useState<string[]>(['Academic'])
    const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>(studentGoals[0]?.id || "")
    const [customObjective, setCustomObjective] = useState("")
    const [outcome, setOutcome] = useState<LogEntry['outcome']>('Partial')
    const [difficulty, setDifficulty] = useState<LogEntry['difficulty']>('Medium')
    const [engagement, setEngagement] = useState<LogEntry['engagementLevel']>('Medium')
    const [selectedPrompts, setSelectedPrompts] = useState<LogEntry['prompts']>(['None'])
    const [aetCode, setAetCode] = useState("")
    const [learningIntention, setLearningIntention] = useState("")
    const [teacherNote, setTeacherNote] = useState("")

    // IEP States
    const [iepPlans, setIepPlans] = useState<IEPGoal[]>(IEP_PLANS.filter(p => p.studentId === student.id))
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
    const [editingGoal, setEditingGoal] = useState<Partial<IEPGoal> | null>(null)
    const [goalModalMode, setGoalModalMode] = useState<'add' | 'edit'>('add')
    const [selectedIepCategory, setSelectedIepCategory] = useState<'Communication' | 'Social Interaction' | 'Sensory Processing' | 'Independence'>('Communication')

    // Evidence States
    const [evidenceList, setEvidenceList] = useState<Evidence[]>([])
    const [evidenceSearch, setEvidenceSearch] = useState("")
    const [evidenceTypeFilter, setEvidenceTypeFilter] = useState<'all' | Evidence['type']>('all')
    const [evidenceCategoryFilter, setEvidenceCategoryFilter] = useState<'all' | Evidence['linkedCategory']>('all')
    const [evidenceGoalFilter, setEvidenceGoalFilter] = useState<string>('all')
    const [evidenceDateFilter, setEvidenceDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
    const [isAddEvidenceModalOpen, setIsAddEvidenceModalOpen] = useState(false)
    const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
    const [isEvidencePreviewOpen, setIsEvidencePreviewOpen] = useState(false)
    const [isAnalyzingEvidence, setIsAnalyzingEvidence] = useState(false)
    const [evidenceAnalysis, setEvidenceAnalysis] = useState<EvidenceAnalysis | null>(null)
    const [newEvidence, setNewEvidence] = useState<Partial<Evidence>>({
        type: 'photo',
        description: "",
        date: new Date().toISOString(),
        tags: []
    })

    useEffect(() => {
        const fetchStudentData = async () => {
            setIsLoading(true)
            try {
                // Fetch each resource independently so one failure doesn't break all
                let studentData: any = null
                let logsData: any = null
                let evidenceData: any = null
                let reportsData: any = null

                try {
                    const studentRes = await fetch(`/api/students/${studentId}`)
                    if (studentRes.ok) studentData = await studentRes.json()
                } catch { /* DB unavailable, will use mock */ }

                try {
                    const logsRes = await fetch(`/api/students/${studentId}/logs`)
                    if (logsRes.ok) logsData = await logsRes.json()
                } catch { /* will use mock */ }

                try {
                    const evidenceRes = await fetch(`/api/evidence?studentId=${studentId}`)
                    if (evidenceRes.ok) evidenceData = await evidenceRes.json()
                } catch { /* will use mock */ }

                try {
                    const reportsRes = await fetch(`/api/reports?studentId=${studentId}`)
                    if (reportsRes.ok) reportsData = await reportsRes.json()
                } catch { /* will use mock */ }

                if (studentData?.student) {
                    setStudent({
                        ...studentData.student,
                        supportLevel: studentData.student.support_level === 3 ? 'High' : studentData.student.support_level === 2 ? 'Medium' : 'Low',
                        learningStyle: studentData.student.learning_style || 'Visual',
                        interests: studentData.student.interests || ['Colors', 'Music', 'Puzzles'],
                        program: studentData.student.program || studentData.student.stage,
                        id: studentData.student.id,
                        name: studentData.student.name,
                        age: studentData.student.age,
                        avatar: studentData.student.avatar_label
                    })
                }
                // else: keep the mock-initialized student state

                if (logsData) {
                    const logsArray = Array.isArray(logsData)
                        ? logsData
                        : Array.isArray((logsData as any)?.recentLogs)
                            ? (logsData as any).recentLogs
                            : [];

                    const mappedLogs: LogEntry[] = logsArray.map((l: any) => ({
                        id: l.id,
                        studentId: l.student_id,
                        createdAt: l.created_at,
                        domains: l.domains || ['Academic'],
                        aetDomain: l.aet_domain || '',
                        aetCode: l.aet_code || '',
                        learningIntention: l.learning_intention || '',
                        objectiveText: l.objective,
                        outcome: l.outcome,
                        difficulty: l.difficulty,
                        engagementLevel: l.engagement_level || 'Medium',
                        prompts: l.prompts || [],
                        teacherComment: l.teacher_comment || ''
                    }))
                    setAllLogs(mappedLogs)
                }

                // Set AI plan from student data
                if (studentData?.latestPlan) {
                    setRecentAnalysis({
                        studentName: studentData.student.name,
                        insights: ["Data loaded from profile"],
                        suggestedPlan: {
                            ...studentData.latestPlan.content,
                            status: studentData.latestPlan.status,
                            id: studentData.latestPlan.id
                        }
                    } as any)
                }

                if (Array.isArray(evidenceData)) {
                    const mappedEvidence: Evidence[] = evidenceData.map((e: any) => ({
                        id: e.id,
                        studentId: e.student_id,
                        type: e.type,
                        description: e.description,
                        date: e.created_at,
                        fileUrl: e.file_url,
                        linkedGoalId: e.linked_goal_id,
                        linkedLogId: e.linked_log_id,
                        linkedCategory: e.linked_category,
                        linkedObjective: e.linked_objective_text,
                        addedBy: "Ms. Sarah",
                        tags: e.tags || []
                    }))
                    setEvidenceList(mappedEvidence)
                } else {
                    // Fallback to mock evidence
                    setEvidenceList(MOCK_EVIDENCE.filter(e => e.studentId === student.id))
                }

                if (Array.isArray(reportsData)) {
                    const mappedReports: ProgressReport[] = reportsData.map((r: any) => ({
                        ...r.content,
                        id: r.id,
                        status: r.status,
                        createdAt: r.created_at
                    }))
                    setReportHistory(mappedReports)
                }
            } catch (error) {
                console.error("Failed to fetch student data:", error)
                // Keep mock data that was initialized in state
                setEvidenceList(MOCK_EVIDENCE.filter(e => e.studentId === student.id))
            } finally {
                setIsLoading(false)
            }
        }
        fetchStudentData()
    }, [studentId])

    const handleSaveAndAnalyze = async () => {
        const selectedGoal = studentGoals.find(g => g.id === selectedObjectiveId)
        const currentObjective = selectedObjectiveId === "custom" ? customObjective : selectedGoal?.objective || ""

        if (!currentObjective) {
            showToast("Please enter a learning objective", "error")
            return
        }

        setIsAnalyzing(true)
        setShowLogForm(false)

        try {
            const newLog = {
                aetDomain: selectedDomains[0] || 'Communication',
                aetCode,
                learningIntention,
                objectiveText: currentObjective,
                outcome,
                difficulty,
                engagementLevel: engagement,
                prompts: selectedPrompts,
                teacherComment: teacherNote,
                teacherId
            }

            // Save log to DB
            const res = await fetch(`/api/students/${studentId}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLog)
            })

            if (!res.ok) throw new Error('Failed to save log')

            const savedLog = await res.json()
            const analysis = analyzeLog(savedLog, student)
            setRecentAnalysis(analysis)
            setAllLogs([savedLog, ...allLogs])
            showToast("Log saved and analyzed successfully", "success")

            // Clear form
            setTeacherNote("")
            setAetCode("")
            setLearningIntention("")
        } catch (error) {
            showToast("Error saving log", "error")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleGetIEPSuggestions = () => {
        setIsSuggestingIEP(true)
        setTimeout(() => {
            const suggestions: IEPSuggestion[] = [
                suggestObjectiveChange("Matching colors Level 1", 92, "Improving"),
                suggestObjectiveChange("Waiting for 2 minutes", 35, "Declining")
            ]
            setIepSuggestions(suggestions)
            setIsSuggestingIEP(false)
        }, 1500)
    }

    // IEP Handlers
    const handleAddGoal = (category: IEPGoal['category']) => {
        setGoalModalMode('add')
        setEditingGoal({
            category,
            goalTitle: "",
            aetCode: "",
            learningIntention: "",
            objectiveSteps: [""],
            level: "Beginner",
            mastery: 0,
            status: "Active",
            version: 1
        })
        setIsGoalModalOpen(true)
    }

    const handleEditGoal = (goal: IEPGoal) => {
        setGoalModalMode('edit')
        setEditingGoal({ ...goal })
        setIsGoalModalOpen(true)
    }

    const handleToggleGoalStatus = (goal: IEPGoal, newStatus: IEPGoal['status']) => {
        const updatedGoal = { ...goal, status: newStatus, lastUpdatedAt: new Date().toISOString() }
        setIepPlans(iepPlans.map(p => p.id === goal.id ? updatedGoal : p))
        showToast(`Goal status updated to ${newStatus}`, "success")
    }

    const handleSaveGoal = async (isSubmit: boolean = false) => {
        if (!editingGoal || !editingGoal.goalTitle) return

        const goalData: IEPGoal = {
            ...editingGoal as IEPGoal,
            id: editingGoal.id || `g${Date.now()}`,
            studentId,
            status: isSubmit ? 'Draft Pending Approval' : (editingGoal.status || 'Active') as any,
            lastUpdatedAt: new Date().toISOString(),
            lastUpdatedBy: "Ms. Sarah"
        }

        try {
            setIepPlans([goalData, ...iepPlans.filter(p => p.id !== goalData.id)])
            showToast(isSubmit ? "Goal Submitted for Approval" : "Goal Progress Updated", "success")
        } catch (error) {
            showToast("Failed to save goal", "error")
        } finally {
            setIsGoalModalOpen(false)
            setEditingGoal(null)
        }
    }

    const handleAiSuggestGoals = (category: IEPGoal['category']) => {
        const suggestions = generateGoalSuggestions(category, student.name)
        // For demo, we just take the first suggestion and open the modal
        setGoalModalMode('add')
        setEditingGoal({
            ...suggestions[0],
            category,
            status: 'Draft',
            version: 1
        })
        setIsGoalModalOpen(true)
    }

    const handleAiBreakdown = () => {
        if (!editingGoal?.goalTitle) return
        const steps = breakDownGoal(editingGoal.goalTitle)
        setEditingGoal({ ...editingGoal, objectiveSteps: steps })
    }

    // Evidence Handlers
    const handleAddEvidence = async () => {
        setIsAnalyzingEvidence(true)
        try {
            const evidenceData = {
                studentId,
                type: newEvidence.type,
                description: newEvidence.description,
                fileUrl: newEvidence.fileUrl,
                linkedCategory: newEvidence.linkedCategory,
                linkedGoalId: newEvidence.linkedGoalId,
                linkedObjectiveText: newEvidence.linkedObjective,
                linkedLogId: newEvidence.linkedLogId,
                addedBy: teacherId
            }

            const res = await fetch('/api/evidence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(evidenceData)
            })

            if (!res.ok) throw new Error('Failed to save evidence')

            // Refetch evidence
            const evRes = await fetch(`/api/evidence?studentId=${studentId}`)
            const evData = await evRes.json()
            const mappedEvidence: Evidence[] = evData.map((e: any) => ({
                id: e.id,
                studentId: e.student_id,
                type: e.type,
                description: e.description,
                date: e.created_at,
                fileUrl: e.file_url,
                linkedGoalId: e.linked_goal_id,
                linkedLogId: e.linked_log_id,
                linkedCategory: e.linked_category,
                linkedObjective: e.linked_objective_text,
                addedBy: "Ms. Sarah",
                tags: e.tags || []
            }))
            setEvidenceList(mappedEvidence)

            setIsAddEvidenceModalOpen(false)
            setNewEvidence({ type: 'photo', description: "", date: new Date().toISOString(), tags: [] })
            showToast("Evidence added successfully", "success")
        } catch (error) {
            console.error("Add evidence error:", error)
            showToast("Failed to add evidence", "error")
        } finally {
            setIsAnalyzingEvidence(false)
        }
    }

    const handleDeleteEvidence = (id: string) => {
        setEvidenceList(evidenceList.filter(e => e.id !== id))
    }

    const handleAnalyzeEvidenceAction = (evidence: Evidence) => {
        setIsAnalyzingEvidence(true)
        setSelectedEvidence(evidence)
        setTimeout(() => {
            const analysis = analyzeEvidence(evidence, student, allLogs, iepPlans)
            setEvidenceAnalysis(analysis)
            setIsAnalyzingEvidence(false)
            setIsEvidencePreviewOpen(true)
        }, 1500)
    }

    const filteredEvidence = evidenceList.filter(e => {
        const matchesSearch = e.description.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
            e.linkedObjective?.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
            e.tags.some(t => t.toLowerCase().includes(evidenceSearch.toLowerCase()))
        const matchesType = evidenceTypeFilter === 'all' || e.type === evidenceTypeFilter
        const matchesCategory = evidenceCategoryFilter === 'all' || e.linkedCategory === evidenceCategoryFilter
        const matchesGoal = evidenceGoalFilter === 'all' || e.linkedGoalId === evidenceGoalFilter

        let matchesDate = true
        if (evidenceDateFilter !== 'all') {
            const now = new Date()
            const evidenceDate = new Date(e.date)
            if (evidenceDateFilter === 'today') {
                matchesDate = evidenceDate.toDateString() === now.toDateString()
            } else if (evidenceDateFilter === 'week') {
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                matchesDate = evidenceDate >= oneWeekAgo
            } else if (evidenceDateFilter === 'month') {
                const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                matchesDate = evidenceDate >= oneMonthAgo
            }
        }

        return matchesSearch && matchesType && matchesCategory && matchesGoal && matchesDate
    })

    const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true)
        setIsReportModalOpen(false)

        try {
            const input: ReportInput = {
                studentName: student.name,
                studentAge: student.age,
                studentProgram: student.diagnosis || 'Autism Support',
                period: reportConfig.period,
                logs: allLogs,
                iepObjectives: iepPlans,
                evidenceCount: evidenceList.length,
                includeSections: reportConfig.sections
            }

            const report = generateProgressReport(input)

            const res = await fetch('/api/reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    title: report.title,
                    content: report
                })
            })

            if (!res.ok) throw new Error('Failed to save report')

            // Refetch reports
            const reportsRes = await fetch(`/api/reports?studentId=${studentId}`)
            const reportsData = await reportsRes.json()
            const mappedReports: ProgressReport[] = reportsData.map((r: any) => ({
                ...r.content,
                id: r.id,
                status: r.status,
                createdAt: r.created_at
            }))
            setReportHistory(mappedReports)

            showToast("AI Draft Generated & Saved", "success")
        } catch (error) {
            console.error("Generate report error:", error)
            showToast("Failed to generate report", "error")
        } finally {
            setIsGeneratingReport(false)
        }
    }

    const handleSaveReport = async (report: ProgressReport) => {
        try {
            const savedReport = { ...report, status: 'Edited' as const }
            // For hackathon: update local state. In production: PATCH /api/reports/[id]
            setReportHistory([savedReport, ...reportHistory.filter(r => r.id !== savedReport.id)])
            setGeneratedReport(null)
            showToast("Report Saved to History", "success")
        } catch (error) {
            showToast("Failed to save report", "error")
        }
    }

    const handleApproveReport = async (report: ProgressReport) => {
        try {
            const res = await fetch('/api/reports/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportId: report.id })
            })

            if (!res.ok) throw new Error('Failed to approve report')

            // Refetch reports
            const reportsRes = await fetch(`/api/reports?studentId=${studentId}`)
            const reportsData = await reportsRes.json()
            const mappedReports: ProgressReport[] = reportsData.map((r: any) => ({
                ...r.content,
                id: r.id,
                status: r.status,
                createdAt: r.created_at
            }))
            setReportHistory(mappedReports)

            showToast("Report Approved and Finalized", "success")
        } catch (error) {
            console.error("Approve report error:", error)
            showToast("Failed to approve report", "error")
        }
    }

    const handleExport = () => {
        setIsExporting(true)
        setTimeout(() => {
            setIsExporting(false)
            showToast("Report Exported as PDF", "info")
        }, 1500)
    }

    const handleRefineSection = async (sectionKey: keyof ProgressReport, currentVal: string) => {
        if (!generatedReport) return
        const refined = refineReportSection(sectionKey, currentVal)
        setGeneratedReport({ ...generatedReport, [sectionKey]: refined, status: 'Edited' } as any)
        showToast("Section Refined with AI", "info")
    }

    const handleGenerateAiPlan = async () => {
        setIsAnalyzing(true)
        try {
            const res = await fetch(`/api/students/${studentId}/plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })

            if (!res.ok) throw new Error('Failed to generate plan')

            const planData = await res.json()
            setRecentAnalysis(prev => prev ? {
                ...prev,
                suggestedPlan: planData
            } : {
                insight: "Plan generated from recent trends.",
                tomorrowPlan: planData.formattedParagraph,
                adjustment: "Plan added.",
                suggestedPlan: planData,
                strengths: [],
                challenges: [],
                regressionAlerts: [],
                dailySummary: "New plan generated."
            })
            showToast("New Plan Generated", "success")
        } catch (error) {
            showToast("Error generating plan", "error")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleApprovePlan = async () => {
        if (!recentAnalysis?.suggestedPlan) return

        const finalPlanText = isEditingPlan ? editedPlanText : recentAnalysis.suggestedPlan.formattedParagraph;

        try {
            const res = await fetch(`/api/students/${studentId}/plan`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: recentAnalysis.suggestedPlan.id,
                    status: isEditingPlan ? 'edited' : 'approved',
                    teacherEdit: isEditingPlan ? finalPlanText : null,
                    approvedBy: teacherId
                })
            })

            if (!res.ok) throw new Error('Failed to approve plan')

            const updatedPlan = await res.json()

            setRecentAnalysis({
                ...recentAnalysis,
                suggestedPlan: {
                    ...recentAnalysis.suggestedPlan,
                    status: updatedPlan.status,
                    isApproved: true,
                    formattedParagraph: finalPlanText
                }
            })
            setIsEditingPlan(false)
            showToast("AI Plan Approved & Locked", "success")
        } catch (error) {
            showToast("Error approving plan", "error")
        }
    }

    const handleRegeneratePlan = () => {
        handleGenerateAiPlan();
        setIsEditingPlan(false);
    }

    const handleToggleEditPlan = () => {
        if (!isEditingPlan && recentAnalysis?.suggestedPlan) {
            setEditedPlanText(recentAnalysis.suggestedPlan.formattedParagraph)
        }
        setIsEditingPlan(!isEditingPlan)
    }

    const handleGenerateWorksheet = (objective: string, aetCode: string = '1.1') => {
        setIsGeneratingWorksheet(true)
        setTimeout(() => {
            const worksheet = generateWorksheet(student, objective, aetCode)
            setActiveWorksheet(worksheet)
            setIsGeneratingWorksheet(false)
            showToast("Worksheet generated successfully", "success")
        }, 1200)
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500 pb-12 relative">
            {/* Worksheet Modal */}
            {activeWorksheet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <CardHeader className="bg-[#63AFA5] text-white py-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText className="h-5 w-5" />
                                        <CardTitle className="text-xl">Student Activity Worksheet</CardTitle>
                                    </div>
                                    <CardDescription className="text-white/80">Personalized for {activeWorksheet.studentName} | AET Code {activeWorksheet.aetCode}</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setActiveWorksheet(null)}>
                                    <XCircle className="h-6 w-6" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-[#63AFA5]" />
                                    Learning Objective
                                </h3>
                                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border-l-4 border-[#63AFA5] text-lg font-medium">
                                    {activeWorksheet.objective}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Visual Sequence steps</h3>
                                <div className="grid gap-4">
                                    {activeWorksheet.visualSteps.map((step, i) => (
                                        <div key={i} className="flex gap-4 items-center group">
                                            <div className="h-10 w-10 rounded-full bg-[#63AFA5]/10 text-[#63AFA5] flex items-center justify-center font-bold shrink-0 border border-[#63AFA5]/20 group-hover:bg-[#63AFA5] group-hover:text-white transition-colors">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 p-4 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-800">
                                                {step}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-blue-700">
                                    <ScrollText className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Teacher Instructions</span>
                                </div>
                                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                                    {activeWorksheet.instructions}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 italic text-[10px] text-slate-400">
                                <span>{activeWorksheet.culturalContext}</span>
                                <span>{activeWorksheet.ageAppropriate ? "Age Appropriate" : "Modified Version"}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
                            <Button variant="outline" onClick={() => setActiveWorksheet(null)}>Close</Button>
                            <Button className="bg-[#63AFA5] hover:bg-[#4A8F86] gap-2">
                                <Download className="h-4 w-4" />
                                Export as PDF
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/teacher/students">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                        <AvatarFallback className="text-xl bg-[#EAF2F1] text-[#63AFA5]">{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
                        <p className="text-sm text-slate-500">{student.diagnosis} • {student.age} Years Old • {student.supportLevel} Support</p>
                    </div>
                </div>
                <div className="flex gap-2 text-xs text-slate-400">
                    Teacher: Ms. Sarah (Assigned)
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start h-12 bg-transparent border-b border-slate-200 rounded-none p-0 gap-8 mb-6 overflow-x-auto no-scrollbar">
                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#63AFA5] data-[state=active]:text-[#63AFA5] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 h-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Overview
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#63AFA5] data-[state=active]:text-[#63AFA5] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 h-full">
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Daily Learning
                    </TabsTrigger>
                    <TabsTrigger value="iep" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#63AFA5] data-[state=active]:text-[#63AFA5] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 h-full">
                        <Flag className="mr-2 h-4 w-4" />
                        IEP & AET
                    </TabsTrigger>
                    <TabsTrigger value="evidence" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#63AFA5] data-[state=active]:text-[#63AFA5] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 h-full">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Evidence
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#63AFA5] data-[state=active]:text-[#63AFA5] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 h-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Reports
                    </TabsTrigger>
                </TabsList>

                {/* 1. AI OVERVIEW */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2 border-[#63AFA5]/20 bg-[#63AFA5]/5 shadow-none overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <BrainCircuit className="h-24 w-24 text-[#63AFA5]" />
                            </div>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2 text-[#63AFA5]">
                                    <Sparkles className="h-5 w-5" />
                                    <CardTitle className="text-lg">Today's AI Summary</CardTitle>
                                </div>
                                <CardDescription className="text-slate-600">Purely synthesized from all learning logs and evidence.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10 text-slate-700">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-900">Synthesized Daily Summary</h4>
                                    <p className="leading-relaxed text-sm">
                                        {recentAnalysis ? recentAnalysis.dailySummary : `${student.name} spent the session working on Visual Matching. They are showing a high success rate (85% mastery). However, AI has detected a pattern where verbal outbursts often occur 15-20 minutes after noisy transitions.`}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/80 rounded-xl border border-[#63AFA5]/10 backdrop-blur-sm">
                                        <span className="text-[10px] font-bold text-[#63AFA5] uppercase tracking-widest">Strengths Detected</span>
                                        <ul className="mt-2 space-y-1">
                                            {recentAnalysis?.strengths.map((s, i) => (
                                                <li key={i} className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                                    <div className="h-1 w-1 bg-[#63AFA5] rounded-full" /> {s}
                                                </li>
                                            )) || <li className="text-sm font-semibold text-slate-900">High engagement with tactile feedback</li>}
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-white/80 rounded-xl border border-amber-100 backdrop-blur-sm">
                                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Challenge Areas</span>
                                        <ul className="mt-2 space-y-1">
                                            {recentAnalysis?.challenges.map((c, i) => (
                                                <li key={i} className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                                    <div className="h-1 w-1 bg-amber-600 rounded-full" /> {c}
                                                </li>
                                            )) || <li className="text-sm font-semibold text-slate-900">Multi-step verbal instructions</li>}
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-4 w-4 text-[#63AFA5]" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Plan for Tomorrow</span>
                                    </div>
                                    <p className="text-sm text-slate-300 italic">
                                        {recentAnalysis ? recentAnalysis.tomorrowPlan : `"Introduce 3D physical blocks instead of 2D cards for sorting to leverage tactile strength. Schedule sensory break immediately after Circle Time."`}
                                    </p>
                                </div>

                                {recentAnalysis?.regressionAlerts && recentAnalysis.regressionAlerts.length > 0 && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl animate-pulse">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Regression Alerts</span>
                                        </div>
                                        <ul className="mt-1 space-y-1">
                                            {recentAnalysis.regressionAlerts.map((a, i) => (
                                                <li key={i} className="text-sm font-medium text-red-900">{a}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {recentAnalysis?.suggestedPlan && (
                                    <div className="mt-8 border-t border-[#63AFA5]/10 pt-6 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-5 bg-[#63AFA5] rounded-full flex items-center justify-center">
                                                    <Sparkles className="h-3 w-3 text-white" />
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-900">
                                                    {recentAnalysis.suggestedPlan.isApproved ? "Official Plan for Tomorrow" : "AI Suggested Plan (Draft)"}
                                                </h4>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-[9px] font-bold uppercase tracking-tight",
                                                    recentAnalysis.suggestedPlan.isApproved
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                                )}
                                            >
                                                {recentAnalysis.suggestedPlan.isApproved ? "Teacher Approved & Locked" : "Pending Teacher Review"}
                                            </Badge>
                                        </div>

                                        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-4">
                                            {isEditingPlan ? (
                                                <textarea
                                                    className="w-full min-h-[100px] p-4 text-sm bg-slate-50 border-2 border-[#63AFA5]/20 rounded-xl focus:border-[#63AFA5] focus:ring-1 focus:ring-[#63AFA5] outline-none transition-all text-slate-800 leading-relaxed font-medium"
                                                    value={editedPlanText}
                                                    onChange={(e) => setEditedPlanText(e.target.value)}
                                                    placeholder="Modify the suggested plan here..."
                                                />
                                            ) : (
                                                <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                                                    "{recentAnalysis.suggestedPlan.formattedParagraph}"
                                                </p>
                                            )}

                                            <div className="pt-2 flex gap-3">
                                                <Button
                                                    size="sm"
                                                    className={cn(
                                                        "h-8 text-xs px-4 transition-all rounded-lg font-bold",
                                                        recentAnalysis.suggestedPlan.isApproved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#63AFA5] hover:bg-[#4d8c83]"
                                                    )}
                                                    onClick={handleApprovePlan}
                                                    disabled={recentAnalysis.suggestedPlan.isApproved || (isEditingPlan && !editedPlanText.trim())}
                                                >
                                                    {recentAnalysis.suggestedPlan.isApproved ? (
                                                        <><CheckCircle2 className="mr-2 h-3 w-3" /> Approved</>
                                                    ) : isEditingPlan ? "Save & Approve" : "Approve Plan"}
                                                </Button>

                                                {!recentAnalysis.suggestedPlan.isApproved && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs border-slate-200 rounded-lg font-bold"
                                                            onClick={handleToggleEditPlan}
                                                        >
                                                            {isEditingPlan ? "Cancel" : <><Edit3 className="mr-2 h-3 w-3" /> Edit</>}
                                                        </Button>

                                                        {!isEditingPlan && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 text-xs border-slate-200 rounded-lg font-bold"
                                                                onClick={handleRegeneratePlan}
                                                            >
                                                                <RefreshCw className="mr-2 h-3 w-3" /> Regenerate
                                                            </Button>
                                                        )}
                                                    </>
                                                )}

                                                {recentAnalysis.suggestedPlan.isApproved && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs border-[#63AFA5] text-[#63AFA5] hover:bg-[#63AFA5]/10 rounded-lg font-bold"
                                                        onClick={() => handleGenerateWorksheet(recentAnalysis.suggestedPlan!.objective, recentAnalysis.suggestedPlan!.aetCode)}
                                                        disabled={isGeneratingWorksheet}
                                                    >
                                                        <Sparkles className="mr-2 h-3 w-3" />
                                                        {isGeneratingWorksheet ? "Generating..." : "Generate Worksheet"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Mastery Trends</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { label: "Communication", val: 40, trend: "+12%" },
                                        { label: "Social Skills", val: 65, trend: "+5%" },
                                        { label: "Academic", val: 82, trend: "+18%" }
                                    ].map(item => (
                                        <div key={item.label} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-600">{item.label}</span>
                                                <span className="font-semibold text-[#63AFA5]">{item.trend}</span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#63AFA5]" style={{ width: `${item.val}%` }} /></div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border-red-100 bg-red-50/20">
                                <CardContent className="pt-6">
                                    <div className="flex gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">Regression Alert</p>
                                            <p className="text-xs text-slate-500 mt-1">Fine motor control has decreased slightly. Suggest checking sleep/diet notes.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="logs" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Daily Learning</h3>
                            <p className="text-sm text-slate-500">Log entries fuel the AI Insight engine.</p>
                        </div>
                        <Button onClick={() => setShowLogForm(true)} className="bg-[#63AFA5] hover:bg-[#4A8F86]">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Log Entry
                        </Button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main History Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {showLogForm && (
                                <Card className="border-[#63AFA5] bg-[#63AFA5]/5 animate-in slide-in-from-top-4 duration-300">
                                    <CardHeader>
                                        <CardTitle className="text-base text-[#63AFA5]">New Learning Log Entry</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Goal Domains</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Communication', 'Social', 'Motor', 'Academic', 'Life Skills'].map(d => (
                                                        <Badge
                                                            key={d}
                                                            variant={selectedDomains.includes(d as any) ? "default" : "outline"}
                                                            className={cn(
                                                                "cursor-pointer",
                                                                selectedDomains.includes(d as any) ? "bg-[#63AFA5]" : "text-slate-500"
                                                            )}
                                                            onClick={() => {
                                                                if (selectedDomains.includes(d as any)) {
                                                                    setSelectedDomains(selectedDomains.filter(item => item !== d))
                                                                } else {
                                                                    setSelectedDomains([...selectedDomains, d as any])
                                                                }
                                                            }}
                                                        >
                                                            {d}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-500">Linked AET Code</label>
                                                        <input
                                                            type="text"
                                                            className="w-full h-10 px-3 rounded-md border text-sm bg-white outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                            placeholder="e.g. 1.1"
                                                            value={aetCode}
                                                            onChange={e => setAetCode(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-500">Learning Intention</label>
                                                        <input
                                                            type="text"
                                                            className="w-full h-10 px-3 rounded-md border text-sm bg-white outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                            placeholder="Granular intention..."
                                                            value={learningIntention}
                                                            onChange={e => setLearningIntention(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Learning Objective</label>
                                                <select
                                                    className="w-full h-10 px-3 rounded-md border text-sm bg-white outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                    value={selectedObjectiveId}
                                                    onChange={(e) => setSelectedObjectiveId(e.target.value)}
                                                >
                                                    {studentGoals.map(g => (
                                                        <option key={g.id} value={g.id}>{g.objective}</option>
                                                    ))}
                                                    <option value="custom">Custom Objective...</option>
                                                </select>
                                                {selectedObjectiveId === "custom" && (
                                                    <input
                                                        type="text"
                                                        placeholder="Enter custom objective title..."
                                                        className="w-full h-10 px-3 mt-2 rounded-md border text-sm bg-white outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                        value={customObjective}
                                                        onChange={(e) => setCustomObjective(e.target.value)}
                                                    />
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Outcome</label>
                                                <div className="flex gap-2">
                                                    {(['Achieved', 'Partial', 'Not Achieved'] as const).map(r => (
                                                        <button
                                                            key={r}
                                                            onClick={() => setOutcome(r)}
                                                            className={cn(
                                                                "flex-1 py-2 text-[10px] font-bold border rounded transition-colors",
                                                                outcome === r ? "bg-[#63AFA5] text-white border-[#63AFA5]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            {r}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Difficulty</label>
                                                <div className="flex gap-2">
                                                    {(['Easy', 'Medium', 'Hard'] as const).map(dt => (
                                                        <button
                                                            key={dt}
                                                            onClick={() => setDifficulty(dt)}
                                                            className={cn(
                                                                "flex-1 py-2 text-[10px] font-bold border rounded transition-colors",
                                                                difficulty === dt ? "bg-[#63AFA5] text-white border-[#63AFA5]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            {dt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Engagement</label>
                                                <div className="flex gap-2">
                                                    {(['Low', 'Medium', 'High'] as const).map(et => (
                                                        <button
                                                            key={et}
                                                            onClick={() => setEngagement(et)}
                                                            className={cn(
                                                                "flex-1 py-2 text-[10px] font-bold border rounded transition-colors",
                                                                engagement === et ? "bg-[#63AFA5] text-white border-[#63AFA5]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            {et}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Prompts Used</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['None', 'Gestural', 'Verbal', 'Physical'].map(p => (
                                                        <Badge
                                                            key={p}
                                                            variant={selectedPrompts.includes(p as any) ? "default" : "outline"}
                                                            className={cn(
                                                                "cursor-pointer",
                                                                selectedPrompts.includes(p as any) ? "bg-[#63AFA5]" : "text-slate-500"
                                                            )}
                                                            onClick={() => {
                                                                if (selectedPrompts.includes(p as any)) {
                                                                    setSelectedPrompts(selectedPrompts.filter(item => item !== p))
                                                                } else {
                                                                    setSelectedPrompts([...selectedPrompts, p as any])
                                                                }
                                                            }}
                                                        >
                                                            {p}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Teacher Note (Observations)</label>
                                            <textarea
                                                className="w-full p-3 rounded-md border text-sm bg-white min-h-[100px] outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                placeholder="Note any specific triggers, reactions, or breakthrough moments..."
                                                value={teacherNote}
                                                onChange={(e) => setTeacherNote(e.target.value)}
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <Button variant="outline" size="sm" className="h-9 text-xs border-dashed border-[#63AFA5]/30 text-[#63AFA5] hover:bg-[#63AFA5]/5 w-full">
                                                <ImageIcon className="mr-2 h-4 w-4" /> Add Photo/PDF Evidence
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2 border-t border-[#63AFA5]/10 pt-4">
                                        <Button variant="ghost" size="sm" onClick={() => setShowLogForm(false)} disabled={isAnalyzing}>Cancel</Button>
                                        <Button
                                            size="sm"
                                            className="bg-[#63AFA5] hover:bg-[#4A8F86]"
                                            onClick={handleSaveAndAnalyze}
                                            disabled={isAnalyzing}
                                        >
                                            {isAnalyzing ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="h-3 w-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                    AI Analyzing...
                                                </span>
                                            ) : "Save & Analyze Today"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}

                            <div className="space-y-4">
                                {allLogs.map((log) => (
                                    <Card key={log.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                        <CardContent className="p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <div className="flex gap-2 mb-1">
                                                        {log.domains.map(d => (
                                                            <span key={d} className="text-[10px] font-bold text-[#63AFA5] bg-[#63AFA5]/10 px-2 py-0.5 rounded-full">{d}</span>
                                                        ))}
                                                        {log.aetCode && (
                                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">AET: {log.aetCode}</span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 group-hover:text-[#63AFA5] transition-colors">{log.objectiveText}</h4>
                                                    {log.learningIntention && (
                                                        <p className="text-xs text-slate-600 italic">Intention: {log.learningIntention}</p>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                                                        {new Date(log.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge
                                                        className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest",
                                                            log.outcome === 'Achieved' ? "bg-emerald-100 text-emerald-700" :
                                                                log.outcome === 'Partial' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                                        )}
                                                    >
                                                        {log.outcome}
                                                    </Badge>
                                                    <div className="flex gap-1">
                                                        <Badge variant="outline" className="text-[9px] h-5 border-slate-100">{log.difficulty}</Badge>
                                                        <Badge variant="outline" className="text-[9px] h-5 border-slate-100">{log.engagementLevel} Engagement</Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-4 py-1 italic mb-4">
                                                "{log.teacherComment}"
                                            </p>

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                                                        Prompts: <span className="text-slate-700">{log.prompts.join(", ")}</span>
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit</Button>
                                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity text-[#63AFA5]">View Detail</Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* AI Sidebar Column */}
                        <div className="space-y-6">
                            <Card className="border-[#63AFA5]/30 bg-white shadow-xl shadow-[#63AFA5]/5 overflow-hidden sticky top-6">
                                <div className="h-1.5 w-full bg-[#63AFA5]" />
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-[#63AFA5]">
                                        <div className="h-8 w-8 rounded-lg bg-[#63AFA5]/10 flex items-center justify-center">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Today's AI Perspective</CardTitle>
                                            <CardDescription className="text-[10px]">Real-time synthesis of latest logs</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-4">
                                    {recentAnalysis ? (
                                        <>
                                            <div className="space-y-2">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synthesis & Insight</h5>
                                                <p className="text-sm text-slate-700 leading-relaxed border-l-2 border-[#63AFA5]/30 pl-3">
                                                    {recentAnalysis.insight}
                                                </p>
                                            </div>

                                            <div className="space-y-3 bg-[#63AFA5]/5 p-4 rounded-xl border border-[#63AFA5]/10">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="text-[10px] font-black text-[#63AFA5] uppercase tracking-widest">Plan for Tomorrow</h5>
                                                    <Badge className="bg-amber-100 text-amber-700 text-[8px] font-bold uppercase tracking-tight">Pending Review</Badge>
                                                </div>
                                                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                                                    "{recentAnalysis.suggestedPlan?.objective} - {recentAnalysis.suggestedPlan?.generatedPlan}"
                                                </p>
                                                <Button
                                                    onClick={() => {
                                                        handleApprovePlan();
                                                        // Move focus to Overview for the final effect
                                                        const overviewTab = document.querySelector('[value="overview"]') as HTMLElement;
                                                        overviewTab?.click();
                                                    }}
                                                    className="w-full bg-[#63AFA5] hover:bg-[#4A8F86] h-8 text-xs font-bold shadow-sm"
                                                >
                                                    Send to AI Overview Approval
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                                                <BrainCircuit className="h-6 w-6 text-slate-200" />
                                            </div>
                                            <p className="text-xs text-slate-400 px-4">Save your first log today to unlock AI insights and tomorrow's plan generation.</p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="bg-slate-50 border-t border-slate-100 py-3">
                                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Based on last 7 days of historical logs
                                    </p>
                                </CardFooter>
                            </Card>

                            <Card className="border-indigo-100 bg-indigo-50/10">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 text-indigo-500">
                                        <MessageSquare className="h-4 w-4" />
                                        <CardTitle className="text-xs font-bold uppercase tracking-wider">Teacher Tip</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[11px] text-indigo-700/80 leading-relaxed font-medium">
                                        Adding evidence (photos) improves the AI's ability to detect subtle fine-motor breakthroughs.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* 3. IEP & AET */}
                <TabsContent value="iep" className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-[#63AFA5]/10 rounded-full flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-[#63AFA5]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">AI Goal Strategy</h3>
                                <p className="text-[10px] text-slate-500 font-medium">Evaluate current achievement trends for adjustments.</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleGetIEPSuggestions}
                            disabled={isSuggestingIEP}
                            className="bg-slate-900 border-none text-[10px] font-bold h-9 px-4 hover:bg-slate-800"
                        >
                            {isSuggestingIEP ? "Analyzing Trends..." : "Analyze Progress Trends"}
                        </Button>
                    </div>

                    {iepSuggestions.length > 0 && (
                        <div className="grid gap-4 animate-in slide-in-from-top-4 duration-500">
                            {iepSuggestions.map((suggestion, i) => (
                                <div key={i} className="p-4 bg-white rounded-xl border border-[#63AFA5]/20 shadow-sm relative overflow-hidden group">
                                    <div className={cn(
                                        "absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-sm",
                                        suggestion.recommendation === 'Advance' ? "bg-emerald-500" : suggestion.recommendation === 'Simplify' ? "bg-amber-500" : "bg-slate-500"
                                    )}>
                                        AI Suggestion: {suggestion.recommendation}
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1 pr-16 md:pr-0">
                                            <h4 className="text-sm font-bold text-slate-900">{suggestion.objective}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed italic pr-4">"{suggestion.reasoning}"</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold">Edit Reasoning</Button>
                                            <Button size="sm" className="h-8 text-[10px] bg-[#63AFA5] font-bold">Accept & Advance</Button>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#63AFA5]" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Suggested Action:</span>
                                        <span className="text-[10px] font-medium text-slate-900">{suggestion.suggestedAction}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <Tabs value={selectedIepCategory} onValueChange={(v: any) => setSelectedIepCategory(v)} className="w-full">
                        <TabsList className="grid grid-cols-4 w-full bg-slate-100/50 p-1 h-12">
                            <TabsTrigger value="Communication" className="text-[10px] font-bold">Communication</TabsTrigger>
                            <TabsTrigger value="Social Interaction" className="text-[10px] font-bold">Social Interaction</TabsTrigger>
                            <TabsTrigger value="Sensory Processing" className="text-[10px] font-bold">Sensory</TabsTrigger>
                            <TabsTrigger value="Independence" className="text-[10px] font-bold">Independence</TabsTrigger>
                        </TabsList>

                        {/* CATEGORY CONTENT */}
                        {(['Communication', 'Social Interaction', 'Sensory Processing', 'Independence'] as const).map(cat => (
                            <TabsContent key={cat} value={cat} className="mt-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-slate-900">{cat} Objectives</h4>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleAiSuggestGoals(cat)} className="h-8 text-[10px] border-[#63AFA5] text-[#63AFA5] hover:bg-[#63AFA5]/5">
                                            <Sparkles className="mr-2 h-3 w-3" /> AI Suggest
                                        </Button>
                                        <Button size="sm" onClick={() => handleAddGoal(cat)} className="h-8 text-[10px] bg-[#63AFA5]">
                                            <Plus className="mr-2 h-3 w-3" /> Add Goal
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {iepPlans.filter(p => p.category === cat).map(goal => (
                                        <Card key={goal.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-slate-900">{goal.goalTitle}</h4>
                                                            <Badge variant="outline" className="text-[9px] border-slate-200">{goal.level}</Badge>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-medium">Last updated {new Date(goal.lastUpdatedAt).toLocaleDateString()} by {goal.lastUpdatedBy}</p>
                                                    </div>
                                                    <Badge
                                                        className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest",
                                                            goal.status === 'Active' || goal.status === 'Approved' ? "bg-emerald-100 text-emerald-700" :
                                                                goal.status === 'Paused' ? "bg-slate-200 text-slate-500" :
                                                                    goal.status === 'Achieved' ? "bg-blue-100 text-blue-700" :
                                                                        goal.status === 'Draft Pending Approval' ? "bg-amber-100 text-amber-700" :
                                                                            goal.status === 'Needs Changes' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                                                        )}
                                                    >
                                                        {goal.status === 'Draft Pending Approval' ? 'Pending Approval' : goal.status}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-3 mb-4">
                                                    {(goal.aetCode || goal.learningIntention) && (
                                                        <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-3 mb-3">
                                                            {goal.aetCode && (
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AET Code</p>
                                                                    <p className="text-xs font-semibold text-[#63AFA5]">{goal.aetCode}</p>
                                                                </div>
                                                            )}
                                                            {goal.learningIntention && (
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Learning Intention</p>
                                                                    <p className="text-xs font-medium text-slate-700 line-clamp-1">{goal.learningIntention}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Objective Steps</p>
                                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                                                        {goal.objectiveSteps.map((step, idx) => (
                                                            <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                                                                <div className="h-1 w-1 rounded-full bg-[#63AFA5]" /> {step}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between w-32">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Mastery</span>
                                                                <span className="text-[10px] font-bold text-[#63AFA5]">{goal.mastery}%</span>
                                                            </div>
                                                            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-[#63AFA5] transition-all" style={{ width: `${goal.mastery}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold" onClick={() => handleEditGoal(goal)}>Edit</Button>
                                                        {goal.status === 'Active' ? (
                                                            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => handleToggleGoalStatus(goal, 'Paused')}>Pause</Button>
                                                        ) : goal.status === 'Paused' ? (
                                                            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleToggleGoalStatus(goal, 'Active')}>Resume</Button>
                                                        ) : null}
                                                        {goal.status !== 'Achieved' && (
                                                            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-[#63AFA5] hover:bg-[#63AFA5]/5" onClick={() => handleToggleGoalStatus(goal, 'Achieved')}>Mark achieved</Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {iepPlans.filter(p => p.category === cat).length === 0 && (
                                        <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                                            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
                                                <FileText className="h-6 w-6 text-slate-200" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400">No goals in this category yet.</p>
                                            <Button variant="link" onClick={() => handleAiSuggestGoals(cat)} className="text-[#63AFA5] text-xs">Try AI Suggestions</Button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    {/* GOAL EDIT MODAL/FORM */}
                    {isGoalModalOpen && editingGoal && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <Card className="w-full max-w-2xl animate-in zoom-in-95 duration-200 shadow-2xl">
                                <CardHeader className="border-b border-slate-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-lg text-slate-900">{goalModalMode === 'add' ? 'Create New Goal' : 'Edit Goal Draft'}</CardTitle>
                                            <CardDescription>Drafting for {editingGoal.category} domain</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsGoalModalOpen(false)}><ArrowRight className="h-4 w-4 rotate-180" /></Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">AET Code (Reference)</label>
                                                <input
                                                    type="text"
                                                    className="w-full h-10 px-3 rounded-md border text-sm outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                    value={editingGoal.aetCode || ''}
                                                    onChange={e => setEditingGoal({ ...editingGoal, aetCode: e.target.value })}
                                                    placeholder="e.g. Communication 1.1"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Learning Intention (Granular)</label>
                                                <textarea
                                                    className="w-full h-20 p-3 rounded-md border text-sm outline-none focus:ring-1 focus:ring-[#63AFA5] resize-none"
                                                    value={editingGoal.learningIntention || ''}
                                                    onChange={e => setEditingGoal({ ...editingGoal, learningIntention: e.target.value })}
                                                    placeholder="Describe the specific outcome intended for the student..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Goal Status</label>
                                                    <Badge variant="outline" className="text-[10px] border-[#63AFA5] text-[#63AFA5]">Editing</Badge>
                                                </div>
                                                <select
                                                    className="w-full h-10 px-3 rounded-md border text-sm bg-white outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                    value={editingGoal.status}
                                                    onChange={e => setEditingGoal({ ...editingGoal, status: e.target.value as any })}
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Paused">Paused</option>
                                                    <option value="Achieved">Achieved</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Level</label>
                                                    <select
                                                        className="w-full h-10 px-3 rounded-md border text-sm bg-white outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                        value={editingGoal.level}
                                                        onChange={e => setEditingGoal({ ...editingGoal, level: e.target.value as any })}
                                                    >
                                                        <option>Beginner</option>
                                                        <option>Intermediate</option>
                                                        <option>Advanced</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Goal Title</label>
                                                    <input
                                                        type="text"
                                                        className="w-full h-10 px-3 rounded-md border text-sm outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                        value={editingGoal.goalTitle}
                                                        onChange={e => setEditingGoal({ ...editingGoal, goalTitle: e.target.value })}
                                                        placeholder="e.g. Social Initiation"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Mastery %</label>
                                                <input
                                                    type="number"
                                                    className="w-full h-10 px-3 rounded-md border text-sm outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                    value={editingGoal.mastery}
                                                    onChange={e => setEditingGoal({ ...editingGoal, mastery: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Objective Steps</label>
                                                    <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold" onClick={() => setEditingGoal({ ...editingGoal, objectiveSteps: [...(editingGoal.objectiveSteps || []), ""] })}>+ Add Step</Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {editingGoal.objectiveSteps?.map((step, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="flex-1 h-9 px-3 rounded-md border text-[11px] outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                                value={step}
                                                                onChange={e => {
                                                                    const newSteps = [...editingGoal.objectiveSteps!];
                                                                    newSteps[idx] = e.target.value;
                                                                    setEditingGoal({ ...editingGoal, objectiveSteps: newSteps });
                                                                }}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 text-slate-300 hover:text-red-500"
                                                                onClick={() => {
                                                                    const newSteps = editingGoal.objectiveSteps!.filter((_, i) => i !== idx);
                                                                    setEditingGoal({ ...editingGoal, objectiveSteps: newSteps });
                                                                }}
                                                            >
                                                                <Plus className="h-3 w-3 rotate-45" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-between p-6">
                                    <Button variant="ghost" onClick={() => setIsGoalModalOpen(false)}>Cancel</Button>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => handleSaveGoal(false)} className="border-slate-300">Save Draft</Button>
                                        <Button onClick={() => handleSaveGoal(true)} className="bg-slate-900 border-none px-6">Submit for Approval</Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    )}

                    <Card className="bg-[#63AFA5]/5 border-[#63AFA5]/20">
                        <CardContent className="py-4 text-[11px] text-[#2D5A54] leading-relaxed">
                            <strong>AI Accountability:</strong> The AlKaramah AI engine evaluates progress trends across these 4 categories every 24 hours. If an objective shows persistent "Hard" results, AI will suggest breaking it down into smaller, micro-steps in the next Report.
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 4. EVIDENCE */}
                <TabsContent value="evidence" className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search evidence, tag or goal..."
                                    className="w-full h-10 pl-9 pr-4 text-xs rounded-md border border-slate-200 bg-slate-50 outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                    value={evidenceSearch}
                                    onChange={e => setEvidenceSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <select
                                    className="h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-[10px] font-bold outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                    value={evidenceTypeFilter}
                                    onChange={e => setEvidenceTypeFilter(e.target.value as any)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="photo">Photos</option>
                                    <option value="video">Videos</option>
                                    <option value="note">Notes</option>
                                    <option value="file">Files</option>
                                </select>
                                <select
                                    className="h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-[10px] font-bold outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                    value={evidenceCategoryFilter}
                                    onChange={e => setEvidenceCategoryFilter(e.target.value as any)}
                                >
                                    <option value="all">All Categories</option>
                                    <option value="Communication">Communication</option>
                                    <option value="Social Skills">Social Skills</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Life Skills">Life Skills</option>
                                </select>
                                <select
                                    className="h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-[10px] font-bold outline-none focus:ring-1 focus:ring-[#63AFA5] max-w-[120px]"
                                    value={evidenceGoalFilter}
                                    onChange={e => setEvidenceGoalFilter(e.target.value)}
                                >
                                    <option value="all">All Goals</option>
                                    {iepPlans.map(p => (
                                        <option key={p.id} value={p.id}>{p.goalTitle}</option>
                                    ))}
                                </select>
                                <select
                                    className="h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-[10px] font-bold outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                    value={evidenceDateFilter}
                                    onChange={e => setEvidenceDateFilter(e.target.value as any)}
                                >
                                    <option value="all">All Dates</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEvidenceAnalysis(analyzeEvidenceBatch(evidenceList, MOCK_LOGS.filter(l => l.studentId === student.id), IEP_PLANS.filter(p => p.studentId === student.id)));
                                    setIsEvidencePreviewOpen(false);
                                    setSelectedEvidence(null);
                                }}
                                className="border-[#63AFA5] text-[#63AFA5] hover:bg-[#63AFA5]/10 h-10 text-xs font-bold px-6"
                            >
                                <BrainCircuit className="mr-2 h-4 w-4" /> AI Analyze All
                            </Button>
                            <Button
                                onClick={() => setIsAddEvidenceModalOpen(true)}
                                className="bg-[#63AFA5] h-10 text-xs font-bold w-full md:w-auto px-6"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Evidence
                            </Button>
                        </div>
                    </div>

                    {/* AI Evidence Insights Dashboard Panel */}
                    {!selectedEvidence && evidenceAnalysis && (
                        <Card className="border-[#63AFA5]/30 bg-white shadow-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="bg-[#63AFA5]/5 p-4 border-b border-[#63AFA5]/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-[#63AFA5] flex items-center justify-center shadow-sm">
                                        <Sparkles className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#2D5A54]">AI Evidence Insights</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">{evidenceAnalysis.explainability}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full" onClick={() => setEvidenceAnalysis(null)}>
                                    <XCircle className="h-4 w-4 text-slate-300" />
                                </Button>
                            </div>
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[8px] font-black uppercase">Strength</Badge>
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 leading-snug">{evidenceAnalysis.strengthDetected}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 block mb-1">AET Reference</span>
                                            <p className="text-[10px] font-bold text-[#63AFA5]">{evidenceAnalysis.linkedAEReference}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[8px] font-black uppercase">Growth Area</Badge>
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 leading-snug">{evidenceAnalysis.challengeDetected}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 block mb-2">Primary Suggestion</span>
                                            <p className="text-xs text-slate-600 italic">"{evidenceAnalysis.suggestion}"</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#63AFA5]/5 p-4 rounded-2xl border border-[#63AFA5]/10">
                                        <h4 className="text-[11px] font-black text-[#2D5A54] uppercase tracking-wider mb-3">Strategies for Tomorrow</h4>
                                        <ul className="space-y-2">
                                            {(evidenceAnalysis.suggestedStrategy || []).map((s, i) => (
                                                <li key={i} className="flex gap-2 text-xs text-[#2D5A54] font-medium leading-tight">
                                                    <div className="h-1 w-1 rounded-full bg-[#63AFA5] mt-1.5 shrink-0" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvidence.map(evidence => (
                            <Card key={evidence.id} className="group overflow-hidden border-slate-100 hover:shadow-lg transition-all flex flex-col">
                                <div className="aspect-video bg-slate-100 relative flex items-center justify-center border-b border-slate-50">
                                    {evidence.type === 'photo' && <ImageIcon className="h-12 w-12 text-slate-200 group-hover:text-[#63AFA5]/20 transition-colors" />}
                                    {evidence.type === 'video' && <Video className="h-12 w-12 text-slate-200 group-hover:text-[#63AFA5]/20 transition-colors" />}
                                    {evidence.type === 'note' && <FileText className="h-12 w-12 text-slate-200 group-hover:text-[#63AFA5]/20 transition-colors" />}
                                    {evidence.type === 'file' && <FileIcon className="h-12 w-12 text-slate-200 group-hover:text-[#63AFA5]/20 transition-colors" />}

                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-white/90 backdrop-blur-sm text-slate-600 text-[9px] font-bold uppercase border-none shadow-sm">{evidence.type}</Badge>
                                    </div>

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-[#2D5A54]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 scale-95 group-hover:scale-100 duration-200">
                                        <Button
                                            size="sm"
                                            className="bg-white text-slate-900 border-none h-8 text-[10px] font-bold"
                                            onClick={() => handleAnalyzeEvidenceAction(evidence)}
                                        >
                                            <Sparkles className="mr-2 h-3 w-3 text-[#63AFA5]" /> AI Analyze
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-4 flex-1 flex flex-col">
                                    <div className="mb-3">
                                        <p className="text-[10px] font-black text-[#63AFA5] uppercase tracking-widest mb-1">
                                            {evidence.type.charAt(0).toUpperCase() + evidence.type.slice(1)} Evidence
                                        </p>
                                        <p className="text-xs font-semibold text-slate-700 leading-relaxed line-clamp-2">
                                            {evidence.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100 text-[8px] font-bold px-1.5 py-0.5">
                                            {evidence.linkedCategory}
                                        </Badge>
                                        {evidence.linkedObjective && (
                                            <Badge className="bg-[#63AFA5]/10 text-[#63AFA5] border-none text-[8px] font-bold px-1.5 py-0.5">
                                                Goal: {evidence.linkedObjective}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400">
                                                {new Date(evidence.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="text-[8px] text-slate-300 font-bold uppercase tracking-tight">
                                                Added by {evidence.addedBy}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-[#63AFA5] hover:bg-slate-50" onClick={() => { setSelectedEvidence(evidence); setIsEvidencePreviewOpen(true); setEvidenceAnalysis(null); }}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-600 hover:bg-slate-50">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteEvidence(evidence.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {filteredEvidence.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                                <ImageIcon className="h-8 w-8 text-slate-200" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">No evidence found</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Try adjusting your search or filters to find what you're looking for.</p>
                            <Button variant="link" onClick={() => { setEvidenceSearch(""); setEvidenceTypeFilter("all"); setEvidenceCategoryFilter("all"); setEvidenceDateFilter("all"); }} className="text-[#63AFA5] text-xs font-bold mt-4 underline">Clear all filters</Button>
                        </div>
                    )}

                    {/* MODAL: ADD EVIDENCE */}
                    {isAddEvidenceModalOpen && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <Card className="w-full max-w-lg animate-in zoom-in-95 duration-200 shadow-2xl">
                                <CardHeader className="border-b border-slate-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-lg text-slate-900">Add New Evidence</CardTitle>
                                            <CardDescription>Upload media to track progress for {student.name}</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsAddEvidenceModalOpen(false)}><XCircle className="h-4 w-4" /></Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {(['photo', 'video', 'note', 'file'] as const).map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={() => setNewEvidence({ ...newEvidence, type })}
                                                            className={cn(
                                                                "flex flex-col items-center justify-center p-2 rounded-lg border text-[9px] font-bold transition-all",
                                                                newEvidence.type === type ? "bg-[#63AFA5]/10 border-[#63AFA5] text-[#63AFA5]" : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                                                            )}
                                                        >
                                                            {type === 'photo' && <ImageIcon className="h-4 w-4 mb-1" />}
                                                            {type === 'video' && <Video className="h-4 w-4 mb-1" />}
                                                            {type === 'note' && <FileText className="h-4 w-4 mb-1" />}
                                                            {type === 'file' && <FileIcon className="h-4 w-4 mb-1" />}
                                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full h-10 px-3 rounded-md border text-sm outline-none focus:ring-1 focus:ring-[#63AFA5] bg-slate-50"
                                                    value={newEvidence.date?.split('T')[0]}
                                                    onChange={e => setNewEvidence({ ...newEvidence, date: new Date(e.target.value).toISOString() })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                                            <textarea
                                                className="w-full p-3 rounded-md border text-sm bg-slate-50 min-h-[80px] outline-none focus:ring-1 focus:ring-[#63AFA5] placeholder:text-slate-300"
                                                placeholder="What does this evidence show?"
                                                value={newEvidence.description}
                                                onChange={e => setNewEvidence({ ...newEvidence, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Linked Category <span className="text-red-500">*</span></label>
                                                <select
                                                    className="w-full h-10 px-3 rounded-md border text-sm bg-slate-50 outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                    value={newEvidence.linkedCategory}
                                                    onChange={e => setNewEvidence({ ...newEvidence, linkedCategory: e.target.value as any, linkedGoalId: undefined, linkedObjective: undefined })}
                                                >
                                                    <option>Communication</option>
                                                    <option>Social Skills</option>
                                                    <option>Academic</option>
                                                    <option>Life Skills</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Linked Goal (Optional)</label>
                                                <select
                                                    className="w-full h-10 px-3 rounded-md border text-sm bg-slate-50 outline-none focus:ring-1 focus:ring-[#63AFA5]"
                                                    value={newEvidence.linkedGoalId || ""}
                                                    onChange={e => {
                                                        const goal = IEP_PLANS.find(g => g.id === e.target.value);
                                                        setNewEvidence({ ...newEvidence, linkedGoalId: e.target.value || undefined, linkedObjective: goal?.goalTitle });
                                                    }}
                                                >
                                                    <option value="">None</option>
                                                    {IEP_PLANS.filter(p => p.studentId === student.id && p.category === (newEvidence.linkedCategory as any)).map(p => (
                                                        <option key={p.id} value={p.id}>{p.goalTitle}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Observable Objective / Milestone (Optional)</label>
                                            <input
                                                type="text"
                                                className="w-full h-10 px-3 rounded-md border text-sm bg-slate-50 outline-none focus:ring-1 focus:ring-[#63AFA5] placeholder:text-slate-300"
                                                placeholder="e.g. Initiated contact, Completed task independently"
                                                value={newEvidence.linkedObjective || ""}
                                                onChange={e => setNewEvidence({ ...newEvidence, linkedObjective: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-between p-6">
                                    <Button variant="ghost" onClick={() => setIsAddEvidenceModalOpen(false)}>Cancel</Button>
                                    <Button
                                        onClick={handleAddEvidence}
                                        disabled={!newEvidence.description}
                                        className="bg-slate-900 border-none px-8"
                                    >
                                        Save Evidence
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}

                    {/* MODAL: EVIDENCE PREVIEW / AI ANALYSIS */}
                    {(isEvidencePreviewOpen && selectedEvidence) && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <Card className="w-full max-w-4xl animate-in zoom-in-95 duration-200 shadow-2xl overflow-hidden max-h-[90vh]">
                                <div className="flex flex-col md:flex-row h-full overflow-y-auto">
                                    {/* Left Content */}
                                    <div className="md:w-1/2 p-6 bg-slate-50 flex flex-col items-center justify-center min-h-[300px] border-b md:border-b-0 md:border-r border-slate-200">
                                        <div className="w-full aspect-square bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center relative overflow-hidden">
                                            {selectedEvidence.type === 'photo' && <ImageIcon className="h-20 w-20 text-slate-100" />}
                                            {selectedEvidence.type === 'video' && <Video className="h-20 w-20 text-slate-100" />}
                                            {selectedEvidence.type === 'note' && <FileText className="h-20 w-20 text-slate-100" />}
                                            {selectedEvidence.type === 'file' && <FileIcon className="h-20 w-20 text-slate-100" />}
                                            <p className="absolute bottom-4 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">{selectedEvidence.type} placeholder</p>
                                        </div>
                                        <div className="mt-4 w-full">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className="bg-slate-200 text-slate-600 font-bold border-none text-[9px] uppercase">{selectedEvidence.linkedCategory}</Badge>
                                                <span className="text-[10px] font-bold text-slate-400">{new Date(selectedEvidence.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{selectedEvidence.description}</p>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {selectedEvidence.tags.map(t => <Badge key={t} variant="outline" className="text-[9px] text-slate-500 bg-white">#{t}</Badge>)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Content: AI Analysis */}
                                    <div className="md:w-1/2 p-8 flex flex-col bg-white">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 bg-[#63AFA5]/10 rounded-full flex items-center justify-center text-[#63AFA5]">
                                                    <Sparkles className="h-4 w-4" />
                                                </div>
                                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">AI Evidence Analysis</h3>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => setIsEvidencePreviewOpen(false)}><XCircle className="h-4 w-4" /></Button>
                                        </div>

                                        {!isAnalyzingEvidence && !evidenceAnalysis ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                                <p className="text-xs font-bold text-slate-400 leading-relaxed">Let AI evaluate this evidence against <br /> the active IEP goal trends.</p>
                                                <Button
                                                    className="bg-slate-900 border-none font-bold text-xs px-8"
                                                    onClick={() => handleAnalyzeEvidenceAction(selectedEvidence)}
                                                >
                                                    Start Analysis
                                                </Button>
                                            </div>
                                        ) : isAnalyzingEvidence ? (
                                            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                                <div className="h-10 w-10 border-4 border-[#63AFA5] border-t-transparent rounded-full animate-spin" />
                                                <p className="text-xs font-bold text-[#63AFA5] animate-pulse">Scanning Visual Context...</p>
                                            </div>
                                        ) : (
                                            <div className="flex-1 space-y-4 animate-in slide-in-from-bottom-4 duration-500 overflow-y-auto pr-2">
                                                <p className="text-[10px] text-slate-400 font-medium mb-4">{evidenceAnalysis?.explainability}</p>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                                                <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                                                            </div>
                                                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Strength</span>
                                                        </div>
                                                        <p className="text-xs text-emerald-900 font-bold leading-tight">{evidenceAnalysis?.strengthDetected}</p>
                                                    </div>

                                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center">
                                                                <AlertCircle className="h-2.5 w-2.5 text-white" />
                                                            </div>
                                                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Growth Area</span>
                                                        </div>
                                                        <p className="text-xs text-amber-900 font-bold leading-tight">{evidenceAnalysis?.challengeDetected}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-[#63AFA5]/5 p-4 rounded-2xl border border-[#63AFA5]/10">
                                                    <h4 className="text-[10px] font-black text-[#2D5A54] uppercase tracking-wider mb-2">Suggested Strategies</h4>
                                                    <ul className="space-y-1.5 mb-3">
                                                        {(evidenceAnalysis?.suggestedStrategy || []).map((s, i) => (
                                                            <li key={i} className="flex gap-2 text-xs text-[#2D5A54] font-medium leading-tight text-[11px]">
                                                                <div className="h-1 w-1 rounded-full bg-[#63AFA5] mt-1.5 shrink-0" />
                                                                {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="pt-2 border-t border-[#63AFA5]/10 mt-2">
                                                        <span className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">AET Context</span>
                                                        <p className="text-[10px] font-bold text-[#63AFA5]">{evidenceAnalysis?.linkedAEReference}</p>
                                                    </div>
                                                </div>

                                                <Card className="border-slate-100 bg-slate-50">
                                                    <CardContent className="p-3">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">AI Recommendation</span>
                                                        <p className="text-xs text-slate-600 italic leading-relaxed font-medium">"{evidenceAnalysis?.suggestion}"</p>
                                                    </CardContent>
                                                </Card>

                                                <div className="pt-4 border-t border-slate-100 flex gap-2">
                                                    <Button className="flex-1 bg-[#63AFA5] h-10 font-bold text-xs" onClick={() => setIsEvidencePreviewOpen(false)}>Update Tomorrow's Plan</Button>
                                                    <Button variant="outline" className="flex-1 h-10 font-bold text-xs" onClick={() => setIsEvidencePreviewOpen(false)}>Dismiss</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                {/* 5. REPORTS */}
                <TabsContent value="reports" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Progress Reports</h3>
                            <p className="text-sm text-slate-500">History of AI-drafted and approved reports for {student.name}.</p>
                        </div>
                        <Button
                            className="bg-[#63AFA5] hover:bg-[#4d8c83] font-bold text-xs h-10 px-6 rounded-xl shadow-lg shadow-[#63AFA5]/20"
                            onClick={() => setIsReportModalOpen(true)}
                        >
                            <Sparkles className="mr-2 h-4 w-4" /> Generate New Report
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {reportHistory.length > 0 ? (
                            reportHistory.map((rep) => (
                                <Card key={rep.id} className="border-slate-100 bg-white hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{rep.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-slate-400 font-bold">{rep.generatedAt}</span>
                                                    <Badge className={cn(
                                                        "text-[9px] font-black tracking-widest px-1.5 h-4",
                                                        rep.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                            rep.status === 'Edited' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                                "bg-blue-50 text-blue-600 border-blue-100"
                                                    )}>
                                                        {rep.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="h-8 text-[10px] font-black" onClick={() => {
                                                setGeneratedReport(rep)
                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                            }}>
                                                <Eye className="h-3.5 w-3.5 mr-1" /> VIEW / EDIT
                                            </Button>
                                            {rep.status === 'Approved' && (
                                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-black text-emerald-600 border-emerald-100 hover:bg-emerald-50" onClick={handleExport}>
                                                    <Download className="h-3.5 w-3.5 mr-1" /> EXPORT PDF
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="border-dashed border-slate-200 bg-slate-50/50 py-12">
                                <CardContent className="flex flex-col items-center justify-center text-center">
                                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                                        <BarChart className="h-8 w-8" />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900">No reports generated yet</h4>
                                    <p className="text-xs text-slate-500 max-w-xs mt-1">Click "Generate New Report" to start synthesizing data for this period.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden group">
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="font-bold">Term-End Synthesis</h4>
                                <p className="text-xs text-slate-400">Run a deep-dive analysis across all domains for the current term.</p>
                            </div>
                            <Button
                                className="bg-[#63AFA5] hover:bg-[#4d8c83] border-none font-bold text-xs h-10 px-6 rounded-xl shadow-lg shadow-black/20"
                                onClick={() => showToast("Term Synthesis is currently in Draft Mode", "info")}
                            >
                                <BrainCircuit className="mr-2 h-4 w-4" /> Start Term Analysis
                            </Button>
                        </div>
                        <div className="absolute top-0 right-0 h-full w-48 bg-teal-500/10 blur-3xl rounded-full group-hover:bg-teal-500/20 transition-colors" />
                    </div>

                    {generatedReport && (
                        <Card className="border-slate-200 animate-in zoom-in-95 duration-500 shadow-xl overflow-hidden mb-8">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            generatedReport.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                generatedReport.status === 'Edited' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    "bg-[#63AFA5]/10 text-[#63AFA5] border-[#63AFA5]/20"
                                        )}>
                                            {generatedReport.status}
                                        </Badge>
                                        <CardTitle className="text-xl font-bold text-slate-900">{generatedReport.title}</CardTitle>
                                    </div>
                                    <CardDescription>Generated on {generatedReport.generatedAt} • Sources: {generatedReport.dataSources.logsUsed} Logs, {generatedReport.dataSources.evidenceUsed} Evidence</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setGeneratedReport(null)}>
                                    <XCircle className="h-5 w-5 text-slate-300" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8 max-h-[600px] overflow-y-auto">
                                <section className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-[#63AFA5] uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="h-4 w-4" /> Student Overview
                                        </h4>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-[#63AFA5] font-black" onClick={() => handleRefineSection('overview', generatedReport.overview)}>REFINE WITH AI</Button>
                                    </div>
                                    <textarea
                                        className="w-full text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#63AFA5] min-h-[80px] resize-none"
                                        value={generatedReport.overview}
                                        onChange={e => setGeneratedReport({ ...generatedReport, overview: e.target.value, status: 'Edited' })}
                                    />
                                </section>

                                <section className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-[#63AFA5] uppercase tracking-widest flex items-center gap-2">
                                            <ScrollText className="h-4 w-4" /> Progress Summary
                                        </h4>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-[#63AFA5] font-black" onClick={() => handleRefineSection('summary', generatedReport.summary)}>REFINE WITH AI</Button>
                                    </div>
                                    <textarea
                                        className="w-full text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#63AFA5] min-h-[100px] resize-none"
                                        value={generatedReport.summary}
                                        onChange={e => setGeneratedReport({ ...generatedReport, summary: e.target.value, status: 'Edited' })}
                                    />
                                </section>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <section className="space-y-4">
                                        <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" /> Key Strengths
                                        </h4>
                                        <div className="space-y-2">
                                            {generatedReport.strengths.map((item: string, i: number) => (
                                                <div key={i} className="flex gap-3 text-sm text-slate-600 items-start">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                                    <input
                                                        className="bg-transparent border-none outline-none w-full"
                                                        value={item}
                                                        onChange={e => {
                                                            const newStrengths = [...generatedReport.strengths]
                                                            newStrengths[i] = e.target.value
                                                            setGeneratedReport({ ...generatedReport, strengths: newStrengths, status: 'Edited' })
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="space-y-4">
                                        <h4 className="text-sm font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" /> Primary Challenges
                                        </h4>
                                        <div className="space-y-2">
                                            {generatedReport.challenges.map((item: string, i: number) => (
                                                <div key={i} className="flex gap-3 text-sm text-slate-600 items-start">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                                    <input
                                                        className="bg-transparent border-none outline-none w-full"
                                                        value={item}
                                                        onChange={e => {
                                                            const newChallenges = [...generatedReport.challenges]
                                                            newChallenges[i] = e.target.value
                                                            setGeneratedReport({ ...generatedReport, challenges: newChallenges, status: 'Edited' })
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <section className="space-y-3">
                                    <h4 className="text-sm font-bold text-[#63AFA5] uppercase tracking-widest flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" /> Evidence Highlights
                                    </h4>
                                    <textarea
                                        className="w-full text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#63AFA5] min-h-[80px] resize-none"
                                        value={generatedReport.evidenceHighlights}
                                        onChange={e => setGeneratedReport({ ...generatedReport, evidenceHighlights: e.target.value, status: 'Edited' })}
                                    />
                                </section>

                                <section className="p-5 bg-[#EAF2F1] rounded-2xl border border-[#63AFA5]/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-[#2D5A54] uppercase tracking-widest tracking-widest">Teacher Recommendations</h4>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-[#2D5A54] font-black" onClick={() => handleRefineSection('recommendations', generatedReport.recommendations)}>REFINE WITH AI</Button>
                                    </div>
                                    <textarea
                                        className="w-full text-sm text-[#2D5A54] leading-relaxed italic bg-transparent border-none outline-none focus:ring-1 focus:ring-[#63AFA5] min-h-[80px] resize-none"
                                        value={generatedReport.recommendations}
                                        onChange={e => setGeneratedReport({ ...generatedReport, recommendations: e.target.value, status: 'Edited' })}
                                    />
                                </section>

                                <section className="space-y-4">
                                    <h4 className="text-sm font-bold text-[#63AFA5] uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" /> Primary Focus for Next Period
                                    </h4>
                                    <div className="space-y-2">
                                        {generatedReport.nextFocus.map((item: string, i: number) => (
                                            <div key={i} className="flex gap-3 text-sm text-slate-600 items-start">
                                                <div className="h-1.5 w-1.5 rounded-full bg-[#63AFA5] mt-1.5 shrink-0" />
                                                <input
                                                    className="bg-transparent border-none outline-none w-full"
                                                    value={item}
                                                    onChange={e => {
                                                        const newFocus = [...generatedReport.nextFocus]
                                                        newFocus[i] = e.target.value
                                                        setGeneratedReport({ ...generatedReport, nextFocus: newFocus, status: 'Edited' })
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileSearch className="h-4 w-4 text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Explainable AI: Source Data</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium"> This report was synthesized using: <strong>{generatedReport.dataSources.logsUsed} Daily Learning Logs</strong>, <strong>{generatedReport.dataSources.evidenceUsed} Evidence Artifacts</strong>, and <strong>{generatedReport.dataSources.goalsRef} Active IEP Goals</strong> from the AlKaramah Assistant platform.</p>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-slate-900 border-t border-slate-800 flex justify-between p-6">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Draft Security: Auto-saved to local context</p>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="text-white border-slate-700 hover:bg-slate-800 h-10 font-black text-[10px]" onClick={() => handleSaveReport(generatedReport)}>SAVE CHANGES</Button>
                                    <Button className="bg-[#63AFA5] border-none h-10 font-black text-[10px]" onClick={() => handleApproveReport(generatedReport)}>APPROVE & FINALIZE</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
            {/* Report Generation Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-md border-none shadow-2xl animate-in zoom-in-95 duration-300">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="h-10 w-10 rounded-xl bg-[#63AFA5]/10 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-[#63AFA5]" />
                                </div>
                                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setIsReportModalOpen(false)}>
                                    <XCircle className="h-5 w-5 text-slate-300" />
                                </Button>
                            </div>
                            <CardTitle className="text-xl font-bold mt-4">Generate AI Report</CardTitle>
                            <CardDescription>Configure the synthesis parameters for {student.name}.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Period</label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-[#63AFA5] outline-none transition-all"
                                    value={reportConfig.period}
                                    onChange={e => setReportConfig({ ...reportConfig, period: e.target.value })}
                                >
                                    <option>Last 7 days</option>
                                    <option>Last 30 days</option>
                                    <option>Term 1 (Interim)</option>
                                    <option>Full Academic Year</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Included Data Sources</label>
                                <div className="space-y-2">
                                    {["Logs", "Evidence", "IEP Goals"].map((item) => (
                                        <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <span className="text-xs font-bold text-slate-700">{item}</span>
                                            <CheckCircle2 className="h-4 w-4 text-[#63AFA5]" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button
                                className="w-full h-12 bg-[#63AFA5] hover:bg-[#4d8c83] font-bold shadow-lg shadow-[#63AFA5]/20 rounded-xl"
                                onClick={handleGenerateReport}
                            >
                                START AI SYNTHESIS
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Toast System */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-[120] animate-in slide-in-from-right-10 duration-500">
                    <div className={cn(
                        "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border text-white font-bold text-sm",
                        toast.type === 'success' ? "bg-emerald-600 border-emerald-500" :
                            toast.type === 'info' ? "bg-slate-900 border-slate-800" :
                                "bg-red-600 border-red-500"
                    )}>
                        {toast.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                        {toast.type === 'info' && <Sparkles className="h-5 w-5" />}
                        {toast.type === 'error' && <AlertCircle className="h-5 w-5" />}
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {isGeneratingReport && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[130] flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="relative mb-8">
                        <div className="h-20 w-20 rounded-full border-4 border-[#63AFA5]/10 border-t-[#63AFA5] animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-[#63AFA5] animate-pulse" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Synthesizing Progress Report</h2>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Analyzing {allLogs.length} logs and {evidenceList.length} evidence artifacts...</p>
                    <div className="max-w-xs w-full bg-slate-100 h-1.5 rounded-full mt-6 overflow-hidden">
                        <div className="h-full bg-[#63AFA5] animate-progress" style={{ width: '60%' }} />
                    </div>
                </div>
            )}
        </div >
    )
}
