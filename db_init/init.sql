SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `matriculado_has_asignatura`;
DROP TABLE IF EXISTS `avancecurricular`;
DROP TABLE IF EXISTS `matriculado`;
DROP TABLE IF EXISTS `asignatura`;
DROP TABLE IF EXISTS `planestudios`;

CREATE TABLE `planestudios` (
  `codigo` char(4) NOT NULL,
  `glosa` varchar(90) NOT NULL,
  `codigoSIES` varchar(10) NOT NULL,
  PRIMARY KEY (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `asignatura` (
  `codAsignatura` varchar(12) NOT NULL,
  `prerrequisitos` varchar(150) DEFAULT NULL,
  `nombreAsignatura` varchar(80) NOT NULL,
  `PlanEstudios_codigo` char(4) NOT NULL,
  PRIMARY KEY (`codAsignatura`,`PlanEstudios_codigo`),
  KEY `fk_Asignatura_PlanEstudios1_idx` (`PlanEstudios_codigo`),
  CONSTRAINT `fk_Asignatura_PlanEstudios1` FOREIGN KEY (`PlanEstudios_codigo`) REFERENCES `planestudios` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `matriculado` (
  `rut` varchar(8) NOT NULL,
  `dv` char(1) NOT NULL,
  `nombreCompleto` varchar(150) NOT NULL,
  `anioIngreso` char(4) NOT NULL,
  `semestre` char(1) NOT NULL,
  `PlanEstudios_codigo` char(4) NOT NULL,
  `anioMatricula` char(4) NOT NULL,
  PRIMARY KEY (`PlanEstudios_codigo`,`rut`,`semestre`,`anioIngreso`,`anioMatricula`),
  KEY `fk_Matriculado_PlanEstudios_idx` (`PlanEstudios_codigo`),
  CONSTRAINT `fk_Matriculado_PlanEstudios` FOREIGN KEY (`PlanEstudios_codigo`) REFERENCES `planestudios` (`codigo`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `avancecurricular` (
  `anio` char(4) NOT NULL,
  `semestre` char(4) NOT NULL,
  `asignatura_codAsignatura` varchar(12) NOT NULL,
  `asignatura_PlanEstudios_codigo` char(4) NOT NULL,
  `matriculado_PlanEstudios_codigo` char(4) NOT NULL,
  `matriculado_rut` varchar(8) NOT NULL,
  `matriculado_semestre` char(1) NOT NULL,
  `matriculado_anioIngreso` char(4) NOT NULL,
  `PlanEstudios_codigo` char(4) NOT NULL,
  `matriculado_anioMatricula` char(4) NOT NULL,
  PRIMARY KEY (`asignatura_codAsignatura`,`asignatura_PlanEstudios_codigo`,`matriculado_PlanEstudios_codigo`,`matriculado_rut`,`matriculado_semestre`,`matriculado_anioIngreso`,`matriculado_anioMatricula`),
  KEY `fk_avancecurricular_matriculado1_idx` (`matriculado_PlanEstudios_codigo`,`matriculado_rut`,`matriculado_semestre`,`matriculado_anioIngreso`),
  KEY `fk_AvanceCurricular_PlanEstudios` (`PlanEstudios_codigo`),
  KEY `fk_avancecurricular_matriculado1` (`matriculado_PlanEstudios_codigo`,`matriculado_rut`,`matriculado_semestre`,`matriculado_anioIngreso`,`matriculado_anioMatricula`),
  CONSTRAINT `fk_avancecurricular_asignatura1` FOREIGN KEY (`asignatura_codAsignatura`, `asignatura_PlanEstudios_codigo`) REFERENCES `asignatura` (`codAsignatura`, `PlanEstudios_codigo`) ON DELETE CASCADE,
  CONSTRAINT `fk_avancecurricular_matriculado1` FOREIGN KEY (`matriculado_PlanEstudios_codigo`, `matriculado_rut`, `matriculado_semestre`, `matriculado_anioIngreso`, `matriculado_anioMatricula`) REFERENCES `matriculado` (`PlanEstudios_codigo`, `rut`, `semestre`, `anioIngreso`, `anioMatricula`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_AvanceCurricular_PlanEstudios` FOREIGN KEY (`PlanEstudios_codigo`) REFERENCES `planestudios` (`codigo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `matriculado_has_asignatura` (
  `estado` tinyint NOT NULL DEFAULT '1',
  `Asignatura_codAsignatura` varchar(45) NOT NULL,
  `matriculado_PlanEstudios_codigo` char(4) NOT NULL,
  `matriculado_rut` varchar(8) NOT NULL,
  `matriculado_semestre` char(1) NOT NULL,
  `matriculado_anioIngreso` char(4) NOT NULL,
  `matriculado_anioMatricula` char(4) NOT NULL,
  PRIMARY KEY (`Asignatura_codAsignatura`,`matriculado_PlanEstudios_codigo`,`matriculado_rut`,`matriculado_semestre`,`matriculado_anioIngreso`,`matriculado_anioMatricula`),
  KEY `fk_Matriculado_has_Asignatura_Asignatura1_idx` (`Asignatura_codAsignatura`),
  KEY `fk_matriculado_has_asignatura_matriculado1_idx` (`matriculado_PlanEstudios_codigo`,`matriculado_rut`,`matriculado_semestre`,`matriculado_anioIngreso`),
  KEY `fk_matriculado_has_asignatura_matriculado1` (`matriculado_PlanEstudios_codigo`,`matriculado_rut`,`matriculado_semestre`,`matriculado_anioIngreso`,`matriculado_anioMatricula`),
  CONSTRAINT `fk_Matriculado_has_Asignatura_Asignatura1` FOREIGN KEY (`Asignatura_codAsignatura`) REFERENCES `asignatura` (`codAsignatura`),
  CONSTRAINT `fk_matriculado_has_asignatura_matriculado1` FOREIGN KEY (`matriculado_PlanEstudios_codigo`, `matriculado_rut`, `matriculado_semestre`, `matriculado_anioIngreso`, `matriculado_anioMatricula`) REFERENCES `matriculado` (`PlanEstudios_codigo`, `rut`, `semestre`, `anioIngreso`, `anioMatricula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Insertar datos
INSERT INTO `planestudios` VALUES 
  ('CIN','INGENIERIA CIVIL EN INFORMATICA Decreto Res.Ex.No5125','19085'),
  ('ICI','INGENIERIA CIVIL EN INFORMATICA Decreto N Res. Ex. N2475/3473(2020)','19085'),
  ('IEJ','INGENIERIA DE EJECUCION EN INFORMATICA (Salida Intermedia) Decreto 7263','1908502'),
  ('IIN','INGENIERIA EN INFORMATICA (Salida Intermedia) - Decreto 7263','1908501'),
  ('INC','INGENIERIA CIVIL EN INFORMATICA Decreto 7263/10','19085'),
  ('INF','INGENIERIA CIVIL EN INFORMATICA Decreto Res.Ex.No5329','19085');

SET FOREIGN_KEY_CHECKS = 1;