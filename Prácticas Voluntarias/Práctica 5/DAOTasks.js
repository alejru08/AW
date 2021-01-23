//Práctica Voluntaria 3
//G22 - Verónica Calzada y Alejandro Ruiz 

"use strict";

class DAOTasks {
    constructor(pool) {  this.pool = pool;  }

    getAllTasks(email, callback) { 
        this.pool.getConnection(function(err, connection) {
            if (err) { 
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
            connection.query("SELECT * FROM task WHERE user = ? ORDER BY id",
            [email],
            function(err, rowsT) {
                connection.release(); // devolver al pool la conexión
                if (err) {
                    callback(new Error("Error de acceso a la base de datos"));
                }
                else {
                    if (rowsT.length === 0) {
                        callback(null, false); //no hay tareas
                    }
                    else {
                        connection.query("SELECT * FROM task JOIN tag ON taskId = id WHERE user = ? ORDER BY id", 
                        [email],
                        function(err, rowsTT) {
                            let tags=[];
                            let id = rowsT[0].id;
                            let resultado=[];
                            let tarea = {};
                            rowsT.forEach(fila => {
                                id = fila.id;
                                tarea ={
                                    id : fila.id,
                                    text : fila.text,
                                    done : fila.done,
                                    tags : [],
                                };
                                let tagAux = rowsTT.filter(elm => elm.id === id);
                                if(tagAux.length != 0){
                                    tagAux.forEach(t => {
                                        tarea.tags.push(t.tag);
                                    });
                                }
                                resultado.push(tarea);
                            });
                            callback(null, resultado);
                        })
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
            [email, task.text, 0],
            function(err, rows) {
                connection.release(); // devolver al pool la conexión
                if (err) {
                    callback(new Error("Error de acceso a la base de datos"));
                }
                else {
                    let tags = task.tags.length;
                    if(tags > 0)
                    {
                        //Preparar Consulta y los tags
                        let consulta = "INSERT INTO tag (taskId, tag) VALUES ?"
                        let tagL = [];
                        task.tags.forEach(obj =>{
                            tagL.push([rows.insertId, obj]);
                        })
                        //Metemos en la tabla
                        connection.query(consulta, [tagL], function(err, str)
                        {
                            if(err)
                            {
                                callback(new Error("Error de acceso a la base de datos (TAG)"));
                            }
                        });
                    }  
                    callback(null, true);          
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
                connection.query("SELECT * FROM task WHERE user = ? AND done = 1",
                [email],
                function(err,rows)
                {
                    connection.release(); // devolver al pool la conexión
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        let tagList=[];
                        rows.forEach(task => {
                            tagList.push(task.id);
                        });
                        connection.query("DELETE FROM tag WHERE taskId IN (?)",
                        [tagList],
                        function(err, rows)
                        {
                            if(err){
                                callback(new Error("Error: borrar los tags"));
                            }   
                            else{
                                connection.query("DELETE FROM task WHERE user = ? AND done = 1",
                                [email],
                                function(err, rows) {
                                    if (err) {
                                        callback(new Error("Error al borrar task"));
                                    }
                                    else {
                                        callback(null, rows);    
                                    }
                                });
                            }
                        });
                    }  
                });
            }
        });
    }
}

module.exports = DAOTasks;