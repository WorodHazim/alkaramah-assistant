-- Quick test: Insert demo students if table is empty
-- Run this in Supabase SQL Editor

-- First, ensure the users table has the teacher
INSERT INTO users (id, name, email, role) VALUES
('f4a1e2b2-5678-4321-8765-abcdef123456', 'Ms. Sarah', 'sarah.teacher@alkaramah.ae', 'Teacher')
ON CONFLICT (id) DO NOTHING;

-- Insert test students
INSERT INTO students (id, name, age, diagnosis, support_level, communication_level, preferred_learning, interests, teacher_id, avatar_label) VALUES
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Ahmed Al-Mansouri', 8, 'Autism Support', 'Medium', 'limited', 'visual', ARRAY['Cars', 'Colors'], 'f4a1e2b2-5678-4321-8765-abcdef123456', 'AM'),
('b1c2d3e4-f5a6-4b1c-8d7e-0f1a2b3c4d5e', 'Layla Hassan', 7, 'Speech Therapy', 'Low', 'verbal', 'hands-on', ARRAY['Animals', 'Drawing'], 'f4a1e2b2-5678-4321-8765-abcdef123456', 'LH')
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT id, name, age, support_level, avatar_label, teacher_id FROM students WHERE teacher_id = 'f4a1e2b2-5678-4321-8765-abcdef123456';
