-- ==============================
-- Category Table
-- ==============================
INSERT INTO category (id, name, type, description, vision, purpose, resources, color, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Personal Growth', 'personal', 'Improve skills and habits', 'Achieve full potential', 'Inspire and motivate others', 'Books, Mentors, Courses', '#FF5733', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Work Projects', 'professional', 'Handle professional projects', 'Career success', 'Deliver quality projects', 'Tools, Frameworks', '#33FF57', NOW(), NOW());

-- ==============================
-- Role Table
-- ==============================
INSERT INTO role (id, category_id, name, purpose, description, identity_statement, created_at, updated_at)
VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Learner', 'Learn new skills', 'Developing knowledge base', 'I am constantly growing', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Project Manager', 'Deliver quality projects', 'Managing teams and resources', 'I am an effective leader', NOW(), NOW());

-- ==============================
-- Role Core Quality Table
-- ==============================
INSERT INTO role_core_quality (role_id, quality)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'Curiosity'),
  ('33333333-3333-3333-3333-333333333333', 'Discipline'),
  ('44444444-4444-4444-4444-444444444444', 'Leadership'),
  ('44444444-4444-4444-4444-444444444444', 'Focus');

-- ==============================
-- Role Incantation Table
-- ==============================
INSERT INTO role_incantation (role_id, incantation)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'I am always growing and learning'),
  ('44444444-4444-4444-4444-444444444444', 'I am a successful leader');

-- ==============================
-- Category Result Table
-- ==============================
INSERT INTO category_result (category_id, result)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Learn TypeScript'),
  ('22222222-2222-2222-2222-222222222222', 'Complete Backend API');

-- ==============================
-- Category Action Plan Table
-- ==============================
INSERT INTO category_action_plan (category_id, action_plan)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Create a study schedule'),
  ('22222222-2222-2222-2222-222222222222', 'Outline project requirements');

-- ==============================
-- Category Three To Thrive Table
-- ==============================
INSERT INTO category_three_to_thrive (category_id, three_to_thrive)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Focus, Learn, Apply'),
  ('22222222-2222-2222-2222-222222222222', 'Plan, Build, Deliver');

-- ==============================
-- RPM Block Table
-- ==============================
INSERT INTO "rpm_block" (id, category_id, result, type, "order", created_at, updated_at)
VALUES 
  ('11111111-aaaa-aaaa-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', 'Launch MVP', 'text', 1, NOW(), NOW());

-- ⚙️ rpm_block_purpose
INSERT INTO "rpm_block_purpose" (id, rpm_block_id, purpose)
VALUES 
  ('22222222-bbbb-bbbb-bbbb-222222222222', '11111111-aaaa-aaaa-aaaa-111111111111', 'Validate business idea'),
  ('22222222-cccc-cccc-cccc-222222222222', '11111111-aaaa-aaaa-aaaa-111111111111', 'Build momentum');

-- ⚙️ rpm_block_massive_action
INSERT INTO "rpm_block_massive_action" (id, rpm_block_id, text, color, text_color, leverage, duration_amount, duration_unit, priority, key, start_date, end_date, is_date_range, hour, missed_date)
VALUES 
  ('33333333-dddd-dddd-dddd-333333333333', '11111111-aaaa-aaaa-aaaa-111111111111', 'Create landing page', '#FF5733', '#FFFFFF', 'High visibility', 3, 'days', 1, 'Design', '2025-04-01', '2025-04-03', TRUE, 2, NULL),
  ('33333333-eeee-eeee-eeee-333333333333', '11111111-aaaa-aaaa-aaaa-111111111111', 'Collect feedback from users', '#33FFAA', '#000000', 'User input', 2, 'days', 2, 'Research', '2025-04-04', '2025-04-05', TRUE, 1, NULL);

-- ⚙️ rpm_block_massive_action_note
INSERT INTO "rpm_block_massive_action_note" (id, massive_action_id, text, type)
VALUES 
  ('44444444-aaaa-aaaa-aaaa-444444444444', '33333333-dddd-dddd-dddd-333333333333', 'Started designing homepage', 'Progress'),
  ('44444444-bbbb-bbbb-bbbb-444444444444', '33333333-eeee-eeee-eeee-333333333333', 'Sent first batch of surveys', 'Update');

-- ⚙️ rpm_block_massive_action_note_metric
INSERT INTO "rpm_block_massive_action_note_metric" (note_id, name, value, unit, timestamp)
VALUES 
  ('44444444-aaaa-aaaa-aaaa-444444444444', 'Homepage Completion', 60, 'percent', NOW());

-- ==============================
-- Calendar Event Table
-- ==============================
INSERT INTO "calendar_event" (id, title, description, start_date, end_date, location, category, color, created_at, updated_at)
VALUES
  ('88888888-8888-8888-8888-888888888888', 'Project Kickoff', 'Initial project planning meeting', '2025-03-27 09:00:00', '2025-03-27 11:00:00', 'Conference Room A', 'Meeting', '#FF5733', NOW(), NOW()),
  ('99999999-9999-9999-9999-999999999999', 'Team Review', 'Weekly team progress review', '2025-03-28 14:00:00', '2025-03-28 15:00:00', 'Virtual Meeting', 'Review', '#33FF57', NOW(), NOW());

-- ==============================
-- Calendar Event Massive Action Table
-- ==============================
INSERT INTO "calendar_event_massive_action" (calendar_event_id, massive_action_id)
VALUES
  ('88888888-8888-8888-8888-888888888888', '33333333-dddd-dddd-dddd-333333333333'),
  ('99999999-9999-9999-9999-999999999999', '33333333-eeee-eeee-eeee-333333333333');
