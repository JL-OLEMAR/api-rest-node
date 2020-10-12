'use strict'
var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api-rest-node', { useNewUrlParser: true })
    .then(() => {
        console.log('La conexion a la base de datos de mongo se ha realizado correctamente!!!');

        //Crear el servidor
        app.listen(port, () => {
            console.log('El servidor http://localhost:3999 está funcionando!!!');
        });
    })
    .catch(error => console.log(error));