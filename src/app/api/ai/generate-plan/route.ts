import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createServerClient()
    try {
        const body = await request.json()
        const { studentId, teacherId } = body

        if (!studentId || !teacherId) {
            return NextResponse.json({ error: 'studentId and teacherId are required' }, { status: 400 })
        }

        // 1. Fetch context
        const { data: student } = await supabase.from('students').select('*').eq('id', studentId).single()
        const { data: logs } = await supabase.from('learning_logs').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(7)
        const { data: goals } = await supabase.from('iep_goals').select('*').eq('student_id', studentId).eq('status', 'Approved')
        const { data: evidence } = await supabase.from('evidence').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(7)

        // 2. Mock AI Logic
        let nextObjective = "Continuing current goals"
        let strategy = "Use visual supports as usual"
        const lastLog = logs?.[0]

        if (lastLog) {
            if (lastLog.outcome === 'Not Achieved') {
                nextObjective = `Simplify steps for: ${lastLog.objective}`
                strategy = "Break down tasks into smaller sub-steps with high-frequency reinforcement."
            } else if (lastLog.outcome === 'Partially Achieved' || lastLog.outcome === 'Emerging') {
                nextObjective = `Reinforce: ${lastLog.objective}`
                strategy = "Repeat activity with increased sensory support and verbal prompts."
            } else if (lastLog.outcome === 'Achieved') {
                // Find next goal or step
                nextObjective = `Progress to next level for: ${lastLog.objective}`
                strategy = "Increase independence by fading prompts and introducing slight variations."
            }
        }

        const planContent = {
            objective: nextObjective,
            supportStrategy: strategy,
            materialsNeeded: ["Visual Schedule", "Token Board", "UAE Icon Set"],
            formattedParagraph: `Based on the latest data where Ahmed was ${lastLog?.outcome || 'making progress'}, the plan for tomorrow focuses on ${nextObjective}. We will use ${strategy} to maximize engagement.`
        }

        // 3. Save to DB
        const { data, error } = await supabase
            .from('ai_plans')
            .insert([
                {
                    student_id: studentId,
                    content: planContent,
                    status: 'Draft'
                }
            ])
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({
            planId: data[0].id,
            content: data[0].content,
            status: data[0].status
        })
    } catch (error) {
        console.error('Generate plan error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
