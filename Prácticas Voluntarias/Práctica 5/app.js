"use strict"

// app.js
const config = require("./config");
const DAOTasks = require("./DAOTasks");
const DAOUsers = require("./DAOUsers");
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { callbackify } = require("util");

//Sesion
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const { nextTick } = require("process");
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore ( {
    host: "localhost",     // Ordenador que ejecuta el SGBD
    user: "root",          // Usuario que accede a la BD
    password: "",          // Contraseña con la que se accede a la BD
    database: "tareas"     // Nombre de la base de datos
});
const middlewareSession = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
})

//Middleware de control de acceso
const middlewareControl = function(request, response, next){
    if(request.session.currentUser)
    {
        response.locals.userEmail = request.session.currentUser;
        next();
    }
    else
    {
        response.redirect("/login");
    }
}


// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

// Crear una instancia de DAOTasks
const daoT = new DAOTasks(pool);
const daoU = new DAOUsers(pool);

//Definimos views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Recursos estáticos
const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({extended: true}));
app.use(middlewareSession);

//MANEJADORES DE RUTA
//INICIO Y CIERRE DE SESION

//Manejador de ruta login
app.get("/", function(request, response){
    response.redirect("/login");
});

app.get("/login", function(request, response){
    if(request.session.currentUser)
    {
        response.redirect("/tasks");
    }
    else{
        response.render("login", {errorMsg: null});
    }
});

app.post("/login", function(request, response){
    let email = request.body.email;
    let password = request.body.password;
    daoU.isUserCorrect(email, password, function(err, user){
        if(err){
            console.log("Error al iniciar sesion")
        }
        else{
            if(!user)
            {
                response.render("login", {errorMsg: "Dirección de correo y/o contraseña no válidos"})
            }
            else{
                request.session.currentUser=email;
                response.status(200); //Exito
                response.redirect("/tasks");
            }
        }
    });
});

//Manejadro de ruta Profile_img
app.get("/imagenUsuario", function(request, response){
    daoU.getUserImageName(request.session.currentUser, function(err, img)
    {
        if(err)
        {
            console.log(err.message);
        }
        else{
            let ruta;
            if(img)
            {
                ruta = path.join(__dirname, "profile_imgs", img);
            }
            else
            {
                ruta = path.join(__dirname, "public/img", "NoPerfil.jpg");
            }
            response.status(200);
            response.sendFile(ruta);
        }
    })
})

//Majeador de ruta logout
app.get("/logout", function(request, response){
    request.session.destroy();
    response.status(200); //Exito
    response.redirect("/login");
});

//ACCIONES DE TAREAS

//Manejador de Lista_tareas
app.get("/tasks", middlewareControl, function(request, response){
    daoT.getAllTasks(request.session.currentUser, function(err, str)
    {
        if(err)
        {
            console.log(err.message);
        }
        else{
            if(!str)
            {
                console.log("No hay tareas para este usuario");
            }
            response.status(200); //Exito
            response.render("tasks", {taskList: str});
        }
    });
});

//Manejador de Añadir_tareas
app.post("/addTask", middlewareControl, function(request, response){
    let text = request.body.text; //es name en el ejs
    let task = utils.createTask(text);
    daoT.insertTask(request.session.currentUser, task, function(err, str)
    {
        if(err)
        {
            console.log(err.message);
        }
        else{
            if(!str)
            {
                console.log("No se pudo añadir la tarea");
            }
            response.status(200); //Exito
            response.redirect("/tasks");
        }
    });
});

//Manejador de Marcar_finalizada
app.get("/finish/:taskId", middlewareControl, function(request, response){
    let Id = request.params.taskId;
    console.log(Id);
    daoT.markTaskDone(Id, function(err, str)
    {
        if(err)
        {
            console.log(err.message);
        }
        else{
            if(!str)
            {
                console.log("No existe esa tarea");
            }
            response.status(200); //Exito
            response.redirect("/tasks");
        }
    });
});

//Manejador de Eliminar_Completadas
app.get("/deleteCompleted", middlewareControl, function(request, response){
    daoT.deleteCompleted(request.session.currentUser, function(err, str)
    {
        if(err)
        {
            console.log(err.message);
        }
        else{
            if(!str)
            {
                console.log("No hay tareas finalizadas");
            }
            response.status(200); //Exito
            response.redirect("/tasks");
        }
    });
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