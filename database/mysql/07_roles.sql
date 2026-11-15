-- EDIT the CHANGE_ME passwords below before running; the same values go in .env.local
-- Database-level role based access control (replace passwords; keep them in .env)
CREATE ROLE 'gym_admin', 'gym_trainer', 'gym_member', 'gym_auth';

-- Admin: full access to the gym database
GRANT ALL PRIVILEGES ON smart_gym.* TO 'gym_admin';

-- Trainer: manage appointments and plans; cannot read password hashes or payments
GRANT SELECT ON smart_gym.v_member_public    TO 'gym_trainer';
GRANT SELECT ON smart_gym.exercise           TO 'gym_trainer';
GRANT SELECT ON smart_gym.attendance         TO 'gym_trainer';
GRANT SELECT ON smart_gym.v_active_memberships TO 'gym_trainer';
GRANT SELECT, INSERT, UPDATE ON smart_gym.appointment   TO 'gym_trainer';
GRANT SELECT, INSERT, UPDATE ON smart_gym.workout_plan  TO 'gym_trainer';
GRANT SELECT, INSERT, UPDATE, DELETE ON smart_gym.plan_exercise TO 'gym_trainer';
GRANT EXECUTE ON PROCEDURE smart_gym.sp_book_appointment TO 'gym_trainer';

-- Member: exercise catalogue + stored procedures only; no direct table access
GRANT SELECT ON smart_gym.exercise TO 'gym_member';
GRANT EXECUTE ON PROCEDURE smart_gym.sp_renew_membership  TO 'gym_member';
GRANT EXECUTE ON PROCEDURE smart_gym.sp_book_appointment  TO 'gym_member';
GRANT EXECUTE ON PROCEDURE smart_gym.sp_check_in          TO 'gym_member';
GRANT EXECUTE ON PROCEDURE smart_gym.sp_check_out         TO 'gym_member';
GRANT EXECUTE ON PROCEDURE smart_gym.sp_member_dashboard  TO 'gym_member';
GRANT EXECUTE ON FUNCTION  smart_gym.fn_days_remaining    TO 'gym_member';
GRANT EXECUTE ON FUNCTION  smart_gym.fn_attendance_rate   TO 'gym_member';

-- Login lookup only: id, email, password hash (column-level grants)
GRANT SELECT (admin_id,   email, password_hash) ON smart_gym.admin   TO 'gym_auth';
GRANT SELECT (trainer_id, email, password_hash) ON smart_gym.trainer TO 'gym_auth';
GRANT SELECT (member_id,  email, password_hash) ON smart_gym.member  TO 'gym_auth';

-- One MySQL user per role; the API connects with the user matching the JWT role
CREATE USER 'gym_admin_user'@'localhost'   IDENTIFIED BY 'CHANGE_ME_1';
CREATE USER 'gym_trainer_user'@'localhost' IDENTIFIED BY 'CHANGE_ME_2';
CREATE USER 'gym_member_user'@'localhost'  IDENTIFIED BY 'CHANGE_ME_3';
CREATE USER 'gym_auth_user'@'localhost'    IDENTIFIED BY 'CHANGE_ME_4';
GRANT 'gym_admin'   TO 'gym_admin_user'@'localhost';
GRANT 'gym_trainer' TO 'gym_trainer_user'@'localhost';
GRANT 'gym_member'  TO 'gym_member_user'@'localhost';
GRANT 'gym_auth'    TO 'gym_auth_user'@'localhost';
SET DEFAULT ROLE 'gym_admin'   TO 'gym_admin_user'@'localhost';
SET DEFAULT ROLE 'gym_trainer' TO 'gym_trainer_user'@'localhost';
SET DEFAULT ROLE 'gym_member'  TO 'gym_member_user'@'localhost';
SET DEFAULT ROLE 'gym_auth'    TO 'gym_auth_user'@'localhost';

GRANT SELECT (name) ON smart_gym.admin   TO 'gym_auth';
GRANT SELECT (name) ON smart_gym.trainer TO 'gym_auth';
GRANT SELECT (name) ON smart_gym.member  TO 'gym_auth';
