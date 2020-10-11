'use strict'

//Requires
var express = require('express');
var bodyParser = require('body-parser');

//Ejecutar express
var app = express();

//Cargar archivos de rutas


//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//CORS


//Reescribir rutas

//Ruta/metodo de prueba
app.get('/prueba', (req, res) => {
    return res.status(200).send("<h1>Hola mundo soy el backend</h1>");
    /*
    return res.status(200).send({
        nombre: 'Victor Robles',
        message: 'Hola mundo desde el back-end con Node'
    });
    */
});

app.post('/prueba', (req, res) => {
    
    return res.status(200).send({
        nombre: 'Victor Robles',
        message: 'Hola mundo desde el back-end con Node soy un metodo POST'
    });
    
});

//Exportar modulo
module.exports = app;