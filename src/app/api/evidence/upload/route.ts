import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const studentId = formData.get('studentId') as string
        const description = formData.get('description') as string
        const type = formData.get('type') as string

        if (!file || !studentId || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const supabase = createServerClient()

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${studentId}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json(
                { error: uploadError.message },
                { status: 500 }
            )
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('evidence')
            .getPublicUrl(fileName)

        // Save evidence record
        const { data: evidence, error: dbError } = await supabase
            .from('evidence')
            .insert({
                student_id: studentId,
                type: type || 'file',
                description,
                file_url: publicUrl
            })
            .select()
            .single()

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            evidence,
            fileUrl: publicUrl
        })

    } catch (error: any) {
        console.error('File upload error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
