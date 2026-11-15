-- 1. DATABASE
CREATE DATABASE IF NOT EXISTS smart_gym
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_gym;

-- 2. TABLES (CREATE with PK, FK, UNIQUE, NOT NULL, CHECK, ENUM, DEFAULT)
CREATE TABLE admin (
  admin_id      INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(15),
  CONSTRAINT chk_admin_phone CHECK (phone IS NULL OR phone REGEXP '^[0-9]{10,15}$')
) ENGINE=InnoDB;

CREATE TABLE trainer (
  trainer_id     INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(100) NOT NULL UNIQUE,
  phone          VARCHAR(15),
  specialization VARCHAR(100),
  hire_date      DATE NOT NULL,
  admin_id       INT NOT NULL,
  CONSTRAINT chk_trainer_phone CHECK (phone IS NULL OR phone REGEXP '^[0-9]{10,15}$'),
  CONSTRAINT fk_trainer_admin FOREIGN KEY (admin_id)
    REFERENCES admin(admin_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE member (
  member_id  INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  phone      VARCHAR(15),
  gender     ENUM('M','F','O') NOT NULL,
  dob        DATE NOT NULL,
  address    VARCHAR(255),
  trainer_id INT NULL,
  CONSTRAINT chk_member_phone CHECK (phone IS NULL OR phone REGEXP '^[0-9]{10,15}$'),
  CONSTRAINT fk_member_trainer FOREIGN KEY (trainer_id)
    REFERENCES trainer(trainer_id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE membership (
  membership_id INT AUTO_INCREMENT PRIMARY KEY,
  member_id     INT NOT NULL,
  type          VARCHAR(50) NOT NULL,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  status        ENUM('Active','Expired','Cancelled') NOT NULL DEFAULT 'Active',
  amount        DECIMAL(10,2) NOT NULL,
  CONSTRAINT chk_membership_dates  CHECK (end_date >= start_date),
  CONSTRAINT chk_membership_amount CHECK (amount > 0),
  CONSTRAINT fk_membership_member FOREIGN KEY (member_id)
    REFERENCES member(member_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE payment (
  payment_id     INT AUTO_INCREMENT PRIMARY KEY,
  membership_id  INT NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  payment_date   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  payment_method VARCHAR(50) NOT NULL,
  status         ENUM('Success','Pending','Failed') NOT NULL DEFAULT 'Pending',
  reference_no   VARCHAR(100) NOT NULL UNIQUE,
  CONSTRAINT chk_payment_amount CHECK (amount > 0),
  CONSTRAINT fk_payment_membership FOREIGN KEY (membership_id)
    REFERENCES membership(membership_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE appointment (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  member_id      INT NOT NULL,
  trainer_id     INT NOT NULL,
  date           DATE NOT NULL,
  start_time     TIME NOT NULL,
  end_time       TIME NOT NULL,
  status         ENUM('Scheduled','Completed','Cancelled') NOT NULL DEFAULT 'Scheduled',
  notes          TEXT,
  CONSTRAINT chk_appointment_time CHECK (end_time > start_time),
  CONSTRAINT fk_appointment_member FOREIGN KEY (member_id)
    REFERENCES member(member_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_appointment_trainer FOREIGN KEY (trainer_id)
    REFERENCES trainer(trainer_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE attendance (
  attendance_id INT AUTO_INCREMENT PRIMARY KEY,
  member_id     INT NOT NULL,
  date          DATE NOT NULL,
  check_in      TIME NOT NULL,
  check_out     TIME NULL,
  status        ENUM('Present','Absent','Late') NOT NULL DEFAULT 'Present',
  CONSTRAINT chk_attendance_time CHECK (check_out IS NULL OR check_out > check_in),
  CONSTRAINT fk_attendance_member FOREIGN KEY (member_id)
    REFERENCES member(member_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE workout_plan (
  plan_id     INT AUTO_INCREMENT PRIMARY KEY,
  member_id   INT NOT NULL,
  trainer_id  INT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  goal        VARCHAR(255),
  description TEXT,
  CONSTRAINT chk_plan_dates CHECK (end_date >= start_date),
  CONSTRAINT fk_plan_member FOREIGN KEY (member_id)
    REFERENCES member(member_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_plan_trainer FOREIGN KEY (trainer_id)
    REFERENCES trainer(trainer_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE exercise (
  exercise_id  INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL UNIQUE,
  muscle_group VARCHAR(100) NOT NULL,
  description  TEXT
) ENGINE=InnoDB;

CREATE TABLE plan_exercise (
  plan_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id          INT NOT NULL,
  exercise_id      INT NOT NULL,
  set_count        INT NOT NULL,
  reps             INT NOT NULL,
  notes            TEXT,
  CONSTRAINT uq_plan_exercise UNIQUE (plan_id, exercise_id),
  CONSTRAINT chk_plan_exercise_vals CHECK (set_count > 0 AND reps > 0),
  CONSTRAINT fk_pe_plan FOREIGN KEY (plan_id)
    REFERENCES workout_plan(plan_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_pe_exercise FOREIGN KEY (exercise_id)
    REFERENCES exercise(exercise_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

