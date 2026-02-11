import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    if (!teacherId) {
        return NextResponse.json({ error: 'teacherId is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('id, name, age, support_level, avatar_label')
            .eq('teacher_id', teacherId)
            .order('name', { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(students || [])
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
