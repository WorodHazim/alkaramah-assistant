import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createServerClient()
    try {
        const body = await request.json()
        const { planId, approvedBy, editedValue } = body

        if (!planId || !approvedBy) {
            return NextResponse.json({ error: 'planId and approvedBy are required' }, { status: 400 })
        }

        // Fetch current plan to merge content if editedValue is present
        let updatedContent = null;
        if (editedValue) {
            const { data: currentPlan, error: fetchError } = await supabase
                .from('ai_plans')
                .select('content')
                .eq('id', planId)
                .single()

            if (fetchError) {
                return NextResponse.json({ error: 'Failed to fetch plan for editing' }, { status: 404 })
            }

            updatedContent = { ...currentPlan.content, formattedParagraph: editedValue }
        }

        const updatePayload: any = {
            status: 'Teacher Approved',
            approved_by: approvedBy,
            approved_at: new Date().toISOString()
        }

        if (updatedContent) {
            updatePayload.content = updatedContent
        }

        const { data, error } = await supabase
            .from('ai_plans')
            .update(updatePayload)
            .eq('id', planId)
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
        }

        return NextResponse.json(data[0])
    } catch (error) {
        console.error('Approve plan error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
