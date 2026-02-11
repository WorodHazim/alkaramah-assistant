-- AlKaramah Assistant Hackathon Demo Seed Data (STEP 4)

-- 1. Users
INSERT INTO users (id, name, email, role) VALUES
('d3b2e3a1-1234-4567-8901-234567890abc', 'School Management', 'management@alkaramah.ae', 'Management'),
('f4a1e2b2-5678-4321-8765-abcdef123456', 'Ms. Sarah', 'sarah.teacher@alkaramah.ae', 'Teacher')
ON CONFLICT (id) DO NOTHING;

-- 2. Students (Assigned to Ms. Sarah)
INSERT INTO students (id, name, age, diagnosis, support_level, communication_level, preferred_learning, interests, teacher_id, avatar_label) VALUES
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Ahmed Al-Mansouri', 8, 'Autism Support', 'Medium', 'limited', 'visual', ARRAY['Cars', 'Colors', 'Building blocks'], 'f4a1e2b2-5678-4321-8765-abcdef123456', 'AM'),
('b1c2d3e4-f5a6-4b1c-8d7e-0f1a2b3c4d5e', 'Layla Hassan', 7, 'Speech Therapy', 'Medium', 'verbal', 'hands-on', ARRAY['Animals', 'Drawing', 'Music'], 'f4a1e2b2-5678-4321-8765-abcdef123456', 'LH'),
('c1d2e3f4-a5b6-4c1d-8e7f-1f2a3b4c5d6e', 'Zayed Al-Nahyan', 9, 'Behavioral Support', 'High', 'verbal', 'routine', ARRAY['Sports', 'Puzzles'], 'f4a1e2b2-5678-4321-8765-abcdef123456', 'ZA'),
('d1e2f3a4-b5c6-4d1e-8f7a-2f3a4b5c6d7e', 'Emily Smith', 8, 'Learning Support', 'Low', 'verbal', 'auditory', ARRAY['Reading', 'Stories'], 'f4a1e2b2-5678-4321-8765-abcdef123456', 'ES')
ON CONFLICT (id) DO NOTHING;

-- 3. Ahmed's IEP Goals (approved)
INSERT INTO iep_goals (id, student_id, category, title, objectives, status, mastery_percent) VALUES
('g1_comm', 'a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Communication', 'Using PECS for Basic Needs', '["Locate PECS book independently", "Select correct picture item", "Hand picture to adult", "Wait for item delivery"]', 'Approved', 85),
('g2_comm', 'a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Communication', 'Matching Primary Colors', '["Match red items", "Match blue items", "Match yellow items", "Identify color on request"]', 'Approved', 92),
('g3_social', 'a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Social Skills', 'Turn-Taking in Group Games', '["Wait for turn (1 min)", "Use \"my turn\" gesture", "Hand over toy to peer", "Engage for 5 mins"]', 'Approved', 45),
('g4_social', 'a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Social Skills', 'Eye Contact during Greeting', '["Respond to name", "Look at speaker for 2s", "Use wave gesture", "Initiate greeting"]', 'Approved', 30),
('g5_acad', 'a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Academic', 'Number Recognition 1-10', '["Identify numbers 1-5", "Identify numbers 6-10", "Order numbers correctly", "Match quantity to number"]', 'Approved', 60),
('g6_acad', 'a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Academic', 'Basic Pattern Matching', '["Copy AB pattern", "Extend AB pattern", "Create AB pattern", "Copy ABC pattern"]', 'Approved', 75),
('g7_life', 'a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Life Skills', 'Putting on Jacket Independently', '["Locate jacket", "Insert one arm", "Insert second arm", "Zipping up with assist"]', 'Approved', 50),
('g8_life', 'a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Life Skills', 'Washing Hands Routine', '["Turn on water", "Apply soap", "Rub hands for 10s", "Dry hands with paper"]', 'Approved', 80)
ON CONFLICT (id) DO NOTHING;

-- 4. Learning Logs for Ahmed (Last 7 Days)
INSERT INTO learning_logs (student_id, objective, outcome, difficulty, engagement, prompts, teacher_note, teacher_id, created_at) VALUES
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Matching Primary Colors', 'Achieved', 'Just Right', 95, '["None"]', 'Ahmed was very focused today. He matched all three colors without any prompts.', 'f4a1e2b2-5678-4321-8765-abcdef123456', NOW() - INTERVAL '1 day'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Using PECS for Basic Needs', 'Achieved', 'Just Right', 80, '["Gestural"]', 'Needs small gesture to look at the book, but then performs well.', 'f4a1e2b2-5678-4321-8765-abcdef123456', NOW() - INTERVAL '2 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Turn-Taking in Group Games', 'Partially Achieved', 'Hard', 40, '["Verbal", "Physical"]', 'Frustrated during a shared session. Needed physical steering to wait.', 'f4a1e2b2-5678-4321-8765-abcdef123456', NOW() - INTERVAL '3 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Number Recognition 1-10', 'Emerging', 'Medium', 60, '["Visual"]', 'Recognized numbers 1-3. Lost interest after that.', 'f4a1e2b2-5678-4321-8765-abcdef123456', NOW() - INTERVAL '4 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Putting on Jacket Independently', 'Achieved', 'Just Right', 70, '["Visual"]', 'Used the visual schedule on the wall to complete the steps.', 'f4a1e2b2-5678-4321-8765-abcdef123456', NOW() - INTERVAL '5 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Washing Hands Routine', 'Achieved', 'Just Right', 85, '["None"]', 'Complete independence in the morning routine.', 'f4a1e2b2-5678-4321-8765-abcdef123456', NOW() - INTERVAL '6 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Matching Primary Colors', 'Partially Achieved', 'Hard', 50, '["Verbal"]', 'Tired in the afternoon; confused blue with yellow.', 'f4a1e2b2-5678-4321-8765-abcdef123456', NOW() - INTERVAL '7 days');

-- 5. Evidence for Ahmed
INSERT INTO evidence (student_id, type, description, linked_goal_id, added_by, tags, created_at) VALUES
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'photo', 'Ahmed independently matching red blocks during morning session.', 'g2_comm', 'f4a1e2b2-5678-4321-8765-abcdef123456', '["Academic", "Independence"]', NOW() - INTERVAL '1 day'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'work', 'Completed Number 1-5 coloring sheet with high accuracy.', 'g5_acad', 'f4a1e2b2-5678-4321-8765-abcdef123456', '["Work Sample", "Fine Motor"]', NOW() - INTERVAL '2 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'photo', 'Successfully using PECS to request water during snack time.', 'g1_comm', 'f4a1e2b2-5678-4321-8765-abcdef123456', '["Communication", "Snack"]', NOW() - INTERVAL '3 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'photo', 'Standing in line waiting for a turn during class transition.', 'g3_social', 'f4a1e2b2-5678-4321-8765-abcdef123456', '["Social", "Transition"]', NOW() - INTERVAL '4 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'work', 'AB Pattern worksheet using UAE flag stickers.', 'g6_acad', 'f4a1e2b2-5678-4321-8765-abcdef123456', '["Cultural", "Academic"]', NOW() - INTERVAL '5 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'photo', 'Putting on outdoor jacket independently before playground.', 'g7_life', 'f4a1e2b2-5678-4321-8765-abcdef123456', '["Life Skills", "Autonomy"]', NOW() - INTERVAL '6 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'photo', 'Happy engagement during sensory water play session.', NULL, 'f4a1e2b2-5678-4321-8765-abcdef123456', '["Sensory", "Engagement"]', NOW() - INTERVAL '2 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'photo', 'Matching Burj Khalifa icons to primary colors.', 'g2_comm', 'f4a1e2b2-5678-4321-8765-abcdef123456', '["Cultural", "Visual"]', NOW() - INTERVAL '1 day'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'note', 'Ahmed used \"my turn\" gesture spontaneously today.', 'g3_social', 'f4a1e2b2-5678-4321-8765-abcdef123456', '["Social", "Spontaneous"]', NOW() - INTERVAL '1 day'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'file', 'AET Standard Framework References for Stage 1 Communication.', NULL, 'f4a1e2b2-5678-4321-8765-abcdef123456', '["Metadata", "Framework"]', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- 6. AI Tomorrow Plan for Ahmed
INSERT INTO ai_plans (student_id, generated_plan, status) VALUES
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 
'Based on today''s success with primary colors, Ahmed is ready to broaden his palette. We will use high-contrast visual borders and Burj Khalifa icons for familiarity. Introduce 2 new colors (Green, White). Materials: Advanced Color Set, UAE Icon Cards, Visual Boundary Mat.',
'pending');

-- 7. Reports for Ahmed
INSERT INTO reports (student_id, title, content, status) VALUES
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 
'Weekly Progress Report - Ahmed Al-Mansouri', 
'{
  "overview": "Ahmed has shown exceptional focus in structured visual tasks this week. His ability to request needs via PECS is stabilizing.",
  "progress": "Overall mastery across communication goals increased by 12% following the introduction of UAE-themed visual aids.",
  "strengths": ["Independent color matching", "PECS initiation", "Fine motor worksheet completion"],
  "challenges": ["Waiting in group settings", "Transitioning away from high-interest sensory items"],
  "recommendations": "Continue using high-contrast visual scaffolds. Introduce a 2-minute sand timer for waiting transitions.",
  "next_focus": ["Introduce Level 2 color matching", "Improve peer-to-peer PECS use", "Reduce verbal prompts during snags"]
}', 
'AI Draft');
