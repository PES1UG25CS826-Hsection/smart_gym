-- Drops everything so the scripts can be re-run from scratch (safe on first run too)
DROP DATABASE IF EXISTS smart_gym;
DROP USER IF EXISTS 'gym_admin_user'@'localhost';
DROP USER IF EXISTS 'gym_trainer_user'@'localhost';
DROP USER IF EXISTS 'gym_member_user'@'localhost';
DROP USER IF EXISTS 'gym_auth_user'@'localhost';
DROP ROLE IF EXISTS 'gym_admin', 'gym_trainer', 'gym_member', 'gym_auth';
