"use strict"
const express = require("express");
const controllerSession = require("../controller/controllerSession");
const fs = require("fs");
const routerSession = express.Router();

//Middleware de control de acceso
const middlewareIniciado = function(request, response, next){
    if(request.session.currentUser)
    {
        response.locals.userEmail = request.session.currentUser;
        response.locals.userNick = request.session.userNick;
        response.redirect("/preguntas/home");
    }
    else
    {
        next();
    }
}

//MANEJADORES INICIO Y CIERRE DE SESION

//Manejador de ruta login
routerSession.get("/", middlewareIniciado, controllerSession.home);

routerSession.get("/login", middlewareIniciado, controllerSession.loginG);

routerSession.post("/login", middlewareIniciado, controllerSession.loginP);

//Manejador de ruta de SignUp
routerSession.get("/signUp", middlewareIniciado, controllerSession.signUpG);

routerSession.post("/signUp", middlewareIniciado, controllerSession.signUpP);

//Manejador de ruta logout
routerSession.get("/logout", controllerSession.logout);

module.exports = {routerSession: routerSession};