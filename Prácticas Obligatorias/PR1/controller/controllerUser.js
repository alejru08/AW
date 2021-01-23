"use strict"
const config = require("../config");
const DAOUsers = require("../models/DAOUsers");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { request } = require("express");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

// Crear una instancia de DAOUsers
const daoU = new DAOUsers(pool);

//ACCIONES DE USUARIOS
function userEmail(request, response, next){
    let email = request.params.correo;
    daoU.profile(email, function(err, user){
        if(err){
            next(err);
            console.log(err.message);
        }
        else{
            response.render("User", {user: user});
        }
    });
}

//Manejador de users
function users(request, response, next){
    daoU.allUsers(function(err, user){
        if(err){
            next(err);
            console.log(err.message);
        }
        else{
            response.render("Users", {usuarios: user});
        }
    });
}


//Manejador de findUser
function findUser(request, response, next){
    let text = request.body.Filtro;
    daoU.userFilter(text, function(err, users){
        if(err){
            next(err);
            console.log(err.message);
        }
        else{
            response.render("FindUser", {usuarios: users, text: text});
        }
    });
}

//Manejador de userImg
function userImg(request, response, next){
    daoU.userImg(request.session.currentUser, function(err, img)
    {
        if(err)
        {
            next(err);
            console.log(err.message);
        }
        else{
            let ruta;
            ruta = path.join(__dirname, "../profile_imgs", img);
            response.status(200);
            response.sendFile(ruta);
        }
    })
}

function rutaImg(request, response){
    let img = request.params.foto;
    let ruta;
    ruta = path.join(__dirname, "../profile_imgs", img);
    response.status(200);
    response.sendFile(ruta);
}

module.exports = {
    rutaImg: rutaImg, 
    userImg: userImg,
    findUser: findUser,
    users: users,
    userEmail: userEmail
};