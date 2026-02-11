-- Full MVP Database Schema for AlKaramah Assistant

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Teacher', 'Management')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    diagnosis TEXT DEFAULT 'Autism Support',
    support_level TEXT NOT NULL CHECK (support_level IN ('Low', 'Medium', 'High')),
    communication_level TEXT DEFAULT 'verbal' CHECK (communication_level IN ('non-verbal', 'limited', 'verbal')),
    preferred_learning TEXT DEFAULT 'visual' CHECK (preferred_learning IN ('visual', 'hands-on', 'auditory', 'routine')),
    interests TEXT[] DEFAULT '{}',
    teacher_id UUID REFERENCES users(id),
    avatar_label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AET Framework table (Canonical reference)
CREATE TABLE IF NOT EXISTS aet_framework (
    code TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    learning_intention TEXT NOT NULL,
    stage TEXT NOT NULL
);

-- IEP Goals table
CREATE TABLE IF NOT EXISTS iep_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('Communication', 'Social Interaction', 'Sensory Processing', 'Independence')),
    title TEXT NOT NULL,
    objectives JSONB NOT NULL, -- Array of objective steps
    status TEXT NOT NULL CHECK (status IN ('Active', 'Paused', 'Achieved', 'Draft', 'Draft Pending Approval', 'Approved', 'Rejected', 'Needs Changes')),
    mastery_percent INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning Logs table
CREATE TABLE IF NOT EXISTS learning_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    aet_domain TEXT,
    aet_code TEXT REFERENCES aet_framework(code),
    learning_intention TEXT,
    objective TEXT NOT NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('Achieved', 'Partial', 'Not Achieved')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    engagement_level TEXT NOT NULL CHECK (engagement_level IN ('Low', 'Medium', 'High')),
    prompts JSONB DEFAULT '[]', -- Array of prompt types
    domains JSONB DEFAULT '[]', -- Array of academic domains
    teacher_comment TEXT,
    teacher_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'work', 'note', 'file')),
    description TEXT NOT NULL,
    file_url TEXT,
    linked_goal_id UUID REFERENCES iep_goals(id) ON DELETE SET NULL,
    linked_log_id UUID REFERENCES learning_logs(id) ON DELETE SET NULL,
    linked_category TEXT,
    linked_objective_text TEXT,
    related_aet_code TEXT REFERENCES aet_framework(code),
    added_by UUID REFERENCES users(id),
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Plans (Tomorrow's Plan) table
CREATE TABLE IF NOT EXISTS ai_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    generated_plan TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'edited')),
    teacher_edit TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB NOT NULL, -- Full report sections
    status TEXT NOT NULL CHECK (status IN ('AI Draft', 'Edited', 'Approved')),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Worksheets table
CREATE TABLE IF NOT EXISTS worksheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_ids UUID[] DEFAULT '{}',
    aet_code TEXT REFERENCES aet_framework(code),
    objective TEXT NOT NULL,
    prompt_used TEXT,
    generated_content JSONB NOT NULL,
    cultural_context TEXT DEFAULT 'UAE / Emirati',
    age_group TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
