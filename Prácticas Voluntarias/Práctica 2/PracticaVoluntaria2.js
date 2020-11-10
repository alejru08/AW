//Verónica Calzada Álvarez y Alejandro Ruiz Martín 
//Grupo 22 
//Práctica Voluntaria 2 JavaScript

"use strict";

let listaTareas = [
{ text: "Preparar práctica AW", tags: ["AW", "practica"] },
{ text: "Mirar fechas congreso", done: true, tags: [] },
{ text: "Ir al supermercado", tags: ["personal"] },
{ text: "Mudanza", done: false, tags: ["personal"] },
];

//No finalizadas
function getToDoTasks(tasks)
{
    return tasks.filter(n => n.done !== true).map(n => n["text"]); //el map para hacer el array y filter para quitar los undefinded
}

console.log(getToDoTasks(listaTareas));

//Devuelve las tareas que contengan el tag que se pasa por parámetro
function findByTag(tasks, tag)
{
    return tasks.filter(n => n.tags.some(n => n === tag));
}

console.log(findByTag(listaTareas, "personal"));

//Devuelve las tareas que contengan al menos una etiqueta de los tags que se pasa por parámetro
function findByTags(tasks, tags)
{
    return tasks.filter(n => n.tags.some(n => tags.some(i => i === n) === true));
}

console.log(findByTags(listaTareas, ["personal", "practica"]));

//Devuelve el número de tareas completadas
function countDone(tasks)
{
    return tasks.filter(n => n.done === true).reduce((ac, n) => ac+1, 0);
}

console.log(countDone(listaTareas));

//Crea tareas con sus etiquetas
function createTask(texto)
{
    let tarea = {text: "", tags:[]};
    tarea.tags=texto.match(/@\w+[a-zA-Z]/g);
    tarea.text = texto.replace(/@\w+[a-zA-Z]/g, "");
    tarea.text = tarea.text.replace(/\s+/g, " ");

    return tarea;
}

console.log(createTask("Ir a       @deporte entrenar"));