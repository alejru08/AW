"use strict";

class DAOUsers {
    constructor(pool) {  this.pool = pool; }

    isUserCorrect(email, password, callback) {

        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
            connection.query("SELECT * FROM usuario WHERE Correo = ? AND Password = ?" ,
            [email,password],
            function(err, rows) {
                if (err) {
                    connection.release();
                    callback(new Error("Error de acceso a la base de datos"));
                }
                else {
                    if (rows.length === 0) {
                        connection.release();
                        callback(null, false); //no está el usuario con el password proporcionado
                    }
                    else {
                        connection.release();
                        callback(null, rows);
                    }           
                }
            });
            }
        }
        );
    }

    userImg(email, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
            connection.query("SELECT Foto FROM usuario WHERE Correo = ?" ,
            [email],
            function(err, rows) {
                if (err) {
                    connection.release();
                    callback(new Error("Error de acceso a la base de datos"));
                }
                else {
                    if (rows.length === 0) {
                        connection.release();
                        callback(null, false); //no está el usuario 
                    }
                    else {
                        connection.release();
                        callback(null, rows[0].Foto); //sí está
                    }           
                }
            });
            }
        });
    }

    insertUser(email, password, date, nick, image, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("INSERT INTO usuario(Correo, Password, Registro, Nombre, Foto, Reputacion) VALUES (?, ?, ?, ?, ?, ?)",
                [email, password, date, nick, image, 1],
                function(err, rows) {
                    if (err) {
                        connection.release();
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        connection.release();
                        callback(null, rows);      
                    }
                });
            }
        });
    }

    profile(email, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else { //cargamos la informacion del usuario y sus preguntas
                connection.query("SELECT * FROM usuario LEFT JOIN pregunta ON Correo = Usuario WHERE Correo = ?",
                [email], function(err, user){
                    if(err)
                    {
                        connection.release();
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else{ //cargamos las respuestas
                        connection.query("SELECT * FROM respuesta WHERE Correo = ?", [email],
                        function(err, answ){
                            if(err)
                            {
                                connection.release();
                                callback(new Error("Error de acceso a la base de datos"));
                            }
                            else{ //cargamos las medallas
                                connection.query("SELECT * FROM usuario_medalla JOIN medalla ON Id_Medalla = Id WHERE Correo = ?",
                                [email], function(err, med){
                                    if(err)
                                    {
                                        connection.release();
                                        callback(new Error("Error de acceso a la base de datos"));
                                    }
                                    else{//Manejamos la informacion
                                        let u = user[0];
                                        let fecha = u.Registro.getDate() + "-" + (u.Registro.getMonth()+1) + "-" + u.Registro.getFullYear();
                                        let infoUser = {
                                            Correo: u.Correo,
                                            Nick: u.Nombre,
                                            Fecha: fecha,
                                            Foto: u.Foto,
                                            Reputacion: u.Reputacion,
                                            Respuestas: answ.length,
                                            Preguntas: user.length,
                                            Medallas: {
                                                Bronce: [],
                                                Plata: [],
                                                Oro: []
                                            }
                                        }
                                        med.forEach(m => {
                                            let medalla = {
                                                Id: m.Id,
                                                Obtenidas: m.Obtenidas,
                                                Nombre: m.Nombre,
                                                Categoria: m.Categoria
                                            }
                                            if(medalla.Categoria == "Bronce"){
                                                infoUser.Medallas.Bronce.push(medalla);
                                            }
                                            else if(medalla.Categoria == "Plata"){
                                                infoUser.Medallas.Plata.push(medalla);
                                            }
                                            else if (medalla.Categoria == "Oro"){
                                                infoUser.Medallas.Oro.push(medalla);
                                            }
                                        }); 
                                        connection.release();
                                        callback(null, infoUser);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    allUsers(callback)
    {
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else { //Obtenemos la información de todos los usuarios
                connection.query("SELECT * FROM Usuario", [],
                function(err, users){
                    if (err) { 
                        connection.release();
                        callback(new Error("Error de conexión a la base de datos"));
                    }
                    else{ //Obtenemos las etiquetas de los usuarios
                        connection.query("SELECT Usuario, Id_Etiqueta, Nombre FROM pregunta JOIN etiqueta_pregunta JOIN etiqueta ON pregunta.Id = Id_Pregunta AND Id_Etiqueta = etiqueta.Id",
                        [], function(err, tags){
                            if (err) { 
                                connection.release();
                                callback(new Error("Error de conexión a la base de datos"));
                            }
                            else{ //Manejamos la informacion
                                let usuarios = [];
                                users.forEach(u => {
                                    let tagsUser = tags.filter(t => t.Usuario == u.Correo);
                                    let maxTag = {Rep: 0, Nombre: "", tagId: 0};
                                    tagsUser.forEach(tU =>{
                                        let tagL = tagsUser.filter(t => t.Id_Etiqueta == tU.Id_Etiqueta);
                                        if(tagL.length > maxTag.Rep)
                                        {
                                            maxTag = {Rep: tagL.length, Nombre: tU.Nombre, tagId: tU.Id_Etiqueta};
                                        }
                                    });
                                    let usuario = {
                                        Correo: u.Correo,
                                        Nick: u.Nombre,
                                        Reputacion: u.Reputacion,
                                        Foto: u.Foto,
                                        Etiqueta: maxTag.Nombre,
                                        TagId: maxTag.tagId
                                    }
                                    usuarios.push(usuario);
                                });
                                connection.release();
                                callback(null, usuarios);
                            }
                        });
                    }
                });
            }
        });
    }

    userFilter(text, callback)
    {
        this.pool.getConnection(function(err, connection){
            if(err)
            {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else{ 
                connection.query("SELECT * FROM usuario WHERE Nombre REGEXP ?",
                [text], function(err, users)
                {
                    if (err) { 
                        connection.release();
                        callback(new Error("Error de conexión a la base de datos"));
                    }
                    else{ //Obtenemos las etiquetas de los usuarios
                        connection.query("SELECT Usuario, Id_Etiqueta, Nombre FROM pregunta JOIN etiqueta_pregunta JOIN etiqueta ON pregunta.Id = Id_Pregunta AND Id_Etiqueta = etiqueta.Id",
                        [], function(err, tags){
                            if (err) { 
                                connection.release();
                                callback(new Error("Error de conexión a la base de datos"));
                            }
                            else{ //Manejamos la informacion
                                let usuarios = [];
                                users.forEach(u => {
                                    let tagsUser = tags.filter(t => t.Usuario == u.Correo);
                                    let maxTag = {Rep: 0, Nombre: "", tagId: 0};
                                    tagsUser.forEach(tU =>{
                                        let tagL = tagsUser.filter(t => t.Id_Etiqueta == tU.Id_Etiqueta);
                                        if(tagL.length > maxTag.Rep)
                                        {
                                            maxTag = {Rep: tagL.length, Nombre: tU.Nombre, tagId: tU.Id_Etiqueta};
                                        }
                                    });
                                    let usuario = {
                                        Correo: u.Correo,
                                        Nick: u.Nombre,
                                        Reputacion: u.Reputacion,
                                        Foto: u.Foto,
                                        Etiqueta: maxTag.Nombre,
                                        TagId: maxTag.tagId
                                    }
                                    usuarios.push(usuario);
                                });
                                connection.release();
                                callback(null, usuarios);
                            }
                        });
                    }
                });
            }
        });
    }

}
module.exports = DAOUsers;
  
  