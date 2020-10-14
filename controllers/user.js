'use strict'

var validator = require('validator');
var bcript = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var jwt = require('../services/jwt');

var controller = {
    probando: function (req, res) {
        return res.status(200).send({
            message: 'Soy el metodo probando'
        });
    },
    testeando: function (req, res) {
        return res.status(200).send({
            message: 'Soy el metodo testeando'
        });
    },

    save: (req, res) => {
        //Recoger los parametros de la peticion
        var params = req.body;

        //Validar los datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if (validate_name && validate_surname && validate_email && validate_password) {
            //Crear objeto de usuario
            var user = new User();

            //Asignar valores al objeto
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;

            //Comprobar si el usuario existe
            User.findOne({ email: user.email }, (err, issetUser) => {
                if (err) {
                    return res.status(500).send({
                        message: 'Error al comprobar duplicidad de usuario.'
                    });
                }
                if (!issetUser) {
                    //Si no existe,

                    //Cifrar la contraseña
                    bcript.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;

                        //y guardar usuarios
                        user.save((err, userStored) => {
                            if (err) {
                                return res.status(500).send({
                                    message: 'Error al guardar el usuario.'
                                });
                            }
                            if (!userStored) {
                                return res.status(400).send({
                                    message: 'El usuario no se ha guardado.'
                                });
                            }
                            //Devolver respusta
                            return res.status(200).send({
                                status: 'success',
                                user: userStored
                            });

                        }); //Close save
                    }); // CLose bcript

                } else {
                    return res.status(200).send({
                        message: 'El usuario ya está registrado.'
                    });
                }
            });

        } else {
            return res.status(200).send({
                message: 'Validación de los datos del usuario incorrecta, intentalo de nuevo.'
            });
        }
    },

    login: (req, res) => {
        //Recoger los parametros de la peticion
        var params = req.body;

        //Validar los datos
        try {
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if (!validate_email || !validate_password) {
            return res.status(200).send({
                message: 'Los datos son incorrectos, envialos bien.'
            });
        }
        //Buscar usuarios que coincidan con el email
        User.findOne({ email: params.email.toLowerCase() }, (err, user) => {

            if (err) {
                return res.status(500).send({
                    message: 'Error al intentar identificarse.'
                });
            }
            if (!user) {
                return res.status(404).send({
                    message: 'El usuario no existe.'
                });
            }

            //Si lo encuentra,
            //Comprobar la contrraseña (coincidencia de email y password / bcript)
            bcript.compare(params.password, user.password, (err, check) => {

                //Si es correcto,
                if (check) {
                    //Generar token de jwt y devolverlo
                    if (params.gettoken) {

                        //Devolver los datos
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });

                    } else {
                        //Limpiar el objeto
                        user.password = undefined;

                        //Devolver los datos
                        return res.status(200).send({
                            status: 'success',
                            user
                        });
                    }

                } else {
                    return res.status(200).send({
                        message: 'Las credenciales no son las correctas.'
                    });
                }
            });
        });
    },

    update: (req, res) => {
        // Recoger datos del usuario
        var params = req.body;

        try {
            //Validar datos
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        // Eliminar propiedades innecesarias
        delete params.password;

        var userId = req.user.sub;

        // Comprobar si el email es unico
        if (req.user.email != params.email) {
            User.findOne({ email: params.email.toLowerCase() }, (err, user) => {

                if (err) {
                    return res.status(500).send({
                        message: 'Error al intentar identificarse.'
                    });
                }
                if (user && user.email == params.email) {
                    return res.status(200).send({
                        message: 'El email ya existe, escoge otro.'
                    });
                } else {
                    // Buscar y actualizar documento
                    User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdated) => {

                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar usuario'
                            });
                        }

                        if (!userUpdated) {
                            return res.status(200).send({
                                status: 'error',
                                message: 'No se ha actualizado el usuario'
                            });
                        }

                        // Devolver respuesta
                        return res.status(200).send({
                            status: "success",
                            user: userUpdated
                        });
                    });
                }
            });
        } else {
            // Buscar y actualizar documento
            User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdated) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar usuario'
                    });
                }

                if (!userUpdated) {
                    return res.status(200).send({
                        status: 'error',
                        message: 'No se ha actualizado el usuario'
                    });
                }

                // Devolver respuesta
                return res.status(200).send({
                    status: "success",
                    user: userUpdated
                });
            });
        }

    },

    uploadAvatar: (req, res) => {
        // Configurar el modulo multiparty (md) routes/user.js

        // Recoger el fichero de la peticion
        var file_name = 'Avatar no subido...';

        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        // Conseguir el nombre y la extension del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        //Advertencia ** En linux o mac
        //var file_split = file_path.split('/');

        //Nombre del archivo
        var file_name = file_split[2];

        //Extension del archivo
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        // Comprobar extension (solo imagenes), si no es valida borrar fichero subido
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            fs.unlink(file_path, (err) => {

                return res.status(200).send({
                    status: 'error',
                    message: 'La extension del archivo no es válida'
                });

            });
        } else {
            // Sacar el id del usuario identificado
            var userId = req.user.sub;

            // Buscar y actualizar documento db
            User.findOneAndUpdate({ _id: userId }, { image: file_name }, { new: true }, (err, userUpdated) => {

                if (err || !userUpdated) {
                    // Devolver respuesta erronea
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al guardar el usuario'
                    });
                }

                // Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                });

            });
        }
    },

    avatar: (req, res) => {
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/' + fileName;
        fs.exists(pathFile, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(pathFile));
            } else {
                return res.status(404).send({
                    message: 'La imagen no existe.'
                });
            }
        });
    },

    getUsers: (req, res) => {
        User.find().exec((err, users) => {
            if (err || !users) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay usuarios que mostrar.'
                });
            }
            return res.status(200).send({
                status: 'success',
                users
            });
        });
    },

    getUser: (req, res) => {
        var userId = req.params.userId;

        User.findById(userId).exec((err, user) => {
            if (err || !user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el usuario.'
                });
            }
            return res.status(200).send({
                status: 'success',
                user
            });
        });
    }
};

module.exports = controller;
