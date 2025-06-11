1.- APP
2.- App.use como este app.use('/usuario', rutaUsuario)
3.- En el caso anterior iremos a la ruta de usuario
4.- Ahora podemos ir a cualquiera de esas rutas de usuario
5.- se va a la funcion asignada de los usuarios
6.- Datos
    Siempre ocupar un try catch para las funciones
    Los req.params ocuparlos en caso de eliminacion o actualizacion o obtencion de informacion mediante un id
    Los req.query ocuparlos para filtrar o paginar informacion
    El req.body ocuparlo en caso de enviar informacion mas contundente al backend como json

    {
        "nombre":"TEst",
        "key":"values"
    }