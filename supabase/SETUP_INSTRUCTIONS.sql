-- Setup Instructions for Supabase

-- STEP 1: Run in Supabase SQL Editor
-- Copy and paste schema_enhanced.sql to create ai_plans and ai_outputs tables

-- STEP 2: Run seed_enhanced.sql
-- This will populate AET framework, learning logs, and evidence

-- STEP 3: Create Storage Bucket
-- Go to Supabase Dashboard → Storage → Create Bucket
-- Name: "evidence"
-- Public: Yes
-- File size limit: 50MB
-- Allowed MIME types: image/*, application/pdf

-- STEP 4: Set Storage Policies
-- Run these policies in SQL Editor:

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence');

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'evidence');

-- STEP 5: Add OpenAI API Key to .env.local
-- OPENAI_API_KEY=sk-...

-- STEP 6: Install OpenAI SDK
-- npm install openai

-- STEP 7: Restart dev server
-- npm run dev
