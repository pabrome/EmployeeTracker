	
DROP DATABASE IF EXISTS company;
CREATE DATABASE company;
USE company;

DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO departments (name) 
VALUES 
("Marketing"),
("Accounting"),
("Sales");

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(30) DEFAULT NULL,
  `salary` decimal(10,0) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO roles (title, salary, department_id) 
VALUES 
  ("Sales associate", 60000, 3),
  ("Sales director", 80000, 3),
  ("Marketing analyst", 50000, 1),
  ("Marketing manager", 70000, 1),
  ("Junior accountant", 55000, 2),
  ("Senior accountant", 65000, 2);


DROP TABLE IF EXISTS `employee`;
CREATE TABLE `employee` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(30) DEFAULT NULL,
  `last_name` varchar(30) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO employee (first_name, last_name, role_id, department_id, manager_id) 
VALUES 
  ("Jason", "Smith", 2, 3, NULL),
  ("Elizabeth", "Swan", 1, 3, 1),
  ("Will", "Turner", 5, 2, NULL),
  ("Jack", "Sparrow", 6, 2, 3),
  ("Commodore", "Norrington", 5, 2, NULL);