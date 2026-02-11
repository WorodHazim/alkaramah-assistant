import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const teacherId = searchParams.get('teacherId')

        if (!teacherId) {
            return NextResponse.json({ error: 'teacherId required' }, { status: 400 })
        }

        const supabase = createServerClient()

        // Fetch pending AI plans
        const { data: plans } = await supabase
            .from('ai_plans')
            .select(`
                *,
                students (
                    id,
                    name,
                    age
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        // Fetch pending AI outputs
        const { data: outputs } = await supabase
            .from('ai_outputs')
            .select(`
                *,
                students (
                    id,
                    name,
                    age
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        const pendingItems = [
            ...(plans || []).map(p => ({
                id: p.id,
                type: 'plan',
                studentId: p.student_id,
                studentName: p.students?.name,
                studentAge: p.students?.age,
                createdAt: p.created_at,
                content: p.content_json
            })),
            ...(outputs || []).map(o => ({
                id: o.id,
                type: o.type,
                studentId: o.student_id,
                studentName: o.students?.name,
                studentAge: o.students?.age,
                createdAt: o.created_at,
                content: o.content_json
            }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return NextResponse.json(pendingItems)

    } catch (error: any) {
        console.error('Approvals fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
