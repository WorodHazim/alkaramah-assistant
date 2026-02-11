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
        const { data: evidence, error } = await supabase
            .from('evidence')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(evidence)
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
            type,
            description,
            fileUrl,
            linkedCategory,
            linkedGoalId,
            linkedObjectiveText,
            linkedLogId,
            addedBy
        } = body

        const { data, error } = await supabase
            .from('evidence')
            .insert([
                {
                    student_id: studentId,
                    type,
                    description,
                    file_url: fileUrl,
                    linked_category: linkedCategory,
                    linked_goal_id: linkedGoalId,
                    linked_objective_text: linkedObjectiveText,
                    linked_log_id: linkedLogId,
                    added_by: addedBy
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
