-- Enhanced Seed Data for AlKaramah Assistant Demo

-- AET Framework (Real codes from AET Progression Framework)
INSERT INTO aet_framework (code, domain, learning_intention, stage) VALUES
('1.1', 'Social Understanding', 'Participate in a shared activity with an adult', 'Foundation'),
('1.2', 'Social Understanding', 'Show awareness of others in the environment', 'Foundation'),
('2.1', 'Communication', 'Use gestures or actions to communicate needs', 'Foundation'),
('2.2', 'Communication', 'Use single words or symbols to request', 'Foundation'),
('3.1', 'Communication', 'Follow simple one-step instructions', 'Foundation'),
('3.2', 'Communication', 'Respond to familiar greetings', 'Foundation'),
('4.1', 'Cognition', 'Match identical objects', 'Foundation'),
('4.2', 'Cognition', 'Sort objects by one attribute (color, shape)', 'Foundation'),
('5.1', 'Independence', 'Participate in simple self-care routines with support', 'Foundation'),
('5.2', 'Independence', 'Follow visual schedule for daily routine', 'Foundation'),
('6.1', 'Social Interaction', 'Engage in parallel play near peers', 'Foundation'),
('6.2', 'Social Interaction', 'Take turns in structured activity', 'Primary'),
('7.1', 'Emotional Regulation', 'Use calming strategy with adult support', 'Foundation'),
('7.2', 'Emotional Regulation', 'Identify basic emotions in pictures', 'Foundation'),
('8.1', 'Sensory Processing', 'Tolerate different textures during activities', 'Foundation')
ON CONFLICT (code) DO NOTHING;

-- Learning Logs for Ahmed (recent 5 days)
INSERT INTO learning_logs (student_id, aet_domain, aet_code, learning_intention, objective, outcome, difficulty, engagement_level, prompts, domains, teacher_comment, created_at) VALUES
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Cognition', '4.2', 'Sort objects by one attribute', 'Sorting colored blocks', 'Achieved', 'Easy', 'High', '["None"]', '["Academic"]', 'Ahmed sorted all blocks correctly without prompts. Very focused today.', NOW() - INTERVAL '1 day'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Communication', '2.2', 'Use single words to request', 'Requesting snack items', 'Achieved', 'Medium', 'High', '["Gestural"]', '["Communication"]', 'Used "water" and "apple" spontaneously. Great progress!', NOW() - INTERVAL '2 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Social Interaction', '6.2', 'Take turns in structured activity', 'Turn-taking with puzzle', 'Partial', 'Hard', 'Medium', '["Verbal", "Physical"]', '["Social Skills"]', 'Needed reminders to wait. Became frustrated after 3 minutes.', NOW() - INTERVAL '3 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Independence', '5.2', 'Follow visual schedule', 'Morning routine with schedule', 'Achieved', 'Easy', 'High', '["Visual"]', '["Life Skills"]', 'Followed all 5 steps independently using visual schedule.', NOW() - INTERVAL '4 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Emotional Regulation', '7.2', 'Identify basic emotions', 'Emotion cards matching', 'Achieved', 'Medium', 'High', '["None"]', '["Social Skills"]', 'Identified happy, sad, angry correctly. Struggled with surprised.', NOW() - INTERVAL '5 days');

-- Evidence for Ahmed
INSERT INTO evidence (student_id, type, description, linked_category, linked_objective_text, related_aet_code, file_url, tags, created_at) VALUES
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'file', 'Maths Monday Worksheet - Sorting Activity', 'Academic', 'Sort objects by color', '4.2', 'https://placeholder.com/maths-monday.pdf', '["Worksheet", "Completed"]', NOW() - INTERVAL '1 day'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'photo', 'Ahmed using visual schedule independently', 'Life Skills', 'Follow visual schedule', '5.2', 'https://placeholder.com/visual-schedule.jpg', '["Independence", "Success"]', NOW() - INTERVAL '2 days'),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'photo', 'Turn-taking activity with peer', 'Social Skills', 'Take turns', '6.2', 'https://placeholder.com/turn-taking.jpg', '["Social", "Peer Interaction"]', NOW() - INTERVAL '3 days');

-- IEP Goals for Ahmed
INSERT INTO iep_goals (student_id, category, title, objectives, status, mastery_percent) VALUES
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Communication', 'Expressive Communication Using Single Words', '["Use 10 functional words", "Request items independently", "Greet familiar adults", "Answer yes/no questions"]', 'Approved', 75),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Academic', 'Sorting and Matching Skills', '["Match identical objects", "Sort by color", "Sort by shape", "Sort by size"]', 'Approved', 85),
('a1b2c3d4-e5f6-4a1b-8c7d-9e0f1a2b3c4d', 'Social Skills', 'Turn-Taking in Group Activities', '["Wait for turn (30 seconds)", "Use waiting card", "Take turn when prompted", "Return item to peer"]', 'Approved', 45);
