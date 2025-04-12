-- ==============================
-- Category Table
-- ==============================
INSERT INTO category (id, name, type, description, vision, purpose, resources, color, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Personal Growth', 'personal', 'Improve skills and habits', 'Achieve full potential', 'Inspire and motivate others', 'Books, Mentors, Courses', '#FF5733', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Work Projects', 'professional', 'Handle professional projects', 'Career success', 'Deliver quality projects', 'Tools, Frameworks', '#33FF57', NOW(), NOW()),
  ('33333333-1111-1111-1111-111111111111', 'Health & Fitness', 'personal', 'Maintain physical and mental health', 'Optimal health and wellness', 'Live a balanced life', 'Gym, Nutrition Plan, Meditation App', '#3357FF', NOW(), NOW());

-- ==============================
-- Role Table
-- ==============================
INSERT INTO role (id, category_id, name, purpose, description, identity_statement, created_at, updated_at)
VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Learner', 'Learn new skills', 'Developing knowledge base', 'I am constantly growing', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Project Manager', 'Deliver quality projects', 'Managing teams and resources', 'I am an effective leader', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', '33333333-1111-1111-1111-111111111111', 'Health Enthusiast', 'Maintain optimal health', 'Living a healthy lifestyle', 'I am strong and healthy', NOW(), NOW());


-- ==============================
-- Role Incantation Table
-- ==============================
INSERT INTO role_incantation (role_id, incantation)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'I am always growing and learning'),
  ('44444444-4444-4444-4444-444444444444', 'I am a successful leader'),
  ('55555555-5555-5555-5555-555555555555', 'I am strong and healthy');

-- ==============================
-- Category Result Table
-- ==============================
INSERT INTO category_result (category_id, result)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Learn TypeScript'),
  ('22222222-2222-2222-2222-222222222222', 'Complete Backend API'),
  ('33333333-1111-1111-1111-111111111111', 'Run 5K Race');

-- ==============================
-- Category Action Plan Table
-- ==============================
INSERT INTO category_action_plan (category_id, action_plan)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Create a study schedule'),
  ('22222222-2222-2222-2222-222222222222', 'Outline project requirements'),
  ('33333333-1111-1111-1111-111111111111', 'Follow training program');

-- ==============================
-- Category Three To Thrive Table
-- ==============================
INSERT INTO category_three_to_thrive (category_id, three_to_thrive)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Focus, Learn, Apply'),
  ('22222222-2222-2222-2222-222222222222', 'Plan, Build, Deliver'),
  ('33333333-1111-1111-1111-111111111111', 'Train, Rest, Recover');

-- ==============================
-- RPM Block Table
-- ==============================
INSERT INTO rpm_block (
  id, category_id, result, type, "order", created_at, updated_at
) VALUES (
  '11111111-aaaa-aaaa-aaaa-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Start nieuwe fitness challenge',
  'Project',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
-- Tweede block die nog ontbrak
INSERT INTO rpm_block (
  id, category_id, result, type, "order", created_at, updated_at
) VALUES (
  '22222222-aaaa-aaaa-aaaa-222222222222',
  '33333333-1111-1111-1111-111111111111',
  'Complete 5K Training Plan',
  'Project',
  2,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
-- ⚙️ rpm_block_purpose
INSERT INTO "rpm_block_purpose" (id, rpm_block_id, purpose)
VALUES 
  ('22222222-bbbb-bbbb-bbbb-222222222222', '11111111-aaaa-aaaa-aaaa-111111111111', 'Validate business idea'),
  ('22222222-cccc-cccc-cccc-222222222222', '11111111-aaaa-aaaa-aaaa-111111111111', 'Build momentum'),
  ('33333333-bbbb-bbbb-bbbb-333333333333', '22222222-aaaa-aaaa-aaaa-222222222222', 'Improve fitness'),
  ('33333333-cccc-cccc-cccc-333333333333', '22222222-aaaa-aaaa-aaaa-222222222222', 'Build endurance');

-- ⚙️ rpm_block_massive_action
INSERT INTO "rpm_block_massive_action" (id, rpm_block_id, text, color, text_color, leverage, duration_amount, duration_unit, priority, key, start_date, end_date, is_date_range, hour, missed_date, description, location, category_id)
VALUES 
  ('33333333-dddd-dddd-dddd-333333333333', '11111111-aaaa-aaaa-aaaa-111111111111', 'Create landing page', '#FF5733', '#FFFFFF', 'High visibility', 3, 'days', 1, 'Design', '2025-04-01', '2025-04-03', TRUE, 2, NULL, 'Design and implement landing page', 'Remote', '11111111-1111-1111-1111-111111111111'),
  ('33333333-eeee-eeee-eeee-333333333333', '11111111-aaaa-aaaa-aaaa-111111111111', 'Collect feedback from users', '#33FFAA', '#000000', 'User input', 2, 'days', 2, 'Research', '2025-04-04', '2025-04-05', TRUE, 1, NULL, 'Gather user feedback on MVP', 'Remote', '11111111-1111-1111-1111-111111111111'),
  ('44444444-dddd-dddd-dddd-444444444444', '22222222-aaaa-aaaa-aaaa-222222222222', 'Morning Run', '#3357FF', '#FFFFFF', 'Daily consistency', 1, 'hours', 1, 'Exercise', '2025-04-01', '2025-04-01', FALSE, 7, NULL, 'Complete 5K training run', 'Local Park', '33333333-1111-1111-1111-111111111111'),
  ('44444444-eeee-eeee-eeee-444444444444', '22222222-aaaa-aaaa-aaaa-222222222222', 'Evening Stretches', '#FF33A8', '#FFFFFF', 'Recovery', 30, 'minutes', 2, 'Recovery', '2025-04-01', '2025-04-01', FALSE, 19, NULL, 'Evening Flexibility', 'Home', '33333333-1111-1111-1111-111111111111');

-- ⚙️ rpm_block_massive_action_note
INSERT INTO "rpm_block_massive_action_note" (id, massive_action_id, text, type)
VALUES 
  ('44444444-aaaa-aaaa-aaaa-444444444444', '33333333-dddd-dddd-dddd-333333333333', 'Started designing homepage', 'Progress'),
  ('44444444-bbbb-bbbb-bbbb-444444444444', '33333333-eeee-eeee-eeee-333333333333', 'Sent first batch of surveys', 'Update'),
  ('55555555-aaaa-aaaa-aaaa-555555555555', '44444444-dddd-dddd-dddd-444444444444', 'Completed 3K run', 'Progress'),
  ('55555555-bbbb-bbbb-bbbb-555555555555', '44444444-eeee-eeee-eeee-444444444444', 'Improved flexibility', 'Update');

-- ⚙️ rpm_block_massive_action_note_metric
INSERT INTO "rpm_block_massive_action_note_metric" (note_id, name, value, unit, timestamp)
VALUES 
  ('44444444-aaaa-aaaa-aaaa-444444444444', 'Homepage Completion', 60, 'percent', NOW()),
  ('55555555-aaaa-aaaa-aaaa-555555555555', 'Distance Covered', 3, 'kilometers', NOW());
