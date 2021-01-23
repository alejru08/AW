"use strict";

module.exports = {
    createTags(texto){
        let tags = [];
        let cadena = texto.match(/@\w+[a-zA-Z-0-9]/g);
        if(cadena !== null)
        {
            cadena.forEach(t => {
                t = t.replace(/\@/, "");
                tags.push([t]);
            });
        }

        return tags;
    },

    randNum(){
        return Math.round(Math.random() * (4 - 1) + 1);
    }

}

