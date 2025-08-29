require('dotenv').config();
const express = require('express');
const path = require('path'); 
const app = express();
const port = 3801;

// Importación de las vistas de rutas
const viewRoutes = require("./src/server/routes/Views/ViewsRoutes");

//*******Rutas de funcionamiento******//
const autenticacionRoutes = require('./src/server/routes/Autenticacion/AutenticacionRoute');
const ingresarHistorialRoute = require('./src/server/routes/Hospital/IngresarHistorialRoute')
const BuscarHospitalRoute = require('./src/server/routes/Hospital/BuscarRoute')
const ReporteRoute = require('./src/server/config/ReportesRoute')
//*****Fin rutas de funcionamiento****//

//******************Rutas Api*******************//
app.use('/api', autenticacionRoutes);
app.use('/api', ingresarHistorialRoute);
app.use('/api', BuscarHospitalRoute);
app.use('/api', ReporteRoute);
//**************Fin de rutas Api***************//

// Servir archivos estáticos desde la carpeta correcta: "src/public"
app.use(express.static(path.join(__dirname, "src", "public")));

// Usar las rutas de ViewsRoute
app.use('/', viewRoutes);

// Redirección a la página de inicio de sesión
app.get('/', (req, res) => {
  res.redirect('/InicioSesion');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});