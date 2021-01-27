"use strict";

const { connect } = require("http2");

class DAOInteractions {
    constructor(pool) {  this.pool = pool; }

    allQuestions(callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else { //Agrupamos etiquetas y preguntas
                connection.query("SELECT * FROM etiqueta_pregunta JOIN etiqueta ON Id_Etiqueta = Id",
                [],
                function(err, tags) {
                    if (err) {
                        connection.release(); // devolver al pool la conexión
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else { //Agrupamos Preguntas con usuarios
                        connection.query("SELECT * FROM pregunta JOIN usuario ON Usuario = Correo ORDER BY pregunta.Fecha DESC",
                        [],
                        function(err, questions){
                            if(err)
                            {
                                connection.release();
                                callback(new Error("Error de acceso a la base de datos"));
                            }
                            else{ //manejamos la información
                                let preguntas = [];
                                questions.forEach(q => {
                                    let fecha = q.Fecha.getDate() + "-" + (q.Fecha.getMonth()+1) + "-" + q.Fecha.getFullYear();
                                    let pregunta = {
                                        Id: q.Id,
                                        Titulo: q.Titulo,
                                        Cuerpo: q.Cuerpo,
                                        Correo: q.Correo,
                                        Usuario: q.Nombre,
                                        Foto: q.Foto,
                                        Fecha: fecha,
                                        Tags: []
                                    }
                                    let qTags = tags.filter(t => t.Id_Pregunta == q.Id);
                                    qTags.forEach(tag => {
                                        pregunta.Tags.push([tag.Id, tag.Nombre]);
                                    });
                                    preguntas.push(pregunta);
                                });
                                connection.release();
                                callback(null, preguntas);
                            }
                        });       
                    }
                });
            }
        });
    
    }

    insertQuestion(email, date, title, body, tags, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                //Insertamos la pregunta
                connection.query("INSERT INTO pregunta(Usuario, Fecha, Titulo, Cuerpo, Visitas, Valoracion) VALUES (?, ?, ?, ?, ?, ?)",
                [email, date, title, body, 0, 0],
                function(err, rows) {
                    connection.release(); // devolver al pool la conexión
                    if (err) {
                        connection.release();
                        callback(new Error("Error al insertar pregunta en la base de datos"));
                    }
                    else {
                        //Comprobamos las etiquetas
                        connection.query("SELECT * FROM etiqueta", [],
                        function(err, tagsL){
                            if(err){
                                connection.release();
                                callback(new Error("Error de acceso a las etiquetas de la base de datos"));
                            }
                            else{
                                //Si hay tags
                                if(tags.length > 0)
                                {
                                    //Comprobamos cuales ya existen
                                    let tagsInsert = [];  //Tags que necesitan ser creados
                                    let tagsEtiqueta = []; //Tags ya creados
                                    tags.forEach(t => {
                                        let tagAux = tagsL.filter(tA => tA.Nombre == t);
                                        if(tagAux.length == 0)
                                        {
                                            tagsInsert.push(t);
                                        }
                                        else{
                                            tagsEtiqueta.push([rows.insertId, tagAux[0].Id]); //metemos el Id del Tag
                                        }
                                    });
                                    //insertamos los que no existen en caso de haber
                                    if(tagsInsert.length > 0)
                                    {
                                        connection.query("INSERT INTO etiqueta(Nombre) VALUES ?",
                                        [tagsInsert], function(err, tagsI)
                                        {
                                            if(err)
                                            {
                                                connection.release();
                                                callback(new Error("Error en la base de datos los nuevos tags"));
                                            }
                                            else{
                                                //Metemos en la lista para Insertar
                                                connection.query("SELECT * FROM etiqueta", [],
                                                function(err, tagsL){
                                                    if(err)
                                                    {
                                                        connection.release();
                                                        callback(new Error("Error en el acceso a la base de datos"));
                                                    }
                                                    else{
                                                        tagsInsert.forEach(t => {
                                                            let tagAux2 = tagsL.filter(f => f.Nombre == t);
                                                            tagsEtiqueta.push([rows.insertId, tagAux2[0].Id]);
                                                        });
                                                        //Insertamos en etiqueta_pregunta
                                                        connection.query("INSERT INTO etiqueta_pregunta(Id_Pregunta, Id_Etiqueta) VALUES ?",
                                                        [tagsEtiqueta], function(err, rows){
                                                            if(err)
                                                            {
                                                                connection.release();
                                                                callback(new Error("Error al insertar la relacion tag pregunta en la base de datos"));
                                                            }
                                                            else{
                                                                connection.release();
                                                                callback(null, true);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                    else{ //Todos existen ya 
                                        //Insertamos en etiqueta_pregunta
                                        connection.query("INSERT INTO etiqueta_pregunta(Id_Pregunta, Id_Etiqueta) VALUES ?",
                                        [tagsEtiqueta], function(err, rows){
                                            if(err)
                                            {
                                                connection.release();
                                                callback(new Error("Error en el acceso a la base de datos"));
                                            }
                                            else{
                                                connection.release();
                                                callback(null, true);
                                            }
                                        });
                                    }
                                }
                                else{
                                    connection.release();
                                    callback(null, true);
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    filterTag(tag, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else { //Vemos que preguntas tienen ese Tag
                connection.query("SELECT Id_Pregunta FROM etiqueta_pregunta WHERE Id_Etiqueta = ? ",
                [tag],
                function(err, qId) {
                    if (err) {
                        connection.release();
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{ //Obtenemos todas las etiquetas de esas preguntas
                        connection.query("SELECT * FROM etiqueta JOIN etiqueta_pregunta ON Id = Id_Etiqueta",
                        [], function(err, tags){
                            if(err)
                            {
                                connection.release();
                                callback(new Error("Error de acceso a la base de datos")); 
                            }
                            else{
                                //Obtenemos las preguntas con la información del usuario
                                connection.query("SELECT * FROM pregunta JOIN usuario ON Correo = Usuario",
                                [],
                                function(err, userQuest) {
                                    if(err)
                                    {
                                        connection.release();
                                        callback(new Error("Error de acceso a la base de datos")); 
                                    }
                                    else{
                                        //manejamos todos los datos
                                        let preguntas = [];
                                        let tagResult = "";
                                        qId.forEach(q=>{
                                            let info = userQuest.filter(u => u.Id == q.Id_Pregunta);
                                            let fecha = info[0].Fecha.getDate() + "-" + (info[0].Fecha.getMonth()+1)+ "-" + info[0].Fecha.getFullYear();
                                            let pregunta = {
                                                Id: info[0].Id,
                                                Titulo: info[0].Titulo,
                                                Cuerpo: info[0].Cuerpo,
                                                Usuario: info[0].Nombre,
                                                Correo: info[0].Correo,
                                                Foto: info[0].Foto,
                                                Fecha: fecha,
                                                Tags: []
                                            }
                                            let tagsAux = tags.filter(t => t.Id_Pregunta == info[0].Id);
                                            tagsAux.forEach(t =>{
                                                pregunta.Tags.push([t.Id, t.Nombre]);
                                                if(t.Id == tag)
                                                {
                                                    tagResult = t.Nombre;
                                                }
                                            });
                                            preguntas.push(pregunta);
                                        });
                                        let sol = {preguntas: preguntas, tag: tagResult};
                                        connection.release();
                                        callback(null, sol);
                                    }
                                });
                            }
                        });     
                    }
                });
            }
        });
    }

    unsolvedQuestion(callback){ 
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else { //Juntamos las preguntas con sus respuestas (hacia la tabla preguntas)
                connection.query("SELECT pregunta.Id, Id_Pregunta FROM pregunta LEFT JOIN respuesta ON pregunta.Id = Id_Pregunta",
                [],
                function(err, rows) {
                    if (err) {
                        connection.release();
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{ //Seleccionamos la informacion del usuario y la pregunta
                        connection.query("SELECT * FROM pregunta JOIN usuario ON Correo = Usuario",
                        [], function(err, usu){
                            if (err) {
                                connection.release();
                                callback(new Error("Error de acceso a la base de datos"));
                            }
                            else{ //Seleccionamos las etiquetas
                                connection.query("SELECT * FROM etiqueta JOIN etiqueta_pregunta ON Id = Id_Etiqueta",
                                [], function(err, tags){
                                    if (err) {
                                        connection.release();
                                        callback(new Error("Error de acceso a la base de datos"));
                                    }
                                    else{//manejamos la informacion
                                        //seleccionamos las filas que no tengas una pregunta registrada en la respuesta
                                        let unsolved = rows.filter(r => r.Id_Pregunta == null);
                                        let preguntas = [];
                                        unsolved.forEach(u => {
                                            let info= usu.filter(us => us.Id == u.Id);
                                            let fecha = info[0].Fecha.getDate() + "-" + (info[0].Fecha.getMonth()+1) + "-" + info[0].Fecha.getFullYear();
                                            let pregunta = {
                                                Id: info[0].Id,
                                                Titulo: info[0].Titulo,
                                                Cuerpo: info[0].Cuerpo,
                                                Usuario: info[0].Nombre,
                                                Correo: info[0].Correo,
                                                Foto: info[0].Foto,
                                                Fecha: fecha,
                                                Tags: []
                                            }
                                            tags.forEach(tag =>{
                                                if(tag.Id_Pregunta == info[0].Id)
                                                {
                                                    pregunta.Tags.push([tag.Id, tag.Nombre]);
                                                }
                                            });
                                            preguntas.push(pregunta);
                                        });
                                        connection.release();
                                        callback(null, preguntas);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    filterText(text, callback){
        this.pool.getConnection(function(err, connection){
            if(err)
            {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{ //Obtenemos la tabla de preguntas con sus usuarios
                connection.query("SELECT * FROM pregunta JOIN usuario ON Correo = Usuario WHERE Titulo REGEXP ?",
                [text], function(err, questionT){
                    if(err)
                    {
                        connection.release();
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{ //Obtenemos tambien las etiquetas
                        connection.query("SELECT * FROM pregunta JOIN usuario ON Correo = Usuario WHERE Cuerpo REGEXP ?",
                        [text], function(err, questionC){
                            if(err)
                            {
                                connection.release();
                                callback(new Error("Error de acceso a la base de datos"));
                            }
                            else{
                                connection.query("SELECT * FROM etiqueta JOIN etiqueta_pregunta ON Id = Id_Etiqueta",
                                [], function(err, tags){
                                    if(err)
                                    {
                                        connection.release();
                                        callback(new Error("Error de acceso a la base de datos"));
                                    }
                                    else{ //Vemos que preguntas tienen el texto en el titulo y/o cuerpo
                                        let preguntas = [];
                                        questionT.forEach(q => {
                                            let fecha = q.Fecha.getDate() + "-" + (q.Fecha.getMonth()+1) + "-" + q.Fecha.getFullYear();
                                            let pregunta = {
                                                Id: q.Id,
                                                Titulo: q.Titulo,
                                                Cuerpo: q.Cuerpo,
                                                Usuario: q.Nombre,
                                                Correo: q.Correo,
                                                Foto: q.Foto,
                                                Fecha: fecha,
                                                Tags: []
                                            }
                                            tags.forEach(tag =>{
                                                if(tag.Id_Pregunta == q.Id)
                                                {
                                                    pregunta.Tags.push([tag.Id, tag.Nombre]);
                                                }
                                            });
                                            preguntas.push(pregunta);
                                        });
                                        questionC.forEach(q=> {
                                            let compr = questionT.filter(t => t.Id == q.Id);
                                            if(compr.length == 0){
                                                let fecha = q.Fecha.getDate() + "-" + (q.Fecha.getMonth()+1) + "-" + q.Fecha.getFullYear();
                                                let pregunta = {
                                                    Id: q.Id,
                                                    Titulo: q.Titulo,
                                                    Cuerpo: q.Cuerpo,
                                                    Usuario: q.Nombre,
                                                    Foto: q.Foto,
                                                    Fecha: fecha,
                                                    Tags: []
                                                }
                                                tags.forEach(tag =>{
                                                    if(tag.Id_Pregunta == q.Id)
                                                    {
                                                        pregunta.Tags.push([tag.Id, tag.Nombre]);
                                                    }
                                                });
                                                preguntas.push(pregunta);
                                            }
                                        });
                                        connection.release();
                                        callback(null, preguntas);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    detailedQuestion(Id, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else { //Aumentamos en uno la visita a la pregunta
                connection.query("UPDATE pregunta SET Visitas=Visitas+1 WHERE Id = ?", 
                [Id], function(err, update){
                    connection.release();
                    if(err){
                        connection.release();
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        //Obtenemos la pregunta y su usuario
                        connection.query("SELECT * FROM pregunta JOIN usuario ON Correo = Usuario WHERE Id = ?" ,
                        [Id],
                        function(err, question) {
                            if (err) {
                                connection.release();
                                callback(new Error("Error de acceso a la base de datos"));
                            }
                            else {
                                //Obtenemos las etiquetas de la pregunta
                                connection.query("SELECT * FROM etiqueta JOIN etiqueta_pregunta ON Id = Id_Etiqueta WHERE Id_pregunta = ?",
                                [Id], function(err, tags){
                                    if (err) {
                                        connection.release();
                                        callback(new Error("Error de acceso a la base de datos"));
                                    }
                                    else{
                                        //Obtenemos las respuestas
                                        connection.query("SELECT * FROM respuesta JOIN Usuario ON respuesta.Correo = Usuario.Correo WHERE Id_Pregunta = ?",
                                        [Id], function(err, answ){
                                            if (err) {
                                                connection.release();
                                                callback(new Error("Error de acceso a la base de datos"));
                                            }
                                            else{ 
                                                //Manejamos la información
                                                let q = question[0]; //No dejaba acceder directamente a question
                                                let fecha = q.Fecha.getDate() + "-" + (q.Fecha.getMonth()+1) + "-" + q.Fecha.getFullYear();
                                                let pregunta = {
                                                    Id: q.Id,
                                                    Titulo: q.Titulo,
                                                    Cuerpo: q.Cuerpo,
                                                    Usuario: q.Nombre,
                                                    Foto: q.Foto,
                                                    Fecha: fecha,
                                                    Visitas: q.Visitas,
                                                    Valoracion: q.Valoracion,
                                                    Tags: [],
                                                    Respuestas: []
                                                }
                                                tags.forEach(tag =>{
                                                    pregunta.Tags.push([tag.Id, tag.Nombre]);
                                                });
                                                answ.forEach(r => {
                                                    let fechaR = r.Fecha.getDate() + "-" + (r.Fecha.getMonth()+1) + "-" + r.Fecha.getFullYear();
                                                    let respuesta = {
                                                        Id: r.Id,
                                                        Fecha: fechaR, 
                                                        Cuerpo: r.Cuerpo,
                                                        Valoracion: r.Valoracion,
                                                        Usuario: r.Nombre,
                                                        Foto: r.Foto
                                                    }
                                                    pregunta.Respuestas.push(respuesta);
                                                });
                                                connection.release();
                                                callback(null, pregunta);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    answer(email, Id, date, body, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{ //insertamos la respuesta
                connection.query("INSERT INTO respuesta(Correo, Id_Pregunta, Fecha, Cuerpo, Valoracion) VALUES (?, ?, ?, ?, ?)",
                [email, Id, date, body, 0], function(err, respuesta){
                    connection.release();
                    if(err)
                    {
                        connection.release();
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        connection.release();
                        callback(null, respuesta);
                    }
                });
            }
        });
    }

    likeQuestion(Id, email, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                connection.release();
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{ //Comprobamos que no ha votado ya esta pregunta
                connection.query("SELECT * FROM valoracion_pregunta WHERE Usuario = ? AND Id_Pregunta = ?",
                [email, Id], function(err, comp){
                    if(err)
                    {
                        connection.release();
                        callback(new Error("Error al acceder a valoracion de preguntas de la base de datos"));
                    }
                    else{
                        if(comp.length == 0) //Si no ha votado aun, se le suma un voto a la pregunta
                        {
                            connection.query("UPDATE pregunta SET pregunta.Valoracion= pregunta.Valoracion+1, pregunta.Puntos=pregunta.Puntos+1 WHERE Id = ?",
                            [Id], function(err, like){
                                if(err)
                                {
                                    connection.release();
                                    callback(new Error("Error de incrementar voto en la base de datos"));
                                }
                                else{ 
                                    connection.query("INSERT INTO valoracion_pregunta(Id_Pregunta, Usuario, Valor) VALUES (?,?,?)",
                                    [Id, email, 1], function(err, ok){
                                        if(err)
                                        {
                                            connection.release();
                                            callback(new Error("Error al insertar la valoracion acceso a la base de datos"));
                                        }
                                        else{
                                            connection.query("SELECT Usuario FROM pregunta WHERE Id = ?",
                                            [Id], function(err, user){
                                                if(err){
                                                    connection.release();
                                                    callback(new Error("Error de acceso a la base de datos"));
                                                }
                                                else{
                                                    connection.query("UPDATE usuario SET usuario.Reputacion=usuario.Reputacion+10 WHERE Correo = ?",
                                                    [user[0].Usuario], function(err, rep){
                                                        if(err)
                                                        {
                                                            connection.release();
                                                            callback(new Error("Error de acceso a la base de datos"));
                                                        }
                                                        else{
                                                            connection.release();
                                                            callback(null, true);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        else{ //ya ha votado
                            connection.release();
                            callback(null, false);
                        }
                    }
                });
            }
        });
    }

    dislikeQuestion(Id, email, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{ //Comprobamos que no ha votado ya esta pregunta
                connection.query("SELECT * FROM valoracion_pregunta WHERE Usuario = ? AND Id_Pregunta = ?",
                [email, Id], function(err, comp){
                    if(err)
                    {
                        connection.release();
                        callback(new Error("Error al acceder a valoracion de preguntas de la base de datos"));
                    }
                    else{
                        if(comp.length == 0) //Si no ha votado aun, se le suma un voto a la pregunta
                        {
                            connection.query("UPDATE pregunta SET pregunta.Valoracion= pregunta.Valoracion+1, pregunta.Puntos=pregunta.Puntos-1 WHERE Id = ?",
                            [Id], function(err, like){
                                if(err)
                                {
                                    connection.release();
                                    callback(new Error("Error de incrementar voto en la base de datos"));
                                }
                                else{ //Inserta la accion
                                    connection.query("INSERT INTO valoracion_pregunta(Id_Pregunta, Usuario, Valor) VALUES (?,?,?)",
                                    [Id, email, -1], function(err, ok){
                                        if(err)
                                        {
                                            connection.release();
                                            callback(new Error("Error al insertar la valoracion acceso a la base de datos"));
                                        }
                                        else{ //Buscamos al usuario que publico la pregunta y el valor de su reputacion
                                            connection.query("SELECT Usuario, usuario.Reputacion FROM pregunta JOIN usuario ON Usuario = Correo WHERE Id = ?",
                                            [Id], function(err, user){
                                                if(err){
                                                    connection.release();
                                                    callback(new Error("Error de acceso a la base de datos"));
                                                }
                                                else{ //Comprobamos su reputacion y restamos
                                                    let resta = 1;
                                                    if(user[0].Reputacion > 2){
                                                        resta = user[0].Reputacion-2;
                                                    }
                                                    connection.query("UPDATE usuario SET usuario.Reputacion=? WHERE Correo = ?",
                                                    [resta, user[0].Usuario], function(err, rep){
                                                        if(err)
                                                        {
                                                            connection.release();
                                                            callback(new Error("Error de acceso a la base de datos"));
                                                        }
                                                        else{
                                                            connection.release();
                                                            callback(null, true);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        else{ //ya ha votado
                            connection.release();
                            callback(null, true);
                        }
                    }
                });
            }
        });
    }

    likeAnswer(Id, email, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{ //Comprobamos que no ha votado ya esta pregunta
                connection.query("SELECT * FROM valoracion_respuesta WHERE Usuario = ? AND Id_Respuesta = ?",
                [email, Id], function(err, comp){
                    if(err)
                    {
                        connection.release();
                        callback(new Error("Error al acceder a valoracion de preguntas de la base de datos"));
                    }
                    else{
                        if(comp.length == 0) //Si no ha votado aun, se le suma un voto a la pregunta
                        {
                            connection.query("UPDATE respuesta SET respuesta.Valoracion= respuesta.Valoracion+1, respuesta.Puntos=respuesta.Puntos+1 WHERE Id = ?",
                            [Id], function(err, like){
                                if(err)
                                {
                                    connection.release();
                                    callback(new Error("Error de incrementar voto en la base de datos"));
                                }
                                else{ 
                                    connection.query("INSERT INTO valoracion_respuesta(Id_Respuesta, Usuario, Valoracion) VALUES (?,?,?)",
                                    [Id, email, 1], function(err, ok){
                                        if(err)
                                        {
                                            connection.release();
                                            callback(new Error("Error al insertar la valoracion acceso a la base de datos"));
                                        }
                                        else{
                                            connection.query("SELECT Correo FROM respuesta WHERE Id = ?",
                                            [Id], function(err, user){
                                                if(err){
                                                    connection.release();
                                                    callback(new Error("Error de acceso a la base de datos"));
                                                }
                                                else{
                                                    connection.query("UPDATE usuario SET usuario.Reputacion=usuario.Reputacion+10 WHERE Correo = ?",
                                                    [user[0].Correo], function(err, rep){
                                                        if(err)
                                                        {
                                                            connection.release();
                                                            callback(new Error("Error de acceso a la base de datos"));
                                                        }
                                                        else{
                                                            connection.release();
                                                            callback(null, true);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        else{ //ya ha votado
                            connection.release();
                            callback(null, false);
                        }
                    }
                });
            }
        });
    }

    dislikeAnswer(Id, email, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{ //Comprobamos que no ha votado ya esta pregunta
                connection.query("SELECT * FROM valoracion_respuesta WHERE Usuario = ? AND Id_Respuesta = ?",
                [email, Id], function(err, comp){
                    if(err)
                    {
                        connection.release();
                        callback(new Error("Error al acceder a valoracion de preguntas de la base de datos"));
                    }
                    else{
                        if(comp.length == 0) //Si no ha votado aun, se le suma un voto a la pregunta
                        {
                            connection.query("UPDATE respuesta SET respuesta.Valoracion= respuesta.Valoracion+1, respuesta.Puntos=respuesta.Puntos-1 WHERE Id = ?",
                            [Id], function(err, like){
                                if(err)
                                {
                                    connection.release();
                                    callback(new Error("Error de incrementar voto en la base de datos"));
                                }
                                else{ //Inserta la accion
                                    connection.query("INSERT INTO valoracion_respuesta(Id_Respuesta, Usuario, Valoracion) VALUES (?,?,?)",
                                    [Id, email, -1], function(err, ok){
                                        if(err)
                                        {
                                            connection.release();
                                            callback(new Error("Error al insertar la valoracion acceso a la base de datos"));
                                        }
                                        else{ //Buscamos al usuario que publico la pregunta y el valor de su reputacion
                                            connection.query("SELECT respuesta.Correo, usuario.Reputacion FROM respuesta JOIN usuario ON respuesta.Correo = usuario.Correo WHERE Id = ?",
                                            [Id], function(err, user){
                                                if(err){
                                                    connection.release();
                                                    callback(new Error("Error de acceso a la base de datos"));
                                                }
                                                else{ //Comprobamos su reputacion y restamos
                                                    let resta = 1;
                                                    if(user[0].Reputacion > 2){
                                                        resta = user[0].Reputacion-2;
                                                    }
                                                    connection.query("UPDATE usuario SET usuario.Reputacion=? WHERE Correo = ?",
                                                    [resta, user[0].Correo], function(err, rep){
                                                        if(err)
                                                        {
                                                            connection.release();
                                                            callback(new Error("Error de acceso a la base de datos"));
                                                        }
                                                        else{
                                                            connection.release();
                                                            callback(null, true);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        else{ //ya ha votado
                            connection.release();
                            callback(null, true);
                        }
                    }
                });
            }
        });
    }

    answerMedal(Id, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{
                connection.query("SELECT * FROM respuesta WHERE Id = ?",
                [Id], function(err, answ){
                    connection.release();
                    if(err){
                        connection.release();
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        let puntos = answ[0].Puntos;
                        let email = answ[0].Correo;
                        let medallaId = 0;
                        let date = new Date();
                        if(puntos == 2){
                            medallaId = 8;
                        }
                        else if(puntos == 4){
                            medallaId = 9;
                        }
                        else if(puntos == 6){ 
                            medallaId = 10;
                        }
                        if(medallaId != 0)
                        {
                            //comprobamos si ya tiene esa medalla
                            connection.query("SELECT * FROM usuario_medalla WHERE Correo = ? AND Id_Medalla = ?",
                            [email, medallaId], function(err, med){
                                if(err){
                                    connection.release();
                                    callback(new Error("Error de acceso a la base de datos"));
                                }
                                else{
                                    if(med.length == 0) //No tiene esa medalla
                                    {
                                        connection.query("INSERT INTO usuario_medalla(Correo, Id_Medalla, Obtenidas, Fecha) VALUES (?,?,?,?)",
                                        [email, medallaId, 1, date], function(err, ok){
                                            if(err){
                                                connection.release();
                                                callback(new Error("Error de acceso a la base de datos"));
                                            }
                                            else{
                                                connection.release();
                                                callback(null, ok);
                                            }
                                        });
                                    }
                                    else{ //Ya la tenia
                                        connection.query("UPDATE usuario_medalla SET Obtenidas=Obtenidas+1 WHERE Correo = ? AND Id_Medalla = ?",
                                        [email, medallaId], function(err, ok){
                                            if(err){
                                                connection.release();
                                                callback(new Error("Error de acceso a la base de datos"));
                                            }
                                            else{
                                                connection.release();
                                                callback(null, ok);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                        else{
                            connection.release();
                            callback(null, true);
                        }
                    }
                });
            }
        });
    }

    visitMedal(Id, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{
                connection.query("SELECT * FROM pregunta WHERE Id = ?",
                [Id], function(err, quest){
                    if(err){
                        connection.release();
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        let visitas = quest[0].Visitas;
                        let email = quest[0].Usuario;
                        let medallaId = 0;
                        let date = new Date();
                        if(visitas == 2){
                            medallaId = 5;
                        }
                        else if(visitas == 4){
                            medallaId = 6;
                        }
                        else if(visitas == 6){ 
                            medallaId = 7;
                        }
                        if(medallaId != 0)
                        {
                            //comprobamos si ya tiene esa medalla
                            connection.query("SELECT * FROM usuario_medalla WHERE Correo = ? AND Id_Medalla = ?",
                            [email, medallaId], function(err, med){
                                if(err){
                                    connection.release();
                                    callback(new Error("Error de acceso a la base de datos"));
                                }
                                else{
                                    if(med.length == 0) //No tiene esa medalla
                                    {
                                        connection.query("INSERT INTO usuario_medalla(Correo, Id_Medalla, Obtenidas, Fecha) VALUES (?,?,?,?)",
                                        [email, medallaId, 1, date], function(err, ok){
                                            if(err){
                                                connection.release();
                                                callback(new Error("Error de acceso a la base de datos"));
                                            }
                                            else{
                                                connection.release();
                                                callback(null, ok);
                                            }
                                        });
                                    }
                                    else{ //Ya la tenia
                                        connection.query("UPDATE usuario_medalla SET Obtenidas=Obtenidas+1 WHERE Correo = ? AND Id_Medalla = ?",
                                        [email, medallaId], function(err, ok){
                                            if(err){
                                                connection.release();
                                                callback(new Error("Error de acceso a la base de datos"));
                                            }
                                            else{
                                                connection.release();
                                                callback(null, ok);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                        else{
                            connection.release();
                            callback(null, true);
                        }
                    }
                });
            }
        });
    }

    questionMedal(Id, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{
                connection.query("SELECT * FROM pregunta WHERE Id = ?",
                [Id], function(err, quest){
                    if(err){
                        connection.release();
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{
                        let puntos = quest[0].Puntos;
                        let email = quest[0].Usuario;
                        let medallaId = 0;
                        let date = new Date();
                        if(puntos == 1){
                            medallaId = 1;
                        }
                        else if(puntos == 2){
                            medallaId = 2;
                        }
                        else if(puntos == 4){
                            medallaId = 3;
                        }
                        else if(puntos == 6){ 
                            medallaId = 4;
                        }
                        if(medallaId != 0)
                        {
                            //comprobamos si ya tiene esa medalla
                            connection.query("SELECT * FROM usuario_medalla WHERE Correo = ? AND Id_Medalla = ?",
                            [email, medallaId], function(err, med){
                                if(err){
                                    connection.release();
                                    callback(new Error("Error de acceso a la base de datos"));
                                }
                                else{
                                    if(med.length == 0) //No tiene esa medalla
                                    {
                                        connection.query("INSERT INTO usuario_medalla(Correo, Id_Medalla, Obtenidas, Fecha) VALUES (?,?,?,?)",
                                        [email, medallaId, 1, date], function(err, ok){
                                            if(err){
                                                connection.release();
                                                callback(new Error("Error de acceso a la base de datos"));
                                            }
                                            else{
                                                connection.release();
                                                callback(null, ok);
                                            }
                                        });
                                    }
                                    else{ //Ya la tenia
                                        connection.query("UPDATE usuario_medalla SET Obtenidas=Obtenidas+1 WHERE Correo = ? AND Id_Medalla = ?",
                                        [email, medallaId], function(err, ok){
                                            if(err){
                                                connection.release();
                                                callback(new Error("Error de acceso a la base de datos"));
                                            }
                                            else{
                                                connection.release();
                                                callback(null, ok);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                        else{
                            connection.release();
                            callback(null, true);
                        }
                    }
                });
            }
        });
    }
    
}
module.exports = DAOInteractions;