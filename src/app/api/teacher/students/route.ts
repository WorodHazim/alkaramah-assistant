import { NextRequest, NextResponse } from 'next/server'

// Hardcoded demo students for hackathon fallback
const DEMO_STUDENTS = [
    {
        id: 'a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d',
        name: 'Ahmed Al-Mansouri',
        age: 8,
        support_level: 'Medium',
        avatar_label: 'AM'
    },
    {
        id: 'b1c2d3e4-f5a6-4b1c-8d7e-0f1a2b3c4d5e',
        name: 'Layla Hassan',
        age: 7,
        support_level: 'Low',
        avatar_label: 'LH'
    },
    {
        id: 'c1d2e3f4-a5b6-4c1d-8e7f-1f2a3b4c5d6e',
        name: 'Zayed Al-Nahyan',
        age: 9,
        support_level: 'High',
        avatar_label: 'ZA'
    },
    {
        id: 'd1e2f3a4-b5c6-4d1e-8f7a-2f3a4b5c6d7e',
        name: 'Emily Smith',
        age: 8,
        support_level: 'Low',
        avatar_label: 'ES'
    }
]

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    if (!teacherId) {
        return NextResponse.json({ error: 'teacherId is required' }, { status: 400 })
    }

    // Try Supabase first, fall back to demo data
    try {
        const supabaseUrl = process.env.SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseUrl.startsWith('https://') || supabaseUrl.includes('placeholder')) {
            // No real Supabase configured — return demo data
            return NextResponse.json(DEMO_STUDENTS)
        }

        const { createServerClient } = await import('@/lib/supabase/server')
        const supabase = createServerClient()

        const { data: students, error } = await supabase
            .from('students')
            .select('id, name, age, support_level, avatar_label')
            .eq('teacher_id', teacherId)
            .order('name', { ascending: true })

        if (error) {
            console.warn('Supabase query failed, using demo data:', error.message)
            return NextResponse.json(DEMO_STUDENTS)
        }

        // If DB is empty, return demo data for the hackathon
        if (!students || students.length === 0) {
            return NextResponse.json(DEMO_STUDENTS)
        }

        return NextResponse.json(students)
    } catch (error) {
        // Any connection error → graceful fallback
        console.warn('Supabase unavailable, using demo data')
        return NextResponse.json(DEMO_STUDENTS)
    }
}
