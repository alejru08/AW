"use strict"
const config = require("../config");
const DAOInteractions = require("../models/DAOInteractions");
const utils = require("../utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

// Crear una instancia de DAOInteractions
const daoI = new DAOInteractions(pool);

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

//ACCIONES DE PREGUNTAS

//Para la ruta Home
function home(request, response){
    response.render("Home");
}

//Para la ruta allQuestions
function allQuestions(request, response, next){
    daoI.allQuestions(function(err, preguntasL){
        if(err){
            next(err);
            console.log(err.message);
        }
        else{
            response.status(200);
            response.render("AllQuestions", {preguntasL: preguntasL});
        }
    });
}

//Para la ruta Unanswered
function unanswered(request, response, next){
    daoI.unsolvedQuestion(function(err, questions){
        if(err)
        {
            next(err);
            console.log(err.message);
        }
        else{
            response.status(200);
            response.render("Unanswered", {preguntasL: questions});
        }
    });
}

//Para la ruta Question
function question(request, response, next){
    let Id = request.params.questId;
    daoI.detailedQuestion(Id, function(err, str)
    {
        if(err)
        {
            next(err);
            console.log(err.message);
        }
        else{
            request.pregunta = str;
            next();
        }
    });
}

function visitMedal(request, response, next){
    let Id = request.params.questId;
    daoI.visitMedal(Id, function(err, str)
    {
        if(err)
        {
            next(err);
            console.log(err.message);
        }
        else{
            response.status(200);
            response.render("Question", {pregunta: request.pregunta});
        }
    });
}

//Para la ruta findByTag
function findByTag(request, response, next){
    let Id = request.params.tagId;
    daoI.filterTag(Id, function(err, str)
    {
        if(err)
        {
            next(err);
            console.log(err.message);
        }
        else{
            response.status(200); //Exito
            response.render("FindByTag", {preguntasL: str.preguntas, tag: str.tag});
        }
    });
}

//Para la ruta newQuestion
function newQuestionG(request, response){
    response.render("NewQuestion");
}

function newQuestionP(request, response, next){
    let email=request.session.currentUser;
    let title=request.body.Titulo;
    let date=new Date();
    let body=request.body.Cuerpo;
    let tags= utils.createTags(request.body.Etiquetas);
    if(tags == null || tags.length > 5)
    {
        response.render("NewQuestion");
    }
    else{
        daoI.insertQuestion(email, date, title, body, tags, function(err, str){
            if(err)
            {
                next(err);
                console.log(err.message);
            }
            else{
                response.status(200);
                response.redirect("/preguntas/allQuestions");
            }
        });
    }
}

//Para la ruta FindByText
function findByText(request, response, next){
    let text = request.body.Buscador;
    daoI.filterText(text, function(err, questions){
        if(err)
        {
            next(err);
            console.log(err.message);
        }
        else
        {
            response.status(200);
            response.render("FindByText", {preguntasL: questions, text: text});
        }
    });
}

//Para la ruta answer
function answer(request, response, next){
    let email = request.session.currentUser;
    let Id = request.params.Id;
    let date = new Date();
    let body = request.body.respuesta;
    daoI.answer(email, Id, date, body, function(err, answ){
        if(err){
            next(err);
            console.log(err.message);
        }
        else{
            response.status(200);
            response.redirect("/preguntas/allQuestions");
        }
    });
}

//Para la ruta likeP
function likeP(request, response, next){
    let Id = request.params.Id;
    let email = request.session.currentUser;
    daoI.likeQuestion(Id, email, function(err, like){
        if(err){
            next(err);
            console.log(err.message);
        }
        else{
            if(like){
                next();
            }
            else{
                response.redirect("/preguntas/allQuestions");
            }
        }
    });
}

function likePMedall(request, response, next){
    let Id = request.params.Id;
    daoI.questionMedal(Id, function(err, like){
        if(err){
            next(err);
            console.log(err.message);
        }
        else{
            response.status(200);
            response.redirect("/preguntas/allQuestions");
        }
    });
}

//Para la ruta dislikeP
function dislikeP(request, response, next){
    let Id = request.params.Id;
    let email = request.session.currentUser;
    daoI.dislikeQuestion(Id, email, function(err, like){
        if(err){
            next(err);
            console.log(err.message);
        }
        else{
            response.status(200);
            response.redirect("/preguntas/allQuestions");
        }
    });
}

//Para la ruta likeR y gestion de medallas por like a respuesta
function likeR(request, response, next){
    let Id = request.params.Id;
    let email = request.session.currentUser;
    daoI.likeAnswer(Id, email, function(err, like){
        if(err){
            next(err);
            console.log(err.message);
        }
        else{
            if(like){
                next();
            }
            else{
                response.redirect("/preguntas/allQuestions");
            }
        }
    });
}

function likeRMedall(request, response, next){
    let Id = request.params.Id;
    daoI.answerMedal(Id, function(err, med){
        if(err){
            next(err);
            console.log(err.message);
        }
        else{
            response.status(200);
            response.redirect("/preguntas/allQuestions");
        }
    });
}

//Para la ruta de dislikeR
function dislikeR(request, response, next){
    let Id = request.params.Id;
    let email = request.session.currentUser;
    daoI.dislikeAnswer(Id, email, function(err, like){
        if(err){
            next(err);
            console.log(err.message);
        }
        else{
            response.status(200);
            response.redirect("/preguntas/allQuestions");
        }
    });
}

module.exports = {
    home: home,
    allQuestions: allQuestions,
    unanswered: unanswered,
    question: question,
    visitMedal: visitMedal,
    findByTag: findByTag,
    newQuestionG: newQuestionG,
    newQuestionP: newQuestionP,
    findByText: findByText,
    answer: answer,
    likeP: likeP,
    likePMedall: likePMedall,
    dislikeP: dislikeP,
    likeR: likeR,
    likeRMedall: likeRMedall,
    dislikeR: dislikeR
};