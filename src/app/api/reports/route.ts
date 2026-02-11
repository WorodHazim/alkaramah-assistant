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
        const { data: reports, error } = await supabase
            .from('reports')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(reports)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
