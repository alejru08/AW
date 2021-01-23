-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-01-2021 a las 21:25:22
-- Versión del servidor: 10.4.16-MariaDB
-- Versión de PHP: 7.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `404`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `etiqueta`
--

CREATE TABLE `etiqueta` (
  `Id` int(11) NOT NULL,
  `Nombre` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `etiqueta`
--

INSERT INTO `etiqueta` (`Id`, `Nombre`) VALUES
(31, 'css'),
(32, 'css3'),
(33, 'html'),
(39, 'JavaScript'),
(40, 'nodejs'),
(41, 'mysql'),
(42, 'sql');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `etiqueta_pregunta`
--

CREATE TABLE `etiqueta_pregunta` (
  `Id_Pregunta` int(11) NOT NULL,
  `Id_Etiqueta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `etiqueta_pregunta`
--

INSERT INTO `etiqueta_pregunta` (`Id_Pregunta`, `Id_Etiqueta`) VALUES
(38, 31),
(38, 32),
(41, 31),
(41, 33),
(47, 39),
(48, 40),
(49, 41),
(49, 42);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medalla`
--

CREATE TABLE `medalla` (
  `Id` int(11) NOT NULL,
  `Nombre` varchar(30) NOT NULL,
  `Categoria` varchar(10) NOT NULL,
  `Merito` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `medalla`
--

INSERT INTO `medalla` (`Id`, `Nombre`, `Categoria`, `Merito`) VALUES
(1, 'Estudiante', 'Bronce', 'Pregunta con 1 punto'),
(2, 'Pregunta Interesante', 'Bronce', 'Pregunta con 2 puntos'),
(3, 'Buena Pregunta', 'Plata', 'Pregunta con 4 puntos'),
(4, 'Excelente Pregunta', 'Oro', 'Pregunta con 6 puntos'),
(5, 'Pregunta popular', 'Bronce', 'Pregunta con 2 visitas'),
(6, 'Pregunta destacada', 'Plata', 'Pregunta con 4 visitas'),
(7, 'Pregunta famosa', 'Oro', 'Pregunta con 6 visitas'),
(8, 'Respuesta interesante', 'Bronce', 'Respuesta con 2 puntos'),
(9, 'Buena respuesta ', 'Plata', 'Respuesta con 4 puntos'),
(10, 'Excelente respuesta', 'Oro', 'Respuesta con 6 puntos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pregunta`
--

CREATE TABLE `pregunta` (
  `Id` int(11) NOT NULL,
  `Usuario` varchar(25) NOT NULL,
  `Fecha` date DEFAULT NULL,
  `Titulo` varchar(200) NOT NULL,
  `Cuerpo` varchar(500) NOT NULL,
  `Visitas` int(11) NOT NULL,
  `Valoracion` int(11) NOT NULL,
  `Puntos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `pregunta`
--

INSERT INTO `pregunta` (`Id`, `Usuario`, `Fecha`, `Titulo`, `Cuerpo`, `Visitas`, `Valoracion`, `Puntos`) VALUES
(38, 'nico@404.es', '2021-01-14', '¿Cual es la diferencia entre position: relative, position: absolute y position: fixed?', 'Sé que estas propiedades de CSS sirven para posicionar un elemento dentro de la página. Sé que estas propiedades de CSS sirven para posicionar un elemento dentro de la página.', 0, 0, 0),
(41, 'roberto@404.es', '2021-01-14', '¿Cómo funciona exactamente nth-child?', 'No acabo de comprender muy bien que hace exactamente y qué usos prácticos puede tener.', 0, 0, 0),
(47, 'sfg@404.es', '2021-01-14', 'Diferencias entre == y === (comparaciones en JavaScript)', 'Siempre he visto que en JavaScript hay:  asignaciones = comparaciones == y === Creo entender que == hace algo parecido a comparar el valor de la variable y el === también compara el tipo (como un equals de java).', 0, 0, 0),
(48, 'marta@404.es', '2021-01-14', ' Problema con asincronismo en Node', 'Soy nueva en Node... Tengo una modulo que conecta a una BD de postgres por medio de pg-node. En eso no tengo problemas. Mi problema es que al llamar a ese modulo, desde otro modulo, y despues querer usar los datos que salieron de la BD me dice undefined... Estoy casi seguro que es porque la conexion a la BD devuelve una promesa, y los datos no estan disponibles al momento de usarlos.', 0, 0, 0),
(49, 'lucas@404.es', '2021-01-14', '¿Qué es la inyección SQL y cómo puedo evitarla?', 'He encontrado bastantes preguntas en StackOverflow sobre programas o formularios web que guardan información en una base de datos (especialmente en PHP y MySQL) y que contienen graves problemas de seguridad relacionados principalmente con la inyección SQL.  Normalmente dejo un comentario y/o un enlace a una referencia externa, pero un comentario no da mucho espacio para mucho y sería positivo que hubiera una referencia interna en SOes sobre el tema así que decidí escribir esta pregunta.', 0, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `respuesta`
--

CREATE TABLE `respuesta` (
  `Id` int(11) NOT NULL,
  `Correo` varchar(25) NOT NULL,
  `Id_Pregunta` int(11) NOT NULL,
  `Fecha` date NOT NULL,
  `Cuerpo` varchar(10000) NOT NULL,
  `Valoracion` int(11) NOT NULL,
  `Puntos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `respuesta`
--

INSERT INTO `respuesta` (`Id`, `Correo`, `Id_Pregunta`, `Fecha`, `Cuerpo`, `Valoracion`, `Puntos`) VALUES
(5, 'lucas@404.es', 38, '2021-01-14', 'La propiedad position sirve para posicionar un elemento dentro de la página. Sin embargo, dependiendo de cual sea la propiedad que usemos, el elemento tomará una referencia u otra para posicionarse respecto a ella.  Los posibles valores que puede adoptar la propiedad position son: static | relative | absolute | fixed | inherit | initial.', 0, 0),
(7, 'emy@404.es', 41, '2021-01-14', ' La pseudoclase :nth-child() selecciona los hermanos que cumplan cierta condición definida en la fórmula an + b. a y b deben ser números enteros, n es un contador. El grupo an representa un ciclo, cada cuantos elementos se repite; b indica desde donde empezamos a contar.', 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('wvetZvxoLJbGWzyNHPWIu0UH_Nvm-1Qr', 1610742249, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"currentUser\":\"lucas@404.es\",\"userNick\":\"Lucas\",\"userImg\":\"defecto3.png\"}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `Correo` varchar(25) NOT NULL,
  `Password` varchar(25) NOT NULL,
  `Nombre` varchar(30) NOT NULL,
  `Foto` varchar(1000) NOT NULL,
  `Reputacion` int(3) NOT NULL,
  `Registro` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`Correo`, `Password`, `Nombre`, `Foto`, `Reputacion`, `Registro`) VALUES
('emy@404.es', '1234', 'Emy', 'amy.png', 1, '2021-01-14'),
('lucas@404.es', '1234', 'Lucas', 'defecto3.png', 1, '2021-01-14'),
('marta@404.es', '1234', 'Marta', 'marta.png', 1, '2021-01-14'),
('nico@404.es', '1234', 'Nico', 'nico.png', 1, '2021-01-14'),
('roberto@404.es', '1234', 'Roberto', 'roberto.png', 1, '2021-01-14'),
('sfg@404.es', '1234', 'SFG', 'sfg.png', 1, '2021-01-14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_medalla`
--

CREATE TABLE `usuario_medalla` (
  `Correo` varchar(25) CHARACTER SET latin1 NOT NULL,
  `Id_Medalla` int(11) NOT NULL,
  `Obtenidas` int(3) NOT NULL,
  `Fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `valoracion_pregunta`
--

CREATE TABLE `valoracion_pregunta` (
  `Id` int(11) NOT NULL,
  `Id_Pregunta` int(11) NOT NULL,
  `Usuario` varchar(25) CHARACTER SET latin1 NOT NULL,
  `Valor` int(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `valoracion_respuesta`
--

CREATE TABLE `valoracion_respuesta` (
  `Id` int(11) NOT NULL,
  `Id_Respuesta` int(11) NOT NULL,
  `Usuario` varchar(25) CHARACTER SET latin1 NOT NULL,
  `Valoracion` int(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `etiqueta`
--
ALTER TABLE `etiqueta`
  ADD PRIMARY KEY (`Id`);

--
-- Indices de la tabla `etiqueta_pregunta`
--
ALTER TABLE `etiqueta_pregunta`
  ADD KEY `Etiqueta_Pregunta_fk_1` (`Id_Etiqueta`),
  ADD KEY `Etiqueta_Pregunta_fk_2` (`Id_Pregunta`);

--
-- Indices de la tabla `medalla`
--
ALTER TABLE `medalla`
  ADD PRIMARY KEY (`Id`);

--
-- Indices de la tabla `pregunta`
--
ALTER TABLE `pregunta`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `Pregunta_fk_1` (`Usuario`);

--
-- Indices de la tabla `respuesta`
--
ALTER TABLE `respuesta`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `Respuesta_fk_1` (`Correo`),
  ADD KEY `Respuesta_fk_2` (`Id_Pregunta`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`Correo`);

--
-- Indices de la tabla `usuario_medalla`
--
ALTER TABLE `usuario_medalla`
  ADD KEY `Correo` (`Correo`),
  ADD KEY `Id_Medalla` (`Id_Medalla`);

--
-- Indices de la tabla `valoracion_pregunta`
--
ALTER TABLE `valoracion_pregunta`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `Id_Pregunta` (`Id_Pregunta`),
  ADD KEY `Usuario` (`Usuario`);

--
-- Indices de la tabla `valoracion_respuesta`
--
ALTER TABLE `valoracion_respuesta`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `Usuario` (`Usuario`),
  ADD KEY `Id_Respuesta` (`Id_Respuesta`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `etiqueta`
--
ALTER TABLE `etiqueta`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `medalla`
--
ALTER TABLE `medalla`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `pregunta`
--
ALTER TABLE `pregunta`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de la tabla `respuesta`
--
ALTER TABLE `respuesta`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `valoracion_pregunta`
--
ALTER TABLE `valoracion_pregunta`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `valoracion_respuesta`
--
ALTER TABLE `valoracion_respuesta`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `etiqueta_pregunta`
--
ALTER TABLE `etiqueta_pregunta`
  ADD CONSTRAINT `Etiqueta_Pregunta_fk_1` FOREIGN KEY (`Id_Etiqueta`) REFERENCES `etiqueta` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Etiqueta_Pregunta_fk_2` FOREIGN KEY (`Id_Pregunta`) REFERENCES `pregunta` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `pregunta`
--
ALTER TABLE `pregunta`
  ADD CONSTRAINT `Pregunta_fk_1` FOREIGN KEY (`Usuario`) REFERENCES `usuario` (`Correo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `respuesta`
--
ALTER TABLE `respuesta`
  ADD CONSTRAINT `Respuesta_fk_1` FOREIGN KEY (`Correo`) REFERENCES `usuario` (`Correo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Respuesta_fk_2` FOREIGN KEY (`Id_Pregunta`) REFERENCES `pregunta` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario_medalla`
--
ALTER TABLE `usuario_medalla`
  ADD CONSTRAINT `usuario_medalla_ibfk_1` FOREIGN KEY (`Correo`) REFERENCES `usuario` (`Correo`),
  ADD CONSTRAINT `usuario_medalla_ibfk_2` FOREIGN KEY (`Id_Medalla`) REFERENCES `medalla` (`Id`);

--
-- Filtros para la tabla `valoracion_pregunta`
--
ALTER TABLE `valoracion_pregunta`
  ADD CONSTRAINT `valoracion_pregunta_ibfk_1` FOREIGN KEY (`Id_Pregunta`) REFERENCES `pregunta` (`Id`),
  ADD CONSTRAINT `valoracion_pregunta_ibfk_2` FOREIGN KEY (`Usuario`) REFERENCES `usuario` (`Correo`);

--
-- Filtros para la tabla `valoracion_respuesta`
--
ALTER TABLE `valoracion_respuesta`
  ADD CONSTRAINT `valoracion_respuesta_ibfk_1` FOREIGN KEY (`Usuario`) REFERENCES `usuario` (`Correo`),
  ADD CONSTRAINT `valoracion_respuesta_ibfk_2` FOREIGN KEY (`Id_Respuesta`) REFERENCES `respuesta` (`Id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
