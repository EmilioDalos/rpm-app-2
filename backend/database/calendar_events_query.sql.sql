
-- ⚙️ rpm_massive_action_recurrence_exception
INSERT INTO "rpm_massive_action_recurrence_exception" (id, action_id, action_recurrence_id, exception_date, reason, created_at, updated_at)
VALUES
  -- Exception for the Monday recurrence pattern of the "Collect feedback from users" action
  ('77777777-aaaa-aaaa-aaaa-777777777777', '33333333-eeee-eeee-eeee-333333333333', '66666666-cccc-cccc-cccc-666666666666', '2025-03-14', 'Holiday', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  -- Exception for the Friday recurrence pattern of the "Collect feedback from users" action
  -- Exceptions for the "Weekly Team Meeting" action
  ('77777777-cccc-cccc-cccc-777777777777', '33333333-ffff-ffff-ffff-333333333333', '66666666-eeee-eeee-eeee-666666666666', '2025-03-10', 'Public holiday', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('77777777-9999-9999-9999-777777777777', '33333333-ffff-ffff-ffff-333333333333', '66666666-eeee-eeee-eeee-666666666666', '2025-04-07', 'Vacation', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)