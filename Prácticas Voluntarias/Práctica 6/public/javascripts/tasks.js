"use strict"

let tags=[];

$ (function(){
    //Nombre de la tarea
    $("#tareaN").on("change", function() { 
        let valor = $(this).val().trim();
        $("#taskName").text(valor);
        tags = [];
    }); 

    //Insertar los tags
    $("#addTag").on("click", function(){
        let valor = $("#tag").val().trim();
        if(valor !== "")
        {
            let existe = tags.filter(t => t == "@"+valor);
            if(existe.length == 0){ //Si el tag no existe
                let tag = $('<span id="tagN" class=tag>' + valor + '</span>');
                $(tag).val(valor);
                tags.push("@"+valor);
                $("#res").append(tag);
            }
        }
        else{
            alert("El tag debe tener un nombre");
            return;
        }
    });

    //Eliminar los tags
    $("#formulario").on("click", "span", function(tag){
        let valor = $(this).val();
        let tagsAux = [];
        tags.forEach(t => {
            if(t != "@" + valor){
                tagsAux.push(t);
            }
        });
        tags=tagsAux;
        $(this).remove();
    });

    //AddTask
    $("#addTask").on("click", function(){
        let tarea = $("#tareaN").val().trim();
        if(tarea != ""){
            console.log(tags);
            if(tags.length > 0){ //hay tags
                tags.forEach(t=>{
                    tarea += " " + t; 
                });
            } 
            $("#add").val(tarea);
            console.log($("#add").val());
        }
        else{
            alert("La tarea debe tener un nombre");
            return;
        }
    });

});

