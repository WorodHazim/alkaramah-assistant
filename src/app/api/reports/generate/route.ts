import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { studentId, title, content } = body

        if (!studentId || !title || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: studentId, title, content' },
                { status: 400 }
            )
        }

        // Try Supabase first
        const supabaseUrl = process.env.SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (supabaseUrl && supabaseUrl.startsWith('https://') && !supabaseUrl.includes('placeholder') && serviceKey && !serviceKey.includes('placeholder')) {
            try {
                const { createServerClient } = await import('@/lib/supabase/server')
                const supabase = createServerClient()

                const { data, error } = await supabase
                    .from('reports')
                    .insert([{ student_id: studentId, title, content, status: 'AI Draft' }])
                    .select()

                if (error) {
                    console.error('Supabase reports insert error:', error.message)
                    return NextResponse.json({ error: error.message }, { status: 500 })
                }

                return NextResponse.json(data?.[0] || { id: crypto.randomUUID(), student_id: studentId, title, status: 'AI Draft' })
            } catch (dbError: any) {
                console.warn('Supabase unavailable for reports, using demo fallback:', dbError.message)
            }
        }

        // Demo fallback: return a mock saved report
        return NextResponse.json({
            id: crypto.randomUUID(),
            student_id: studentId,
            title,
            content,
            status: 'AI Draft',
            created_at: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('Report generate error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
