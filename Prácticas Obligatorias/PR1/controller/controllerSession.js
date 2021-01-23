"use strict"
const config = require("../config");
const DAOUsers = require("../models/DAOUsers");
const utils = require("../utils")
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const fs = require("fs");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

// Crear una instancia de DAOTasks
const daoU = new DAOUsers(pool);

//INICIO Y CIERRE DE SESION
//para la ruta login
function home(request, response){
    response.redirect("/login");
}

function loginG(request, response){
    response.render("Login", {errorMsg: null});
}

function loginP(request, response, next){
    let email = request.body.email;
    let password = request.body.password;
    daoU.isUserCorrect(email, password, function(err, user){
        if(err){
            next(err);
            console.log(err.message);
        }
        else{
            if(!user)
            {
                response.render("Login", {errorMsg: "Dirección de correo y/o contraseña no válidos"})
            }
            else{
                request.session.currentUser=email;
                request.session.userNick= user[0].Nombre;
                request.session.userImg=user[0].Foto;
                response.status(200); //Exito
                response.redirect("/preguntas/home");
            }
        }
    });
}

//Para la ruta de SignUp
function signUpG(request, response){
    response.render("SignUp", {errorMsg: null});
}

function signUpP(request, response){
    let email = request.body.email;
    let password = request.body.password;
    let passwordC = request.body.passwordC;
    let nick = request.body.name;
    let img = request.body.image;
    let date = new Date();
    if(password == passwordC){ //si las contraseñas son iguales
        console.log(img);
        if(img == ""){
            let num = utils.randNum();
            img = "defecto" + num + ".png";
            console.log(img);
        }
        daoU.insertUser(email, password, date, nick, img, function(err, user){
            if(err)
            {
                response.render("SignUp", {errorMsg: err});
            }
            else{
                response.status(200);
                response.redirect("/login");
            }
        });
    }
    else{
        response.render("SignUp", {errorMsg: "Las contraseñas no coinciden"})
    }
}

//Para la ruta logout
function logout(request, response){
    request.session.destroy();
    response.status(200); //Exito
    response.redirect("/login");
}

module.exports = {
    home: home,
    loginG: loginG,
    loginP: loginP,
    signUpG: signUpG,
    signUpP: signUpP,
    logout: logout
};