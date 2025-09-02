const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const { ethers } = require("ethers");

const router = express.Router();

// --- CONFIGURACIÓN ---
const gestorReportesAddress = process.env.GESTOR_REPORTES_ADDRESS;
const gestorReportesABI = [
    "function obtenerTodosLosReportes() view returns (tuple(uint256 idReporte, address paciente, address hospital, uint256 fechaCreacion, tuple(string nombre, uint256 edad, string sexo, string estadoCivil, string lugarNacimiento, string fechaNacimiento, string domicilio, string escolaridad, string ocupacion, string telefono, string religion, string tipoSangre, string alergias, tuple(string abuelosPaternos, string abuelosMaternos, string padre, string madre, string hermanos) antecedentesFamiliares, tuple(string fuma, string alcohol, string drogas, string farmacodependencia) antecedentesPersonales, tuple(string peso, string temperatura, string oxigenacion, string presion, string sintomas, string diagnosticoMedico, string medicamentos) consulta) historial, bytes palabrasClavePEKS)[] memory)"
];
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
const contract = new ethers.Contract(gestorReportesAddress, gestorReportesABI, provider);

const peksExecutable = path.join(__dirname, '../../../../PEKS/peks');
const paramsFile = path.join(__dirname, '../../../../PEKS/a.param');
const pkFile = path.join(__dirname, '../../../../PEKS/public_key.txt');
const skFile = path.join(__dirname, '../../../../PEKS/secret_key.txt');

// --- FUNCIÓN DE AYUDA PARA CONVERTIR BIGINT ---
function convertBigIntsToStrings(obj) {
    if (typeof obj === 'bigint') {
        return obj.toString();
    }
    if (Array.isArray(obj)) {
        return obj.map(convertBigIntsToStrings);
    }
    if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            newObj[key] = convertBigIntsToStrings(obj[key]);
        }
        return newObj;
    }
    return obj;
}

// --- RUTA DE BÚSQUEDA ---
router.post('/buscar-hospital', express.json(), async (req, res) => {
    const { keyword } = req.body;
    if (!keyword) return res.status(400).json({ success: false, message: "Falta palabra clave." });

    try {
        const trapdoor = await new Promise((resolve, reject) => {
            execFile(peksExecutable, ['trapdoor', paramsFile, skFile, keyword], (err, stdout) => {
                if (err) return reject(err);
                resolve(stdout.trim());
            });
        });

        const todosReportes = await contract.obtenerTodosLosReportes();
        let resultados = [];

        for (const reporte of todosReportes) {
            const peksHex = reporte.palabrasClavePEKS.substring(2);
            const match = await new Promise((resolve, reject) => {
                execFile(peksExecutable, ['test', paramsFile, peksHex, trapdoor, pkFile], (err, stdout) => {
                    if (err) return reject(err);
                    resolve(stdout.trim() === "MATCH");
                });
            });

            if (match) {
                // --- CORRECCIÓN CLAVE AQUÍ ---
                // Convertimos el objeto "Result" de ethers a un objeto JavaScript simple.
                const historialLimpio = {
                    nombre: reporte.historial.nombre,
                    edad: reporte.historial.edad,
                    sexo: reporte.historial.sexo,
                    estadoCivil: reporte.historial.estadoCivil,
                    lugarNacimiento: reporte.historial.lugarNacimiento,
                    fechaNacimiento: reporte.historial.fechaNacimiento,
                    domicilio: reporte.historial.domicilio,
                    escolaridad: reporte.historial.escolaridad,
                    ocupacion: reporte.historial.ocupacion,
                    telefono: reporte.historial.telefono,
                    religion: reporte.historial.religion,
                    tipoSangre: reporte.historial.tipoSangre,
                    alergias: reporte.historial.alergias,
                    antecedentesFamiliares: {
                        abuelosPaternos: reporte.historial.antecedentesFamiliares.abuelosPaternos,
                        abuelosMaternos: reporte.historial.antecedentesFamiliares.abuelosMaternos,
                        padre: reporte.historial.antecedentesFamiliares.padre,
                        madre: reporte.historial.antecedentesFamiliares.madre,
                        hermanos: reporte.historial.antecedentesFamiliares.hermanos
                    },
                    antecedentesPersonales: {
                        fuma: reporte.historial.antecedentesPersonales.fuma,
                        alcohol: reporte.historial.antecedentesPersonales.alcohol,
                        drogas: reporte.historial.antecedentesPersonales.drogas,
                        farmacodependencia: reporte.historial.antecedentesPersonales.farmacodependencia
                    },
                    consulta: {
                        peso: reporte.historial.consulta.peso,
                        temperatura: reporte.historial.consulta.temperatura,
                        oxigenacion: reporte.historial.consulta.oxigenacion,
                        presion: reporte.historial.consulta.presion,
                        sintomas: reporte.historial.consulta.sintomas,
                        diagnosticoMedico: reporte.historial.consulta.diagnosticoMedico,
                        medicamentos: reporte.historial.consulta.medicamentos
                    }
                };

                resultados.push({
                    id: reporte.idReporte,
                    detalles: historialLimpio // Usamos el objeto limpio
                });
            }
        }
        
        const serializableResultados = convertBigIntsToStrings(resultados);
        res.json({ success: true, resultados: serializableResultados });

    } catch (error) {
        console.error("Error en la búsqueda:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor durante la búsqueda." });
    }
});

module.exports = router;
