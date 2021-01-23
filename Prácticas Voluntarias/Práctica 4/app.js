"use strict"

// app.js
const config = require("./config");
const DAOTasks = require("./DAOTasks");
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { callbackify } = require("util");

// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

// Crear una instancia de DAOTasks
const daoT = new DAOTasks(pool);

//Definimos views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Recursos estáticos
const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({extended: true}));

//Manejador de Lista_tareas
app.get("/tasks", function(require, response){
    daoT.getAllTasks("usuario@ucm.es", function(err, str)
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
//Prueba Insert 
let task = {text: "Tarea sin tag", tags:[]}
app.post("/addTask", function(request, response){
    let text = request.body.text; //es name en el ejs
    //let task = utils.createTask(text);
    daoT.insertTask("usuario@ucm.es", task, function(err, str)
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
app.get("/finish/:taskId", function(require, response){
    let Id = require.params.taskId;
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
app.get("/deleteCompleted", function(require, response){
    daoT.deleteCompleted("usuario@ucm.es", function(err, str)
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