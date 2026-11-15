USE smart_gym;

DELIMITER $$

-- Data validation: date of birth must be in the past
CREATE TRIGGER trg_member_dob_ins BEFORE INSERT ON member
FOR EACH ROW
BEGIN
  IF NEW.dob >= CURDATE() THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Date of birth must be in the past';
  END IF;
END$$

CREATE TRIGGER trg_member_dob_upd BEFORE UPDATE ON member
FOR EACH ROW
BEGIN
  IF NEW.dob >= CURDATE() THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Date of birth must be in the past';
  END IF;
END$$

-- A successful payment activates a (non-cancelled, unexpired) membership
CREATE TRIGGER trg_payment_activate AFTER INSERT ON payment
FOR EACH ROW
BEGIN
  IF NEW.status = 'Success' THEN
    UPDATE membership SET status = 'Active'
    WHERE membership_id = NEW.membership_id
      AND status <> 'Cancelled' AND end_date >= CURDATE();
  END IF;
END$$

-- Check-in only allowed with an active membership
CREATE TRIGGER trg_attendance_membership BEFORE INSERT ON attendance
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM membership
                 WHERE member_id = NEW.member_id AND status = 'Active'
                   AND NEW.date BETWEEN start_date AND end_date) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No active membership for this member';
  END IF;
END$$

-- A trainer cannot have two overlapping scheduled appointments
CREATE TRIGGER trg_appointment_overlap BEFORE INSERT ON appointment
FOR EACH ROW
BEGIN
  IF NEW.status = 'Scheduled' AND EXISTS (
       SELECT 1 FROM appointment
       WHERE trainer_id = NEW.trainer_id AND date = NEW.date
         AND status = 'Scheduled'
         AND NEW.start_time < end_time AND NEW.end_time > start_time) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Trainer already booked in this time slot';
  END IF;
END$$

DELIMITER ;

