USE smart_gym;

CREATE OR REPLACE VIEW v_active_memberships AS
SELECT m.member_id, m.name AS member_name, ms.membership_id, ms.type,
       ms.start_date, ms.end_date,
       DATEDIFF(ms.end_date, CURDATE()) AS days_left
FROM membership ms
JOIN member m ON m.member_id = ms.member_id
WHERE ms.status = 'Active' AND ms.end_date >= CURDATE();

CREATE OR REPLACE VIEW v_trainer_workload AS
SELECT t.trainer_id, t.name AS trainer_name,
       COUNT(DISTINCT m.member_id) AS total_members,
       COUNT(DISTINCT CASE WHEN a.status = 'Scheduled' AND a.date >= CURDATE()
                           THEN a.appointment_id END) AS upcoming_appointments
FROM trainer t
LEFT JOIN member m      ON m.trainer_id = t.trainer_id
LEFT JOIN appointment a ON a.trainer_id = t.trainer_id
GROUP BY t.trainer_id, t.name;

CREATE OR REPLACE VIEW v_monthly_revenue AS
SELECT DATE_FORMAT(payment_date, '%Y-%m') AS month,
       COUNT(*) AS payments,
       SUM(amount) AS revenue
FROM payment
WHERE status = 'Success'
GROUP BY DATE_FORMAT(payment_date, '%Y-%m');

CREATE OR REPLACE VIEW v_member_public AS
SELECT member_id, name, email, phone, gender, dob, trainer_id
FROM member;   -- hides password_hash from non-admin roles

