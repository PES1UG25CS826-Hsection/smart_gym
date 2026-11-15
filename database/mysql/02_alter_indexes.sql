USE smart_gym;

-- ALTER: TRAINER and MEMBER need credentials so every role can log in
ALTER TABLE trainer ADD COLUMN password_hash VARCHAR(255) NOT NULL AFTER email;
ALTER TABLE member  ADD COLUMN password_hash VARCHAR(255) NOT NULL AFTER email;

-- ALTER: add a constraint after creation
ALTER TABLE member
  ADD CONSTRAINT chk_member_email CHECK (email LIKE '%_@_%._%');

-- INDEXES for frequent lookups
CREATE INDEX idx_membership_member_status ON membership (member_id, status);
CREATE INDEX idx_membership_end_date      ON membership (end_date);
CREATE INDEX idx_payment_date             ON payment (payment_date);
CREATE INDEX idx_attendance_member_date   ON attendance (member_id, date);
CREATE INDEX idx_appt_trainer_date        ON appointment (trainer_id, date, start_time);

-- FULLTEXT indexes (full-text search)
ALTER TABLE exercise ADD FULLTEXT INDEX ft_exercise (name, description);
ALTER TABLE trainer  ADD FULLTEXT INDEX ft_trainer_spec (specialization);

-- Full-text search example
SELECT exercise_id, name, muscle_group
FROM exercise
WHERE MATCH(name, description) AGAINST('squat leg strength' IN NATURAL LANGUAGE MODE);

-- DROP demos (temporary objects only)
CREATE TABLE temp_demo (id INT PRIMARY KEY, note VARCHAR(50));
CREATE INDEX idx_temp_note ON temp_demo (note);
DROP INDEX idx_temp_note ON temp_demo;
DROP TABLE temp_demo;

