const express = require('express');

const { execFile } = require('child_process');

const path = require('path');

const { ethers } = require("ethers");



const router = express.Router();



// --- CONFIGURACIÓN ---

const gestorReportesAddress = process.env.GESTOR_REPORTES_ADDRESS;

const gestorReportesABI = [

    "function obtenerTodosLosReportes() view returns (tuple(uint256 idReporte, address paciente, address hospital, uint256 fechaCreacion, string reporteCifradoHash, bytes palabrasClavePEKS)[] memory)"

];

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

const contract = new ethers.Contract(gestorReportesAddress, gestorReportesABI, provider);



const peksExecutable = path.join(__dirname, '../../../../PEKS/peks');

const paramsFile = path.join(__dirname, '../../../../PEKS/a.param');

const pkFile = path.join(__dirname, '../../../../PEKS/public_key.txt');

const skFile = path.join(__dirname, '../../../../PEKS/secret_key.txt');



// --- RUTA DE BÚSQUEDA ---

router.post('/buscar-hospital', express.json(), async (req, res) => {

    const { keyword } = req.body;

    if (!keyword) return res.status(400).json({ success: false, message: "Falta palabra clave." });



    console.log("\n--- INICIANDO NUEVA BÚSQUEDA ---");

    console.log(`[Paso 1] Palabra clave recibida del frontend: "${keyword}"`);



    try {

        // 1. Generar Trapdoor

        const trapdoor = await new Promise((resolve, reject) => {

            execFile(peksExecutable, ['trapdoor', paramsFile, skFile, keyword], (err, stdout) => {

                if (err) return reject(err);

                resolve(stdout.trim());

            });

        });

        console.log(`[Paso 2] Trapdoor generado por C: "${trapdoor}"`);



        // 2. Obtener todos los reportes de la blockchain

        const todosReportes = await contract.obtenerTodosLosReportes();

        console.log(`[Paso 3] Se encontraron ${todosReportes.length} reportes en la blockchain.`);

        const resultados = [];



        // 3. Probar el trapdoor contra cada reporte

        for (let i = 0; i < todosReportes.length; i++) {

            const reporte = todosReportes[i];

            const peksHex = reporte.palabrasClavePEKS.substring(2); // Quitar el '0x'

            console.log(`\n -> Probando Reporte ID: ${reporte.idReporte.toString()}`);

            console.log(` - Índice PEKS del reporte: "${peksHex}"`);



            const match = await new Promise((resolve, reject) => {

                execFile(peksExecutable, ['test', paramsFile, peksHex, trapdoor, pkFile], (err, stdout) => {

                    if (err) return reject(err);

                    resolve(stdout.trim() === "MATCH");

                });

            });



            console.log(` - Resultado de la prueba: ${match ? "✅ COINCIDE" : "❌ NO COINCIDE"}`);



            if (match) {

                resultados.push({ id: reporte.idReporte.toString(), ipfsHash: reporte.reporteCifradoHash });

            }

        }



        console.log(`[Paso 4] Búsqueda finalizada. Se encontraron ${resultados.length} coincidencias.`);

        res.json({ success: true, resultados });



    } catch (error) {

        console.error("Error en la búsqueda:", error);

        res.status(500).json({ success: false, message: "Error interno del servidor." });

    }

});



module.exports = router;