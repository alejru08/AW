//Práctica Voluntaria 3

"use strict";

class DAOTasks {
    constructor(pool) {  this.pool = pool;  }

    getAllTasks(email, callback) { 
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
            connection.query("SELECT * FROM task JOIN tag ON taskId = id WHERE user = ? ORDER BY id",
            [email],
            function(err, rows) {
                connection.release(); // devolver al pool la conexión
                if (err) {
                    callback(new Error("Error de acceso a la base de datos"));
                }
                else {
                    if (rows.length === 0) {
                        callback(null, false); //no hay tareas
                    }
                    else {
                        let tags=[];
                        let id = rows[0].id;
                        let resultado=[];
                        let tarea ={
                            id : rows[0].id,
                            text : rows[0].text,
                            done : rows[0].done,
                            tags : []
                    
                        };
                        rows.forEach(fila => {
                            if(id != fila.id){
                                resultado.push(tarea);
                                id = fila.id;
                                tarea ={
                                    id : fila.id,
                                    text : fila.text,
                                    done : fila.done,
                                    tags : [fila.tag],
                    
                                };
                            }
                            else{
                                tarea.tags.push(fila.tag);
                            }
                        });
                        resultado.push(tarea);
                        callback(null, resultado);
                    }           
                }
            });
            }
        });
    }

    insertTask(email, task, callback) { 
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
            connection.query("INSERT INTO task(user, text, done) VALUES (?, ?, ?)",
            [email, task.text, task.done],
            function(err, rows) {
                connection.release(); // devolver al pool la conexión
                if (err) {
                    callback(new Error("Error de acceso a la base de datos"));
                }
                else {
                    let tags = task.tag.length;
                    if(tags > 0)
                    {
                        //Preparar Consulta y los tags
                        let consulta = "INSERT INTO tag (taskId, tag) VALUES ?"
                        let tagL = [];
                        task.tag.forEach(obj =>{
                            tagL.push([rows.insertId, obj]);
                        })
                        //Metemos en la tabla
                        connection.query(consulta, [tagL], function(err, str)
                        {
                            if(err)
                            {
                                callback(new Error("Error de acceso a la base de datos (TAG)"));
                            }
                            else{
                                callback(null, true);
                            }
                        });
                    }            
                }
            });
            }
        });
    }

    markTaskDone(idTask, callback) { 
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
            connection.query("UPDATE task SET done = 1 WHERE id = ?",
            [idTask],
            function(err, rows) {
                connection.release(); // devolver al pool la conexión
                if (err) {
                    callback(new Error("Error de acceso a la base de datos"));
                }
                else {
                        callback(null, rows); //no está el usuario con el password proporcionad       
                }
            });
            }
        });
    }

    deleteCompleted(email, callback) { 
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
            connection.query("DELETE  FROM task WHERE user = ? AND done = 1",
            [email],
            function(err, rows) {
                connection.release(); // devolver al pool la conexión
                if (err) {
                    callback(new Error("Error de acceso a la base de datos"));
                }
                else {
                    callback(null, rows);    
                }
            });
            }
        });
    }
}

module.exports = DAOTasks;