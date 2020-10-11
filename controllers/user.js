'use strict'

var controller = {
    probando: function(req, res){
        return res.status(200).send({
            message: "Soy el metodo probando"
        });
    },
    testeando: function(req, res){
        return res.status(200).send({
            message: "Soy el metodo testeando"
        });
    }

};

module.exports = controller;