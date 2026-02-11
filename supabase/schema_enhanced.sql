-- Enhanced AlKaramah Assistant Schema for LLM Integration

-- Drop existing tables if recreating
DROP TABLE IF EXISTS ai_outputs CASCADE;
DROP TABLE IF EXISTS ai_plans CASCADE;

-- AI Plans table (Daily plans, recommendations)
CREATE TABLE ai_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
    content_json JSONB NOT NULL,
    generated_by TEXT DEFAULT 'AI Assistant',
    last_edited_by UUID,
    teacher_comment TEXT,
    aet_codes TEXT[] DEFAULT '{}'
);

-- AI Outputs table (Worksheets, Social Stories, Visual Schedules)
CREATE TABLE ai_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('worksheet', 'social_story', 'visual_schedule')),
    status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
    content_json JSONB NOT NULL,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    teacher_comment TEXT,
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar', 'bilingual'))
);

-- Indexes for performance
CREATE INDEX idx_ai_plans_student ON ai_plans(student_id);
CREATE INDEX idx_ai_plans_status ON ai_plans(status);
CREATE INDEX idx_ai_outputs_student ON ai_outputs(student_id);
CREATE INDEX idx_ai_outputs_status ON ai_outputs(status);
CREATE INDEX idx_ai_outputs_type ON ai_outputs(type);
