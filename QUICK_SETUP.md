# AlKaramah Assistant - Quick Setup Guide

## 1. Database Setup (Supabase SQL Editor)

```sql
-- Run these files in order:
-- 1. supabase/schema_enhanced.sql (creates ai_plans, ai_outputs tables)
-- 2. supabase/seed_enhanced.sql (adds AET codes, logs, evidence)
```

## 2. Storage Setup (Supabase Dashboard)

1. Go to Storage → Create Bucket
2. Name: `evidence`
3. Public: Yes
4. Run storage policies from `supabase/SETUP_INSTRUCTIONS.sql`

## 3. Environment Variables (.env.local)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

## 4. Demo Flow for Judges

### Path 1: AI Worksheet Analysis
1. Go to `/teacher/ai-demo`
2. Select student (Ahmed)
3. Enter: 8 correct, 10 total, worksheet type: vocabulary
4. Click "Analyze & Generate Plan"
5. See AI analysis + auto-generated IEP goal

### Path 2: Generate Daily Plan
1. Go to `/teacher/students` → Click Ahmed
2. Use AIGenerateButton component
3. Click "Generate Daily Plan"
4. AI analyzes logs + evidence + IEP goals
5. Generates AET-aligned plan with reasoning

### Path 3: Approval Workflow
1. Go to `/teacher/approvals`
2. See pending AI-generated content
3. Click "Review"
4. Approve or Reject with comment
5. Approved content appears in Reports

## Key APIs

- `POST /api/ai/generate` - Generate AI content (plan, worksheet, social story, visual schedule)
- `POST /api/ai/analyze-worksheet` - Analyze worksheet + update support level + generate IEP goal
- `GET /api/approvals` - List pending items
- `PATCH /api/approvals/[id]` - Approve/reject
- `POST /api/evidence/upload` - Upload files to Supabase Storage

## Features

✅ Real OpenAI GPT-4 generation  
✅ AET framework integration  
✅ Teacher approval workflow  
✅ File storage (Supabase)  
✅ Auto-update support levels  
✅ Auto-generate IEP goals  
✅ Low-arousal, autism-friendly outputs  
✅ Structured JSON responses  

## Build Status

✅ TypeScript compilation: SUCCESS  
✅ All routes compiled: 32 pages  
✅ OpenAI SDK installed  
✅ Production ready  
