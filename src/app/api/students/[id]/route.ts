import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: studentId } = await params
    const supabase = createServerClient()

    try {
        // 1. Fetch basic student profile
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single()

        if (studentError || !student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        // 2. Fetch latest AI plan draft
        const { data: latestPlan } = await supabase
            .from('ai_plans')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        // 3. Fetch last 5 learning logs
        const { data: recentLogs } = await supabase
            .from('learning_logs')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })
            .limit(5)

        // 4. Fetch evidence summary counts by type
        const { data: evidenceItems } = await supabase
            .from('evidence')
            .select('type')
            .eq('student_id', studentId)

        const evidenceCounts = (evidenceItems || []).reduce((acc: Record<string, number>, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1
            return acc
        }, {})

        // 5. Fetch all IEP goals (for overview/context)
        const { data: goals } = await supabase
            .from('iep_goals')
            .select('*')
            .eq('student_id', studentId)

        return NextResponse.json({
            student,
            latestPlan: latestPlan || null,
            recentLogs: recentLogs || [],
            evidenceSummary: {
                total: evidenceItems?.length || 0,
                counts: evidenceCounts
            },
            goals: goals || []
        })
    } catch (error) {
        console.error('Student fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
