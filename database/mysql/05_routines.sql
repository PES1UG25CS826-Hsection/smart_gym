USE smart_gym;

DELIMITER $$

-- FUNCTION: days left on the member's active membership
CREATE FUNCTION fn_days_remaining(p_member_id INT) RETURNS INT
READS SQL DATA
BEGIN
  DECLARE v_days INT;
  SELECT MAX(DATEDIFF(end_date, CURDATE())) INTO v_days
  FROM membership
  WHERE member_id = p_member_id AND status = 'Active';
  RETURN GREATEST(COALESCE(v_days, 0), 0);
END$$

-- FUNCTION: % of the last N days the member attended
CREATE FUNCTION fn_attendance_rate(p_member_id INT, p_days INT) RETURNS DECIMAL(5,2)
READS SQL DATA
BEGIN
  DECLARE v_present INT;
  SELECT COUNT(DISTINCT date) INTO v_present
  FROM attendance
  WHERE member_id = p_member_id
    AND date > DATE_SUB(CURDATE(), INTERVAL p_days DAY);
  RETURN ROUND(v_present * 100 / p_days, 2);
END$$

-- PROCEDURE (transaction): renew membership and record the payment atomically
CREATE PROCEDURE sp_renew_membership(
  IN  p_member_id INT, IN p_type VARCHAR(50), IN p_months INT,
  IN  p_amount DECIMAL(10,2), IN p_method VARCHAR(50), IN p_ref VARCHAR(100),
  OUT p_membership_id INT)
BEGIN
  DECLARE v_last  DATE;
  DECLARE v_start DATE;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
    SELECT MAX(end_date) INTO v_last
    FROM membership WHERE member_id = p_member_id AND status = 'Active';

    IF v_last IS NULL OR v_last < CURDATE() THEN
      SET v_start = CURDATE();
    ELSE
      SET v_start = DATE_ADD(v_last, INTERVAL 1 DAY);
    END IF;

    INSERT INTO membership (member_id, type, start_date, end_date, status, amount)
    VALUES (p_member_id, p_type, v_start, DATE_ADD(v_start, INTERVAL p_months MONTH), 'Active', p_amount);
    SET p_membership_id = LAST_INSERT_ID();

    INSERT INTO payment (membership_id, amount, payment_method, status, reference_no)
    VALUES (p_membership_id, p_amount, p_method, 'Success', p_ref);
  COMMIT;
END$$

-- PROCEDURE: book an appointment (membership check + overlap trigger)
CREATE PROCEDURE sp_book_appointment(
  IN p_member_id INT, IN p_trainer_id INT, IN p_date DATE,
  IN p_start TIME, IN p_end TIME, OUT p_appointment_id INT)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
    IF fn_days_remaining(p_member_id) = 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Active membership required to book';
    END IF;
    INSERT INTO appointment (member_id, trainer_id, date, start_time, end_time)
    VALUES (p_member_id, p_trainer_id, p_date, p_start, p_end);
    SET p_appointment_id = LAST_INSERT_ID();
  COMMIT;
END$$

-- PROCEDURES: gym check-in / check-out
CREATE PROCEDURE sp_check_in(IN p_member_id INT)
BEGIN
  INSERT INTO attendance (member_id, date, check_in, status)
  VALUES (p_member_id, CURDATE(), CURTIME(), 'Present');
END$$

CREATE PROCEDURE sp_check_out(IN p_member_id INT)
BEGIN
  UPDATE attendance SET check_out = CURTIME()
  WHERE member_id = p_member_id AND date = CURDATE() AND check_out IS NULL
  ORDER BY check_in DESC LIMIT 1;
END$$

-- PROCEDURE: one member's dashboard (the DB cannot filter rows by app user,
-- so members read their own data only through this procedure)
CREATE PROCEDURE sp_member_dashboard(IN p_member_id INT)
BEGIN
  SELECT m.name, m.trainer_id,
         fn_days_remaining(m.member_id)     AS days_left,
         fn_attendance_rate(m.member_id,30) AS attendance_pct_30d
  FROM member m WHERE m.member_id = p_member_id;
END$$

-- PROCEDURE with CTE: monthly revenue report for a year
CREATE PROCEDURE sp_monthly_revenue(IN p_year INT)
BEGIN
  WITH monthly AS (
    SELECT MONTH(payment_date) AS m, SUM(amount) AS revenue
    FROM payment
    WHERE status = 'Success' AND YEAR(payment_date) = p_year
    GROUP BY MONTH(payment_date)
  )
  SELECT m AS month_no, revenue,
         ROUND(revenue * 100 / (SELECT SUM(revenue) FROM monthly), 2) AS pct_of_year
  FROM monthly ORDER BY m;
END$$

DELIMITER ;

-- EVENT: expire memberships automatically every day
SET GLOBAL event_scheduler = ON;
CREATE EVENT ev_expire_memberships
ON SCHEDULE EVERY 1 DAY STARTS CURRENT_TIMESTAMP
DO UPDATE membership SET status = 'Expired'
   WHERE status = 'Active' AND end_date < CURDATE();

