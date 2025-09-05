const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const palabrasClaveMedicas = require('../../config/palabrasClave');

const router = express.Router();

router.post('/ingresar-paciente', express.json(), async (req, res) => {
    const { historialData, pacienteAddress } = req.body;

    if (!historialData || !pacienteAddress) {
        return res.status(400).json({ success: false, message: "Faltan datos del historial o dirección del paciente." });
    }

    try {
        console.log("1. Recibido auto-reporte del paciente.");

        // --- Simulación de subida a IPFS ---
        const ipfsHash = "Qm" + Math.random().toString(36).substring(2, 15);
        console.log(`2. SIMULACIÓN: Hash de IPFS generado: ${ipfsHash}`);

        // --- Validación de palabras clave ---
        const regex = new RegExp(`\\b(${palabrasClaveMedicas.join('|')})\\b`, 'gi');
        const palabrasClaveEncontradas = (historialData.diagnosticoMedico?.match(regex) || []);

        if (palabrasClaveEncontradas.length === 0) {
            // Si no encuentra ninguna palabra clave, enviamos un warning, pero podemos tomar una palabra genérica
            console.warn("No se encontraron palabras clave válidas. Se usará 'salud' como fallback.");
            palabrasClaveEncontradas.push('salud');
        }

        const palabraClave = palabrasClaveEncontradas[0];

        // --- Rutas al programa PEKS ---
        const peksExecutable = path.join(__dirname, '../../../../PEKS/peks');
        const paramsFile = path.join(__dirname, '../../../../PEKS/a.param');
        const pkFile = path.join(__dirname, '../../../../PEKS/public_key.txt');

        // --- Ejecutar PEKS ---
        execFile(peksExecutable, ['encrypt', paramsFile, pkFile, palabraClave], (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al ejecutar PEKS: ${error.message}`);
                return res.status(500).json({ success: false, message: "Error en el motor criptográfico." });
            }
            if (stderr) {
                console.error(`Error de la herramienta PEKS: ${stderr}`);
                return res.status(500).json({ success: false, message: "Error en la generación del índice PEKS." });
            }

            const indicePEKS = "0x" + stdout.trim();
            console.log(`3. Índice PEKS REAL generado para '${palabraClave}': ${indicePEKS}`);

            // --- Enviar al frontend ---
            res.json({
                success: true,
                message: "Datos procesados con criptografía real.",
                datosParaTransaccion: {
                    paciente: pacienteAddress,
                    ipfsHash: ipfsHash,
                    indicePEKS: indicePEKS
                }
            });
        });

    } catch (error) {
        console.error("Error al procesar el auto-reporte:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
});

module.exports = router;
