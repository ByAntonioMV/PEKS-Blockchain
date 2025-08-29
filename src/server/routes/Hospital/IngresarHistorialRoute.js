const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const palabrasClaveMedicas = require('../../config/palabrasClave');

const router = express.Router();

router.post('/ingresar-historial', express.json(), async (req, res) => {
    const { historialData } = req.body;

    try {
        console.log("1. Recibido historial clínico.");

        const ipfsHash = "Qm" + Math.random().toString(36).substring(2, 15);
        console.log(`2 y 3. SIMULACIÓN: Hash de IPFS: ${ipfsHash}`);

        const regex = new RegExp(`\\b(${palabrasClaveMedicas.join('|')})\\b`, 'gi');
        const palabrasClaveEncontradas = (historialData.diagnosticoMedico.match(regex) || []);

        if (palabrasClaveEncontradas.length === 0) {
            return res.status(400).json({ success: false, message: "No se encontraron palabras clave válidas en el diagnóstico." });
        }
        const palabraClave = palabrasClaveEncontradas[0];

        const peksExecutable = path.join(__dirname, '../../../../PEKS/peks');
        const paramsFile = path.join(__dirname, '../../../../PEKS/a.param');
        const pkFile = path.join(__dirname, '../../../../PEKS/public_key.txt');

        execFile(peksExecutable, ['encrypt', paramsFile, pkFile, palabraClave], (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al ejecutar el programa C: ${error.message}`);
                return res.status(500).json({ success: false, message: "Error en el motor criptográfico." });
            }
            if (stderr) {
                console.error(`Error de la herramienta PEKS: ${stderr}`);
                return res.status(500).json({ success: false, message: "Error en la generación del índice PEKS." });
            }

            // --- CORRECCIÓN AQUÍ ---
            // El resultado de C (stdout) ya es un hexadecimal. Solo le añadimos el prefijo "0x".
            const indicePEKS = "0x" + stdout.trim();
            console.log(`4. Índice PEKS REAL generado desde C para '${palabraClave}': ${indicePEKS}`);

            res.json({
                success: true,
                message: "Datos procesados con criptografía real.",
                datosParaTransaccion: {
                    paciente: historialData.direccionPaciente,
                    ipfsHash: ipfsHash,
                    indicePEKS: indicePEKS
                }
            });
        });

    } catch (error) {
        console.error("Error al procesar el historial:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
});

module.exports = router;
