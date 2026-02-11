import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = createServerClient()

    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('id, name, age, support_level, avatar_label, teacher_id')
            .order('name', { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(students || [])
    } catch (error) {
        console.error('Error fetching students:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
