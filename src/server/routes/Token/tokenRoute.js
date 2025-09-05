const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "clave_super_secreta";

router.post('/generar-token', (req, res) => {
    const { address, nombre } = req.body;

    if (!address || !nombre) {
        return res.status(400).json({ success: false, message: "Datos incompletos para generar token." });
    }

    // Payload del token
    const payload = {
        address,
        nombre,
        tipo: "PACIENTE"
    };

    // Generar JWT con expiración de 1 día
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({ success: true, token });
});

module.exports = router;
