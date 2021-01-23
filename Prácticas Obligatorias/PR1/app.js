"use strict"

// app.js
const config = require("./config");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { callbackify } = require("util");
const expressValidator = require("express-validator");

//Sesion
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const { nextTick } = require("process");
const { render } = require("ejs");
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore ( {
    host: "localhost",     // Ordenador que ejecuta el SGBD
    user: "root",          // Usuario que accede a la BD
    password: "",          // Contraseña con la que se accede a la BD
    database: "404"     // Nombre de la base de datos
});

//Middleware de la sesion
const middlewareSession = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});

//ROUTERS
const routerUsers = require("./routers/routerUser");
const routerSession = require("./routers/routerSession");
const routerQuestions = require("./routers/routerQuestions");
const { request, response } = require("express");

// Crear un servidor Express.js
const app = express();

//Definimos views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Recursos estáticos
const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({extended: true}));
app.use(middlewareSession);
app.use("/usuarios", routerUsers.routerUser);
app.use("/", routerSession.routerSession);
app.use("/preguntas", routerQuestions.routerQuestions);
app.use(expressValidator());


//Errores
//404: no existen elementos de la operacion
app.use(function(request, response, next){
    response.render("error", {status: 404, message: "Recurso inexistente"});
});

//500: Error en la BBDD y/o servidor (codigo)
app.use(function(err, request, response, next){
	response.status(err.status || 500);
	response.render("error", {status: err.status, message: err.message});
});

// Arrancar el servidor
app.listen(config.port, function(err) {
   if (err) {
       console.log("ERROR al iniciar el servidor");
   }
   else {
       console.log(`Servidor arrancado en el puerto ${config.port}`);
   }
});