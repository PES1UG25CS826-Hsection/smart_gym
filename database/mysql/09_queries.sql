USE smart_gym;

-- Q1 JOIN (4 tables): each member's plan with exercise details
SELECT m.name AS member, t.name AS trainer, wp.goal,
       e.name AS exercise, e.muscle_group, pe.set_count, pe.reps
FROM workout_plan wp
JOIN member m         ON m.member_id = wp.member_id
JOIN trainer t        ON t.trainer_id = wp.trainer_id
JOIN plan_exercise pe ON pe.plan_id = wp.plan_id
JOIN exercise e       ON e.exercise_id = pe.exercise_id
ORDER BY m.name, e.name;

-- Q2 GROUP BY + HAVING: trainers handling at least 2 members
SELECT t.name, COUNT(m.member_id) AS members
FROM trainer t
LEFT JOIN member m ON m.trainer_id = t.trainer_id
GROUP BY t.trainer_id, t.name
HAVING COUNT(m.member_id) >= 2
ORDER BY members DESC;

-- Q3 Aggregate: revenue by membership type
SELECT ms.type, COUNT(*) AS sold, SUM(p.amount) AS revenue, AVG(p.amount) AS avg_amount
FROM payment p
JOIN membership ms ON ms.membership_id = p.membership_id
WHERE p.status = 'Success'
GROUP BY ms.type
ORDER BY revenue DESC;

-- Q4 NESTED subquery: members with no visit in the last 30 days
SELECT member_id, name
FROM member
WHERE member_id NOT IN (SELECT member_id FROM attendance
                        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY));

-- Q5 CORRELATED subquery: payments above that member's own average
SELECT p.payment_id, ms.member_id, p.amount
FROM payment p
JOIN membership ms ON ms.membership_id = p.membership_id
WHERE p.amount > (SELECT AVG(p2.amount)
                  FROM payment p2
                  JOIN membership ms2 ON ms2.membership_id = p2.membership_id
                  WHERE ms2.member_id = ms.member_id);

-- Q6 NON-RECURSIVE CTE: top 5 most regular members this month
WITH visits AS (
  SELECT member_id, COUNT(*) AS visit_count
  FROM attendance
  WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  GROUP BY member_id
)
SELECT m.name, v.visit_count
FROM visits v JOIN member m ON m.member_id = v.member_id
ORDER BY v.visit_count DESC
LIMIT 5;

-- Q7 RECURSIVE CTE: days a member missed in the last 30 days
WITH RECURSIVE calendar AS (
  SELECT DATE_SUB(CURDATE(), INTERVAL 29 DAY) AS d
  UNION ALL
  SELECT DATE_ADD(d, INTERVAL 1 DAY) FROM calendar WHERE d < CURDATE()
)
SELECT c.d AS missed_day
FROM calendar c
LEFT JOIN attendance a ON a.date = c.d AND a.member_id = 1
WHERE a.attendance_id IS NULL
ORDER BY c.d;

-- Q8 Memberships expiring within 7 days
SELECT member_name, type, end_date, days_left
FROM v_active_memberships
WHERE days_left BETWEEN 0 AND 7;

-- Q9 Index usage check
EXPLAIN SELECT * FROM attendance WHERE member_id = 1 AND date >= '2026-11-01';

