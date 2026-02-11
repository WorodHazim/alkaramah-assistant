import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateTomorrowPlan, LogEntry, StudentProfile } from '@/lib/ai-analyst'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = createServerClient()

    try {
        const { data, error } = await supabase
            .from('ai_plans')
            .select('*')
            .eq('student_id', id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') throw error

        return NextResponse.json(data || null)
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
        // 1. Fetch student profile
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single()

        if (studentError) throw studentError

        // 2. Fetch latest log
        const { data: log, error: logError } = await supabase
            .from('learning_logs')
            .select('*')
            .eq('student_id', id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (logError && logError.code !== 'PGRST116') throw logError

        if (!log) {
            return NextResponse.json({ error: 'No logs found to generate plan from' }, { status: 400 })
        }

        // Map database log to LogEntry interface
        const mappedLog: LogEntry = {
            id: log.id,
            studentId: log.student_id,
            createdAt: log.created_at,
            aetDomain: log.aet_domain,
            aetCode: log.aet_code,
            learningIntention: log.learning_intention,
            objectiveText: log.objective,
            outcome: log.outcome,
            difficulty: log.difficulty,
            engagementLevel: log.engagement_level,
            prompts: log.prompts,
            domains: log.domains,
            teacherComment: log.teacher_comment
        }

        // Map database student to StudentProfile interface
        const mappedStudent: StudentProfile = {
            id: student.id,
            name: student.name,
            age: student.age,
            diagnosis: student.diagnosis,
            supportLevel: student.support_level,
            communicationLevel: student.communication_level,
            preferredLearning: student.preferred_learning,
            interests: student.interests
        }

        // 3. Generate plan
        const plan = generateTomorrowPlan(mappedLog, mappedStudent)

        // 4. Save to DB
        const { data: savedPlan, error: saveError } = await supabase
            .from('ai_plans')
            .insert({
                student_id: id,
                generated_plan: plan.generatedPlan,
                status: 'pending'
            })
            .select()
            .single()

        if (saveError) throw saveError

        // Merge for frontend compatibility
        return NextResponse.json({
            ...savedPlan,
            formattedParagraph: plan.formattedParagraph,
            objective: plan.objective,
            aetCode: plan.aetCode,
            isApproved: false
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = createServerClient()

    try {
        const body = await request.json()
        const { planId, status, teacherEdit, approvedBy } = body

        if (!planId) {
            return NextResponse.json({ error: 'planId is required' }, { status: 400 })
        }

        const updatePayload: any = {
            status,
            teacher_edit: teacherEdit,
            approved_by: approvedBy,
            approved_at: status === 'approved' ? new Date().toISOString() : null
        }

        const { data, error } = await supabase
            .from('ai_plans')
            .update(updatePayload)
            .eq('id', planId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
