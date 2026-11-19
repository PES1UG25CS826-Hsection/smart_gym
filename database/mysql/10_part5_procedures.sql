-- Part 5: read/cancel procedures for the member role (run as root)
USE smart_gym;

DROP PROCEDURE IF EXISTS sp_member_memberships;
DROP PROCEDURE IF EXISTS sp_member_appointments;
DROP PROCEDURE IF EXISTS sp_member_plan;
DROP PROCEDURE IF EXISTS sp_cancel_appointment;
DROP PROCEDURE IF EXISTS sp_list_trainers;

DELIMITER $$

CREATE PROCEDURE sp_member_memberships(IN p_member_id INT)
BEGIN
  SELECT membership_id, type, start_date, end_date, status, amount
  FROM membership WHERE member_id = p_member_id
  ORDER BY start_date DESC;
END$$

CREATE PROCEDURE sp_member_appointments(IN p_member_id INT)
BEGIN
  SELECT a.appointment_id, a.date, a.start_time, a.end_time, a.status, a.notes, t.name AS trainer
  FROM appointment a JOIN trainer t ON t.trainer_id = a.trainer_id
  WHERE a.member_id = p_member_id
  ORDER BY a.date DESC, a.start_time DESC
  LIMIT 30;
END$$

CREATE PROCEDURE sp_member_plan(IN p_member_id INT)
BEGIN
  SELECT wp.plan_id, wp.goal, wp.start_date, wp.end_date, wp.description,
         t.name AS trainer, e.name AS exercise, e.muscle_group,
         pe.set_count, pe.reps, pe.notes
  FROM workout_plan wp
  JOIN trainer t        ON t.trainer_id = wp.trainer_id
  JOIN plan_exercise pe ON pe.plan_id = wp.plan_id
  JOIN exercise e       ON e.exercise_id = pe.exercise_id
  WHERE wp.member_id = p_member_id
  ORDER BY wp.start_date DESC, wp.plan_id DESC, e.name;
END$$

-- Only the member's own upcoming, still-scheduled appointment can be cancelled
CREATE PROCEDURE sp_cancel_appointment(IN p_member_id INT, IN p_appointment_id INT)
BEGIN
  UPDATE appointment SET status = 'Cancelled'
  WHERE appointment_id = p_appointment_id AND member_id = p_member_id
    AND status = 'Scheduled' AND date >= CURDATE();
  IF ROW_COUNT() = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This appointment cannot be cancelled';
  END IF;
END$$

CREATE PROCEDURE sp_list_trainers(IN p_search VARCHAR(100))
BEGIN
  SELECT trainer_id, name, specialization FROM trainer
  WHERE p_search = '' OR name LIKE CONCAT('%', p_search, '%')
     OR specialization LIKE CONCAT('%', p_search, '%')
  ORDER BY name;
END$$

DELIMITER ;

GRANT EXECUTE ON PROCEDURE smart_gym.sp_member_memberships  TO 'gym_member';
GRANT EXECUTE ON PROCEDURE smart_gym.sp_member_appointments TO 'gym_member';
GRANT EXECUTE ON PROCEDURE smart_gym.sp_member_plan         TO 'gym_member';
GRANT EXECUTE ON PROCEDURE smart_gym.sp_cancel_appointment  TO 'gym_member';
GRANT EXECUTE ON PROCEDURE smart_gym.sp_list_trainers       TO 'gym_member';
