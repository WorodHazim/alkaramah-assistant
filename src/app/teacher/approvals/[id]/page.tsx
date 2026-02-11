"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Edit3, ArrowLeft, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [id, setId] = useState<string>('')
    const [itemType, setItemType] = useState<string>('')
    const [content, setContent] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [teacherComment, setTeacherComment] = useState('')
    const [showRejectForm, setShowRejectForm] = useState(false)

    useEffect(() => {
        params.then(p => {
            setId(p.id)
            setItemType(searchParams.get('type') || 'plan')
        })
    }, [params, searchParams])

    useEffect(() => {
        if (id && itemType) {
            fetchItem()
        }
    }, [id, itemType])

    const fetchItem = async () => {
        try {
            const table = itemType === 'plan' ? 'ai_plans' : 'ai_outputs'
            const res = await fetch(`/api/${table}/${id}`)
            const data = await res.json()
            setContent(data.content_json)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAction = async (action: 'approve' | 'reject') => {
        if (action === 'reject' && !teacherComment.trim()) {
            alert('Please provide a comment for rejection')
            return
        }

        setIsProcessing(true)
        try {
            const res = await fetch(`/api/approvals/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    teacherComment: teacherComment || null,
                    itemType
                })
            })

            if (res.ok) {
                router.push('/teacher/approvals')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsProcessing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#63AFA5]" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/teacher/approvals">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <PageHeader
                    title="Review AI-Generated Content"
                    subtitle="Approve, reject, or edit before finalizing"
                    className="px-0"
                />
            </div>

            <Card className="border-2 border-[#63AFA5]/20">
                <CardHeader className="bg-gradient-to-r from-[#EAF2F1] to-white">
                    <CardTitle>{content?.title || 'Generated Content'}</CardTitle>
                    {content?.aetCodes && (
                        <div className="flex gap-2 mt-2">
                            {content.aetCodes.map((code: string) => (
                                <Badge key={code} variant="secondary" className="bg-blue-100 text-blue-700">
                                    AET {code}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {content?.objectives && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Learning Objectives</h3>
                            {content.objectives.map((obj: any, idx: number) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex items-start gap-2 mb-2">
                                        <Badge className="bg-[#63AFA5] text-white">
                                            AET {obj.aetCode}
                                        </Badge>
                                        <span className="font-medium">{obj.learningIntention}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2">{obj.activity}</p>
                                    <div className="text-sm space-y-1">
                                        <p><strong>Steps:</strong></p>
                                        <ol className="list-decimal list-inside space-y-1 text-slate-600">
                                            {obj.steps?.map((step: string, i: number) => (
                                                <li key={i}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                    <p className="text-sm mt-2"><strong>Success:</strong> {obj.successCriteria}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {content?.reasoning && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">AI Reasoning</h4>
                            <p className="text-sm text-blue-700">{content.reasoning}</p>
                        </div>
                    )}

                    {content?.materials && (
                        <div>
                            <h4 className="font-semibold mb-2">Materials Needed</h4>
                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                {content.materials.map((m: string, i: number) => (
                                    <li key={i}>{m}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!showRejectForm ? (
                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                onClick={() => handleAction('approve')}
                                disabled={isProcessing}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                            <Button
                                onClick={() => setShowRejectForm(true)}
                                disabled={isProcessing}
                                variant="outline"
                                className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-4 border-t">
                            <label className="block text-sm font-medium text-slate-700">
                                Rejection Reason (Required)
                            </label>
                            <textarea
                                value={teacherComment}
                                onChange={(e) => setTeacherComment(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 p-3 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                                rows={3}
                                placeholder="Explain why this content needs revision..."
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleAction('reject')}
                                    disabled={isProcessing || !teacherComment.trim()}
                                    className="bg-rose-600 hover:bg-rose-700"
                                >
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                    Confirm Rejection
                                </Button>
                                <Button
                                    onClick={() => setShowRejectForm(false)}
                                    variant="outline"
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
