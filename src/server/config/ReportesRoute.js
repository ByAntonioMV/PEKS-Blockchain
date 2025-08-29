const express = require('express');
const reportesDB = require('../../server/config/Reportes'); // Importamos la misma DB

const router = express.Router();

// Ruta para obtener los detalles de un reporte específico por su hash
router.get('/obtener-reporte/:ipfsHash', (req, res) => {
    const { ipfsHash } = req.params;
    const reporte = reportesDB[ipfsHash];

    if (reporte) {
        res.json({ success: true, reporte });
    } else {
        res.status(404).json({ success: false, message: "Reporte no encontrado." });
    }
});

module.exports = router;
