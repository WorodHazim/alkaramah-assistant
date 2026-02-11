import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

type OutputType = 'plan' | 'worksheet' | 'social_story' | 'visual_schedule'

interface GenerateRequest {
    studentId: string
    requestedOutput: OutputType
    language?: 'en' | 'ar' | 'bilingual'
}

export async function POST(req: NextRequest) {
    try {
        const body: GenerateRequest = await req.json()
        const { studentId, requestedOutput, language = 'en' } = body

        if (!studentId || !requestedOutput) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const supabase = createServerClient()

        // Fetch student context
        const { data: student } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single()

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        // Fetch recent learning logs
        const { data: logs } = await supabase
            .from('learning_logs')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })
            .limit(5)

        // Fetch evidence summary
        const { data: evidence } = await supabase
            .from('evidence')
            .select('type, description, related_aet_code, created_at')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })
            .limit(5)

        // Fetch active IEP goals
        const { data: goals } = await supabase
            .from('iep_goals')
            .select('*')
            .eq('student_id', studentId)
            .eq('status', 'Approved')

        // Fetch relevant AET codes
        const aetCodes = [...new Set(logs?.map(l => l.aet_code).filter(Boolean) || [])]
        const { data: aetFramework } = await supabase
            .from('aet_framework')
            .select('*')
            .in('code', aetCodes)

        // Build context for LLM
        const context = {
            student: {
                name: student.name,
                age: student.age,
                diagnosis: student.diagnosis,
                supportLevel: student.support_level,
                communicationLevel: student.communication_level,
                preferredLearning: student.preferred_learning,
                interests: student.interests
            },
            recentLogs: logs?.map(l => ({
                date: l.created_at,
                aetCode: l.aet_code,
                activity: l.objective,
                outcome: l.outcome,
                teacherComment: l.teacher_comment
            })),
            evidence: evidence?.map(e => ({
                type: e.type,
                description: e.description,
                aetCode: e.related_aet_code
            })),
            activeGoals: goals?.map(g => ({
                category: g.category,
                title: g.title,
                mastery: g.mastery_percent
            })),
            aetFramework: aetFramework?.map(a => ({
                code: a.code,
                domain: a.domain,
                intention: a.learning_intention
            }))
        }

        // Generate appropriate prompt based on output type
        const prompt = buildPrompt(requestedOutput, context, language)

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert special education teacher specializing in autism support and the AET (Autism Education Trust) framework. Generate practical, classroom-ready materials that are low-arousal, visual, and autism-friendly.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
        })

        const generatedContent = JSON.parse(completion.choices[0].message.content || '{}')

        // Save to appropriate table
        if (requestedOutput === 'plan') {
            const { data: savedPlan } = await supabase
                .from('ai_plans')
                .insert({
                    student_id: studentId,
                    status: 'pending',
                    content_json: generatedContent,
                    aet_codes: aetCodes
                })
                .select()
                .single()

            return NextResponse.json({
                success: true,
                type: 'plan',
                id: savedPlan?.id,
                content: generatedContent
            })
        } else {
            const { data: savedOutput } = await supabase
                .from('ai_outputs')
                .insert({
                    student_id: studentId,
                    type: requestedOutput,
                    status: 'pending',
                    content_json: generatedContent,
                    language
                })
                .select()
                .single()

            return NextResponse.json({
                success: true,
                type: requestedOutput,
                id: savedOutput?.id,
                content: generatedContent
            })
        }

    } catch (error: any) {
        console.error('AI generation error:', error)
        return NextResponse.json(
            { error: error.message || 'Generation failed' },
            { status: 500 }
        )
    }
}

function buildPrompt(type: OutputType, context: any, language: string): string {
    const studentInfo = `Student: ${context.student.name}, Age ${context.student.age}, ${context.student.diagnosis}, Support Level: ${context.student.supportLevel}, Communication: ${context.student.communicationLevel}, Preferred Learning: ${context.student.preferredLearning}, Interests: ${context.student.interests.join(', ')}`

    const recentProgress = context.recentLogs?.map((l: any) =>
        `- ${l.activity} (AET ${l.aetCode}): ${l.outcome}. Teacher note: ${l.teacherComment}`
    ).join('\n')

    const activeGoalsText = context.activeGoals?.map((g: any) =>
        `- ${g.title} (${g.category}): ${g.mastery}% mastery`
    ).join('\n')

    const aetContext = context.aetFramework?.map((a: any) =>
        `- AET ${a.code} (${a.domain}): ${a.intention}`
    ).join('\n')

    if (type === 'plan') {
        return `Generate a Daily Learning Plan for tomorrow.

${studentInfo}

Recent Progress (last 5 sessions):
${recentProgress}

Active IEP Goals:
${activeGoalsText}

Relevant AET Framework:
${aetContext}

Requirements:
1. Must cite specific AET codes (e.g., "AET 4.2: Sort objects by one attribute")
2. Low-arousal, autism-friendly approach
3. Clear visual supports suggestions
4. Numbered steps
5. Success criteria
6. Minimal text, maximum clarity
7. Include "Why this plan" reasoning based on recent logs and evidence
8. Language: ${language}

Return ONLY valid JSON with this exact structure:
{
  "title": "Daily Plan for [Student Name] - [Date]",
  "aetCodes": ["4.2", "5.2"],
  "objectives": [
    {
      "aetCode": "4.2",
      "learningIntention": "Sort objects by one attribute",
      "activity": "Sorting colored blocks",
      "visualSupports": ["Color chart", "Sorting mat"],
      "steps": ["1. Show color chart", "2. Model sorting red blocks", "3. Student sorts blue blocks", "4. Independent sorting"],
      "successCriteria": "Sorts 8/10 blocks correctly with minimal prompts"
    }
  ],
  "materials": ["Colored blocks", "Sorting mat", "Visual timer"],
  "sensoryConsiderations": ["Quiet corner", "Low lighting", "Minimal verbal instructions"],
  "reasoning": "Based on recent success with sorting (AET 4.2), we're building on this strength while introducing turn-taking (AET 6.2) which showed partial achievement. Visual schedule use has been strong, so we'll leverage that.",
  "estimatedDuration": "20-25 minutes"
}`
    }

    if (type === 'worksheet') {
        return `Generate a printable worksheet.

${studentInfo}

Recent Progress:
${recentProgress}

AET Focus:
${aetContext}

Requirements:
1. Cite AET code this worksheet targets
2. Low-arousal design (minimal clutter, clear borders, simple icons)
3. Age-appropriate for ${context.student.age} years old
4. Uses student interests: ${context.student.interests.join(', ')}
5. Clear numbered instructions
6. Visual supports described
7. Success criteria
8. Printable layout description
9. Language: ${language}

Return ONLY valid JSON:
{
  "title": "Worksheet Title",
  "aetCode": "4.2",
  "targetSkill": "Sorting by color",
  "instructions": ["1. Look at the colors", "2. Circle items that match", "3. Draw a line to connect"],
  "sections": [
    {
      "sectionTitle": "Part 1: Matching",
      "description": "3 rows of colored shapes",
      "visualLayout": "Left column: red circle, blue square, yellow triangle. Right column: mixed shapes to match.",
      "task": "Draw lines to match"
    }
  ],
  "visualSupports": ["Color key at top", "Example completed in dotted lines"],
  "successCriteria": "Completes 7/10 items correctly",
  "teacherNotes": "Use this after morning circle time. Provide hand-over-hand support if needed for first item."
}`
    }

    if (type === 'social_story') {
        return `Generate a Social Story.

${studentInfo}

Recent Challenges:
${recentProgress}

Requirements:
1. Simple, first-person language
2. 5-7 sentences maximum
3. Positive, reassuring tone
4. Visual description for each page
5. Autism-friendly (predictable, concrete)
6. Language: ${language}

Return ONLY valid JSON:
{
  "title": "Taking Turns",
  "pages": [
    {
      "text": "Sometimes I play with toys at school.",
      "visualDescription": "Child playing with blocks alone"
    },
    {
      "text": "Sometimes my friend wants to play too.",
      "visualDescription": "Two children near the blocks"
    },
    {
      "text": "I can wait for my turn. Waiting is okay.",
      "visualDescription": "Child holding a 'waiting' card, looking calm"
    },
    {
      "text": "When it's my turn, I can play. My teacher will tell me.",
      "visualDescription": "Teacher pointing to child, child smiling"
    },
    {
      "text": "Taking turns makes everyone happy.",
      "visualDescription": "Both children smiling, playing together"
    }
  ],
  "aetCode": "6.2",
  "targetBehavior": "Turn-taking",
  "readingFrequency": "Read before group activities"
}`
    }

    // visual_schedule
    return `Generate a Visual Schedule.

${studentInfo}

Requirements:
1. 5-8 steps for a routine
2. Simple icon descriptions
3. Clear sequence
4. Autism-friendly (predictable, visual)
5. Language: ${language}

Return ONLY valid JSON:
{
  "title": "Morning Routine",
  "steps": [
    {
      "stepNumber": 1,
      "activity": "Hang up backpack",
      "iconDescription": "Backpack on hook",
      "duration": "1 minute"
    },
    {
      "stepNumber": 2,
      "activity": "Wash hands",
      "iconDescription": "Hands under water with soap",
      "duration": "2 minutes"
    }
  ],
  "aetCode": "5.2",
  "routine": "Morning arrival",
  "visualFormat": "Vertical sequence with checkboxes"
}`
}
