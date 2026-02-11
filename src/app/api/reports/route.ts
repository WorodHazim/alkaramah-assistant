import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
        return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
    }

    // Try Supabase first
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseUrl.startsWith('https://') && !supabaseUrl.includes('placeholder') && serviceKey && !serviceKey.includes('placeholder')) {
        try {
            const { createServerClient } = await import('@/lib/supabase/server')
            const supabase = createServerClient()

            const { data: reports, error } = await supabase
                .from('reports')
                .select('*')
                .eq('student_id', studentId)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Supabase reports query error:', error.message)
                return NextResponse.json([])
            }

            return NextResponse.json(reports || [])
        } catch (dbError: any) {
            console.warn('Supabase unavailable for reports GET:', dbError.message)
        }
    }

    // Demo fallback: return empty array
    return NextResponse.json([])
}
