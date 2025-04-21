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
  ('33333333-dddd-dddd-dddd-333333333333', '11111111-aaaa-aaaa-aaaa-111111111111', 'Create landing page', '#FF5733', '#FFFFFF', 'High visibility', 3, 'days', 1, 'Design', '2025-04-15', '2025-05-15', TRUE, 2, NULL, 'Design and implement landing page', 'Remote', '11111111-1111-1111-1111-111111111111'),
  ('33333333-eeee-eeee-eeee-333333333333', '11111111-aaaa-aaaa-aaaa-111111111111', 'Collect feedback from users', '#33FFAA', '#000000', 'User input', 2, 'days', 2, 'Research', '2025-04-04', '2025-04-25', TRUE, 1, NULL, 'Gather user feedback on MVP', 'Remote', '11111111-1111-1111-1111-111111111111'),
  -- New test cases for calendar events
  ('33333333-ffff-ffff-ffff-333333333333', '11111111-aaaa-aaaa-aaaa-111111111111', 'Weekly Team Meeting', '#3366FF', '#FFFFFF', 'Team coordination', 1, 'hour', 1, 'Meeting', '2025-03-01', '2025-12-31', TRUE, 10, NULL, 'Weekly team sync meeting', 'Conference Room A', '22222222-2222-2222-2222-222222222222'),
  ('33333333-abcd-abcd-abcd-333333333333', '22222222-aaaa-aaaa-aaaa-222222222222', 'Morning Workout', '#FF3366', '#FFFFFF', 'Physical health', 1, 'hour', 1, 'Fitness', '2025-03-01', '2025-12-31', TRUE, 7, NULL, 'Daily morning workout routine', 'Gym', '33333333-1111-1111-1111-111111111111'),
  ('33333333-cdef-cdef-cdef-333333333333', '22222222-aaaa-aaaa-aaaa-222222222222', 'Project Review', '#33FF66', '#000000', 'Project progress', 2, 'hours', 2, 'Review', '2025-03-15', '2025-03-15', FALSE, 14, NULL, 'Quarterly project review meeting', 'Conference Room B', '22222222-2222-2222-2222-222222222222'),
  ('33333333-8888-8888-8888-333333333333', '11111111-aaaa-aaaa-aaaa-111111111111', 'Client Call', '#FF6633', '#FFFFFF', 'Client communication', 1, 'hour', 3, 'Meeting', '2025-03-20', '2025-03-20', FALSE, 15, NULL, 'Monthly client status call', 'Remote', '22222222-2222-2222-2222-222222222222');
  
-- ⚙️ rpm_block_massive_action_note
INSERT INTO "rpm_block_massive_action_note" (id, massive_action_id, text, type)
VALUES 
  ('44444444-aaaa-aaaa-aaaa-444444444444', '33333333-dddd-dddd-dddd-333333333333', 'Sent first batch of surveys', 'Update'),
  ('55555555-aaaa-aaaa-aaaa-555555555555', '33333333-dddd-dddd-dddd-333333333333', 'Completed 3K run', 'Progress'),
  ('55555555-bbbb-bbbb-bbbb-555555555555', '33333333-dddd-dddd-dddd-333333333333', 'Improved flexibility', 'Update');

-- ⚙️ rpm_block_massive_action_note_metric
INSERT INTO "rpm_block_massive_action_note_metric" (note_id, name, value, unit, timestamp)
VALUES 
  ('44444444-aaaa-aaaa-aaaa-444444444444', 'Homepage Completion', 60, 'percent', NOW()),
  ('55555555-aaaa-aaaa-aaaa-555555555555', 'Distance Covered', 3, 'kilometers', NOW());

-- ⚙️ rpm_massive_action_recurrence
INSERT INTO "rpm_massive_action_recurrence" (id, action_id, day_of_week, created_at, updated_at)
VALUES
  ('66666666-aaaa-aaaa-aaaa-666666666666', '33333333-eeee-eeee-eeee-333333333333', 'Monday', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('66666666-bbbb-bbbb-bbbb-666666666666', '33333333-dddd-dddd-dddd-333333333333', 'Friday', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('66666666-cccc-cccc-cccc-666666666666', '33333333-eeee-eeee-eeee-333333333333', 'Wednesday', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('66666666-dddd-dddd-dddd-666666666666', '33333333-eeee-eeee-eeee-333333333333', 'Friday', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  -- New recurrence patterns for test cases
  ('66666666-eeee-eeee-eeee-666666666666', '33333333-ffff-ffff-ffff-333333333333', 'Monday', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('66666666-ffff-ffff-ffff-666666666666', '33333333-abcd-abcd-abcd-333333333333', 'Monday', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('66666666-9999-9999-9999-666666666666', '33333333-abcd-abcd-abcd-333333333333', 'Wednesday', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('66666666-cdef-cdef-cdef-666666666666', '33333333-abcd-abcd-abcd-333333333333', 'Friday', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- ⚙️ rpm_massive_action_recurrence_exception
-- ⚙️ rpm_massive_action_recurrence_exception
INSERT INTO "rpm_massive_action_recurrence_exception" (id, action_id, action_recurrence_id, exception_date, reason, created_at, updated_at)
VALUES
  -- Exception for the Monday recurrence pattern of the "Collect feedback from users" action
  ('77777777-aaaa-aaaa-aaaa-777777777777', '33333333-eeee-eeee-eeee-333333333333', '66666666-cccc-cccc-cccc-666666666666', '2025-03-14', 'Holiday', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  -- Exception for the Friday recurrence pattern of the "Collect feedback from users" action
  -- Exceptions for the "Weekly Team Meeting" action
  ('77777777-cccc-cccc-cccc-777777777777', '33333333-ffff-ffff-ffff-333333333333', '66666666-eeee-eeee-eeee-666666666666', '2025-03-10', 'Public holiday', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('77777777-9999-9999-9999-777777777777', '33333333-ffff-ffff-ffff-333333333333', '66666666-eeee-eeee-eeee-666666666666', '2025-04-07', 'Vacation', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)