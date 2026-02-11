"use client"

import { useState } from "react"
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"

interface AIGenerateButtonProps {
    studentId: string
    studentName: string
    outputType?: 'plan' | 'worksheet' | 'social_story' | 'visual_schedule'
    language?: 'en' | 'ar' | 'bilingual'
    onSuccess?: (result: any) => void
    className?: string
}

export function AIGenerateButton({
    studentId,
    studentName,
    outputType = 'plan',
    language = 'en',
    onSuccess,
    className
}: AIGenerateButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleGenerate = async () => {
        setIsGenerating(true)
        setError(null)
        setResult(null)

        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    requestedOutput: outputType,
                    language
                })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Generation failed')
            }

            const data = await res.json()
            setResult(data)
            onSuccess?.(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsGenerating(false)
        }
    }

    const getButtonText = () => {
        if (outputType === 'plan') return 'Generate Daily Plan'
        if (outputType === 'worksheet') return 'Generate Worksheet'
        if (outputType === 'social_story') return 'Generate Social Story'
        return 'Generate Visual Schedule'
    }

    return (
        <div className="space-y-4">
            <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={className || "bg-[#63AFA5] hover:bg-[#4A8F86]"}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        AI is analyzing {studentName}...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {getButtonText()}
                    </>
                )}
            </Button>

            {result && (
                <Card className="border-2 border-emerald-200 bg-emerald-50 animate-in slide-in-from-bottom-4">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-semibold">
                                {outputType === 'plan' ? 'Daily Plan' : 'Content'} generated successfully!
                            </span>
                        </div>
                        <p className="text-sm text-emerald-600 mt-2">
                            Sent to Approvals for review. Check the Approvals tab to review and approve.
                        </p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-2 border-rose-200 bg-rose-50">
                    <CardContent className="pt-6">
                        <p className="text-sm text-rose-700">Error: {error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
