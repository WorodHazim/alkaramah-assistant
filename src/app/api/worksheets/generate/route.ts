import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateWorksheet, StudentProfile } from '@/lib/ai-analyst'

export async function POST(request: Request) {
    const supabase = createServerClient()

    try {
        const body = await request.json()
        const { studentIds, aetCode, objective, promptOverride } = body

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return NextResponse.json({ error: 'studentIds array is required' }, { status: 400 })
        }

        // 1. Fetch all student profiles
        const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .in('id', studentIds)

        if (studentsError) throw studentsError

        // 2. Generate content (using first student as baseline for cultural/age context if multi)
        // In a real production app, you might merge interests or create a group-specific prompt
        const baselineStudent = students[0]
        const mappedStudent: StudentProfile = {
            id: baselineStudent.id,
            name: baselineStudent.name,
            age: baselineStudent.age,
            diagnosis: baselineStudent.diagnosis,
            supportLevel: baselineStudent.support_level,
            communicationLevel: baselineStudent.communication_level,
            preferredLearning: baselineStudent.preferred_learning,
            interests: baselineStudent.interests
        }

        let worksheetContent = generateWorksheet(mappedStudent, objective, aetCode)

        // Add prompt refinement if provided (Simulation)
        if (promptOverride) {
            worksheetContent.instructions += `\nNote: ${promptOverride}`
        }

        // 3. Save to DB
        const { data: savedWorksheet, error: saveError } = await supabase
            .from('worksheets')
            .insert({
                student_ids: studentIds,
                aet_code: aetCode,
                objective: objective,
                prompt_used: promptOverride || 'Default generator',
                generated_content: worksheetContent,
                cultural_context: 'UAE / Emirati',
                age_group: baselineStudent.age < 12 ? 'Primary' : 'Secondary'
            })
            .select()
            .single()

        if (saveError) throw saveError

        return NextResponse.json(savedWorksheet)

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
