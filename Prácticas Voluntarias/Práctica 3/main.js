//Práctica Voluntaria 3

"use strict";

const mysql = require("mysql");
const config = require("./config");
const DAOUsers = require("./DAOUsers");
const DAOTasks = require("./DAOTasks");

// Crear el pool de conexiones
const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

let daoUser = new DAOUsers(pool);
let daoTask = new DAOTasks(pool);

// Definición de las funciones callback
// Uso de los métodos de las clases DAOUsers y DAOTasks


daoUser.isUserCorrect("usuario@ucm.es", "patata",function(err, str)
{
    if(err)
    {
        console.log(err.message);
    }
    else
    {
        if(!str)
        {
            console.log("El usuario y/o contraseña incorrectos");
        }
        else{
            console.log("Usuario encontrado")
        }
    }
});



daoUser.getUserImageName("usuario@ucm.es", function(err, str){
    if(err)
    {
        console.log(err.message);
    }
    else{
        if(!str)
        {
            console.log("Usuario sin foto o usuario inexistente");
        }
        else{
            console.log(str);
        }
    }
})



daoTask.getAllTasks("usuario@ucm.es", function(err, str)
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
        else{
            console.log(str);
        }
    }
});



daoTask.insertTask("usuario@ucm.es", {text: "Insertar", done: 0, tag: ["tagI1", "tagI2"] }, function(err, str){
    if(err)
    {
        console.log(err.message);
    }
    else{
        console.log("Tarea insertada");
    }
})



daoTask.markTaskDone(44, function(err, str)
{
    if(err)
    {
        console.log(err.message);
    }
    else{
        console.log("Tarea finalizada");
    }
})


daoTask.deleteCompleted("usuario@ucm.es", function(err, str)
{
    if(err)
    {
        console.log(err.message);
    }
    else{
        console.log("Tareas eliminadas: " + str.affectedRows);
    }
})
