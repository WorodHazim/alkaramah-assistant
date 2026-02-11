import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { action, teacherComment, editedContent, itemType } = body

        if (!action || !itemType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createServerClient()
        const table = itemType === 'plan' ? 'ai_plans' : 'ai_outputs'

        let updateData: any = {}

        if (action === 'approve') {
            updateData = {
                status: 'approved',
                teacher_comment: teacherComment || null
            }
            if (editedContent) {
                updateData.content_json = editedContent
            }
        } else if (action === 'reject') {
            if (!teacherComment) {
                return NextResponse.json(
                    { error: 'Teacher comment required for rejection' },
                    { status: 400 }
                )
            }
            updateData = {
                status: 'rejected',
                teacher_comment: teacherComment
            }
        }

        const { data, error } = await supabase
            .from(table)
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            item: data
        })

    } catch (error: any) {
        console.error('Approval action error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
