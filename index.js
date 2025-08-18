const express = require('express');
const path = require('path'); 
const app = express();
const port = 3801;

// Importación correcta de las rutas
const viewRoutes = require("./src/server/routes/Views/ViewsRoutes");

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