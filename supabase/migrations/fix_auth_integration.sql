-- SQL Migration: Remove custom users table dependency
-- Use Supabase Auth user IDs directly for teacher_id

-- Step 1: Drop the foreign key constraint on students.teacher_id
ALTER TABLE students 
DROP CONSTRAINT IF EXISTS students_teacher_id_fkey;

-- Step 2: teacher_id is already UUID type, so no type change needed
-- Just ensure it can store Supabase Auth user IDs (which are UUIDs)

-- Step 3: Drop the custom users table (optional - only if not needed)
-- DROP TABLE IF EXISTS users CASCADE;

-- Step 4: Update other tables that reference users table
ALTER TABLE learning_logs 
DROP CONSTRAINT IF EXISTS learning_logs_teacher_id_fkey;

ALTER TABLE evidence 
DROP CONSTRAINT IF EXISTS evidence_added_by_fkey;

ALTER TABLE ai_plans 
DROP CONSTRAINT IF EXISTS ai_plans_approved_by_fkey;

-- Note: teacher_id, added_by, and approved_by columns will now store
-- Supabase Auth user IDs (auth.users.id) without foreign key constraints
-- This is acceptable for MVP/hackathon environments
