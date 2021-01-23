"use strict"
const config = require("../config");
const express = require("express");
const { request } = require("express");
const controllerUser = require("../controller/controllerUser");

//creacion de router
const routerUser = express.Router();

//Middleware de control de acceso
const middlewareControl = function(request, response, next){
    if(request.session.currentUser)
    {
        response.locals.userEmail = request.session.currentUser;
        response.locals.userNick = request.session.userNick;
        next();
    }
    else
    {
        response.redirect("/login");
    }
}

//MANEJADORES ACCIONES DE USUARIOS
//Manejador de user
routerUser.get("/user/:correo", middlewareControl, controllerUser.userEmail);

//Manejador de users
routerUser.get("/users", middlewareControl, controllerUser.users);

//Manejador de findUser
routerUser.post("/findUser", middlewareControl, controllerUser.findUser);

//Manejador de userImg
routerUser.get("/userImg", middlewareControl, controllerUser.userImg);

//Manejador de rutaImg
routerUser.get("/rutaImg/:foto", middlewareControl, controllerUser.rutaImg);

module.exports = {routerUser: routerUser};