import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = createServerClient()
    try {
        const body = await request.json()
        const { reportId } = body

        if (!reportId) {
            return NextResponse.json({ error: 'reportId is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('reports')
            .update({ status: 'Approved' })
            .eq('id', reportId)
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(data[0])
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
