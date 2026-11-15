USE smart_gym;

-- Run these manually (they change data) and take screenshots
-- UPDATE
UPDATE member SET trainer_id = 3 WHERE member_id = 4;
UPDATE appointment SET status = 'Completed' WHERE date < CURDATE() AND status = 'Scheduled';
UPDATE payment SET status = 'Failed' WHERE status = 'Pending' AND payment_date < DATE_SUB(NOW(), INTERVAL 1 DAY);

-- DELETE
DELETE FROM appointment WHERE status = 'Cancelled' AND date < DATE_SUB(CURDATE(), INTERVAL 90 DAY);
DELETE FROM attendance  WHERE date < DATE_SUB(CURDATE(), INTERVAL 2 YEAR);

-- TRANSACTION with SAVEPOINT / ROLLBACK
START TRANSACTION;
  UPDATE payment SET status = 'Failed' WHERE payment_id = 2;
  SAVEPOINT after_payment;
  UPDATE membership SET status = 'Cancelled' WHERE membership_id = 2;
  ROLLBACK TO SAVEPOINT after_payment;   -- undo only the membership change
ROLLBACK;                                -- undo the whole transaction

-- Calling the stored routines
CALL sp_renew_membership(2, 'Monthly', 1, 1800.00, 'UPI', 'UPI-0005', @new_ms);
SELECT @new_ms AS new_membership_id;
CALL sp_book_appointment(1, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '09:00:00', '10:00:00', @appt);
CALL sp_check_in(1);
CALL sp_check_out(1);
CALL sp_monthly_revenue(YEAR(CURDATE()));
SELECT fn_days_remaining(1) AS days_left, fn_attendance_rate(1, 30) AS attendance_pct;
