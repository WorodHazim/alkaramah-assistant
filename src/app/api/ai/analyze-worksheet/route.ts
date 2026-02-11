import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

type WorksheetType = 'vocabulary' | 'math' | 'matching'
type SupportLevel = 'Low' | 'Medium' | 'High'

interface AnalysisRequest {
    studentId: string
    correct: number
    total: number
    worksheetType: WorksheetType
}

export async function POST(req: NextRequest) {
    try {
        const body: AnalysisRequest = await req.json()
        const { studentId, correct, total, worksheetType } = body

        if (!studentId || correct === undefined || !total || !worksheetType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const accuracy = Math.round((correct / total) * 100)

        let supportLevel: SupportLevel
        if (accuracy >= 80) supportLevel = 'Low'
        else if (accuracy >= 50) supportLevel = 'Medium'
        else supportLevel = 'High'

        const aetDomainMap: Record<WorksheetType, string> = {
            vocabulary: 'Communication',
            math: 'Cognition',
            matching: 'Visual Processing'
        }
        const aetDomain = aetDomainMap[worksheetType]

        let strengths: string
        let weaknesses: string
        let recommendation: string
        let goalText: string

        if (accuracy >= 80) {
            strengths = 'Strong independent performance with minimal support needed'
            weaknesses = 'Minor refinement opportunities in advanced concepts'
            recommendation = 'Progress to next complexity level with reduced scaffolding'
            goalText = `Advance ${worksheetType} skills to next AET stage with independent practice and peer collaboration opportunities.`
        } else if (accuracy >= 50) {
            strengths = 'Demonstrates foundational understanding with moderate support'
            weaknesses = 'Requires additional practice and visual supports'
            recommendation = 'Maintain current level with increased visual aids and structured practice'
            goalText = `Strengthen ${worksheetType} skills through targeted visual supports and structured 1:1 sessions, focusing on ${aetDomain.toLowerCase()} development.`
        } else {
            strengths = 'Shows engagement and willingness to participate'
            weaknesses = 'Significant gaps in foundational concepts requiring intensive support'
            recommendation = 'Implement intensive intervention with multi-sensory approaches'
            goalText = `Provide intensive structured intervention for ${worksheetType} using multi-sensory approaches, high visual supports, and frequent reinforcement aligned with ${aetDomain} AET framework.`
        }

        const supabase = createServerClient()

        await supabase
            .from('students')
            .update({ support_level: supportLevel })
            .eq('id', studentId)

        const { data: student } = await supabase
            .from('students')
            .select('name')
            .eq('id', studentId)
            .single()

        await supabase
            .from('iep_goals')
            .insert({
                student_id: studentId,
                category: aetDomain === 'Communication' ? 'Communication' :
                    aetDomain === 'Cognition' ? 'Academic' : 'Academic',
                title: `${worksheetType.charAt(0).toUpperCase() + worksheetType.slice(1)} Skill Development - AI Generated`,
                objectives: JSON.stringify([
                    'Complete structured practice sessions',
                    'Demonstrate skill improvement',
                    'Generalize skills across contexts',
                    'Achieve independence with minimal prompts'
                ]),
                status: 'Draft Pending Approval',
                mastery_percent: accuracy
            })

        return NextResponse.json({
            accuracy,
            supportLevel,
            aetDomain,
            strengths,
            weaknesses,
            recommendation,
            goalGenerated: true,
            studentName: student?.name || 'Student'
        })

    } catch (error: any) {
        console.error('Worksheet analysis error:', error)
        return NextResponse.json(
            { error: error.message || 'Analysis failed' },
            { status: 500 }
        )
    }
}
