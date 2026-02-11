import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = createServerClient()

    try {
        const { data, error } = await supabase
            .from('learning_logs')
            .select('*')
            .eq('student_id', id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = createServerClient()

    try {
        const body = await request.json()
        const {
            aetDomain,
            aetCode,
            learningIntention,
            objectiveText,
            outcome,
            difficulty,
            engagementLevel,
            prompts,
            teacherComment,
            teacherId
        } = body

        const { data, error } = await supabase
            .from('learning_logs')
            .insert({
                student_id: id,
                aet_domain: aetDomain,
                aet_code: aetCode,
                learning_intention: learningIntention,
                objective: objectiveText,
                outcome,
                difficulty,
                engagement_level: engagementLevel,
                prompts,
                teacher_comment: teacherComment,
                teacher_id: teacherId
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
