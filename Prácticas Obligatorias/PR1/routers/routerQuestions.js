"use strict"
const express = require("express");
const fs = require("fs");
const controllerQuestion = require("../controller/controllerQuestion");

//creacin del router
const routerQuestions = express.Router();

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

//MANEJADORES ACCIONES DE PREGUNTAS

//Manejador de Home
routerQuestions.get("/Home", middlewareControl, controllerQuestion.home);

//Manejador de allQuestions
routerQuestions.get("/allQuestions", middlewareControl, controllerQuestion.allQuestions);

//Manejador de Unanswered
routerQuestions.get("/unanswered", middlewareControl, controllerQuestion.unanswered);

//Manejador de Question
routerQuestions.get("/question/:questId", middlewareControl, controllerQuestion.question);

routerQuestions.get("/question/:questId", middlewareControl, controllerQuestion.visitMedal);

//Manejador de findByTag
routerQuestions.get("/findByTag/:tagId", middlewareControl, controllerQuestion.findByTag);

//Manejador de newQuestion
routerQuestions.get("/newQuestion", middlewareControl, controllerQuestion.newQuestionG);

routerQuestions.post("/newQuestion", middlewareControl, controllerQuestion.newQuestionP);

//Manejador de FindByText
routerQuestions.post("/findByText", middlewareControl, controllerQuestion.findByText);

//Manejador de answer
routerQuestions.post("/answer/:Id", middlewareControl, controllerQuestion.answer);

//Manejador de likeP
routerQuestions.get("/likeP/:Id", middlewareControl, controllerQuestion.likeP);

routerQuestions.get("/likeP/:Id", middlewareControl, controllerQuestion.likePMedall);

//Manejador de dislikeP
routerQuestions.get("/dislikeP/:Id", middlewareControl, controllerQuestion.dislikeP);

//Manejador de likeR y gestion de medallas por like a respuesta
routerQuestions.get("/likeR/:Id", middlewareControl, controllerQuestion.likeR);

routerQuestions.get("/likeR/:Id", middlewareControl, controllerQuestion.likeRMedall);

//Manejador de dislikeR
routerQuestions.get("/dislikeR/:Id", middlewareControl, controllerQuestion.dislikeR);

module.exports = {routerQuestions: routerQuestions};