const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/InicioSesion', (req, res) => {
  // Ruta corregida: Sube 3 niveles y luego entra a public
  res.sendFile(path.join(__dirname, "../../../public", "views", "Autenticacion", "InicioSesion.html"));
});

module.exports = router;