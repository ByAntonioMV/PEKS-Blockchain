const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/InicioSesion', (req, res) => {
  // Ruta corregida: Sube 3 niveles y luego entra a public
  res.sendFile(path.join(__dirname, "../../../public", "views", "Autenticacion", "InicioSesion.html"));
});

router.get('/PanelAdmin', (req, res) => {
  // Ruta corregida: Sube 3 niveles y luego entra a public
  res.sendFile(path.join(__dirname, "../../../public", "views", "Admin", "PanelAdmin.html"));
});

router.get('/PanelHospital', (req, res) => {
  // Ruta corregida: Sube 3 niveles y luego entra a public
  res.sendFile(path.join(__dirname, "../../../public", "views", "Hospital", "PanelHospital.html"));
});

router.get('/PanelPaciente', (req, res) => {
  // Ruta corregida: Sube 3 niveles y luego entra a public
  res.sendFile(path.join(__dirname, "../../../public", "views", "Paciente", "PanelPaciente.html"));
});

module.exports = router;