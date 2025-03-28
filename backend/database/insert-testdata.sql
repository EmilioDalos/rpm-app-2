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
INSERT INTO rpm_block (id, category_id, result, type, created_at, updated_at, saved)
VALUES
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Become a better programmer', 'Learning', NOW(), NOW(), TRUE);

-- ==============================
-- RPM Purpose Table
-- ==============================
INSERT INTO rpm_purpose (rpm_block_id, purpose)
VALUES
  ('55555555-5555-5555-5555-555555555555', 'To gain mastery in programming');

-- ==============================
-- Massive Action Table
-- ==============================
INSERT INTO massive_action (id, category_id, text, color, text_color, priority, key, created_at, updated_at)
VALUES
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Complete TypeScript Course', '#FF5733', '#FFFFFF', 1, 'Learning', NOW(), NOW());

-- ==============================
-- Massive Action Note Table
-- ==============================
INSERT INTO massive_action_note (id, massive_action_id, text, type, created_at)
VALUES
  ('77777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666666', 'Watched Introduction Videos', 'Progress', NOW());

-- ==============================
-- Massive Action Note Metric Table
-- ==============================
INSERT INTO massive_action_note_metric (note_id, name, value, unit, timestamp)
VALUES
  ('77777777-7777-7777-7777-777777777777', 'Progress', 10, 'percentage', NOW());

-- ==============================
-- Calendar Event Table
-- ==============================
INSERT INTO calendar_event (id, date, created_at, updated_at)
VALUES
  ('88888888-8888-8888-8888-888888888888', '2025-03-27', NOW(), NOW());

-- ==============================
-- Calendar Event Massive Action Table
-- ==============================
INSERT INTO calendar_event_massive_action (calendar_event_id, massive_action_id)
VALUES
  ('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666');