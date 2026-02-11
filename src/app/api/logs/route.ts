import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
        return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    try {
        const { data: logs, error } = await supabase
            .from('learning_logs')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(logs)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const supabase = createServerClient()
    try {
        const body = await request.json()
        const {
            studentId,
            aetCode,
            learningIntention,
            domains,
            objectiveId,
            objectiveText,
            outcome,
            difficulty,
            engagement,
            promptsUsed,
            teacherNote,
            createdBy
        } = body

        const { data, error } = await supabase
            .from('learning_logs')
            .insert([
                {
                    student_id: studentId,
                    aet_code: aetCode,
                    learning_intention: learningIntention,
                    domains: domains || [],
                    objective: objectiveText,
                    outcome,
                    difficulty,
                    engagement,
                    prompts: promptsUsed || [],
                    teacher_note: teacherNote,
                    teacher_id: createdBy
                }
            ])
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(data[0])
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
