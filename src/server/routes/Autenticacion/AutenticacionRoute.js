const express = require('express');
const path = require('path');
const { ethers } = require("ethers");

const router = express.Router();

// --- CONFIGURACIÓN DEL CONTRATO ---
const contractAddress = process.env.GESTOR_USUARIOS_ADDRESS; 
const contractABI = [
    "function roles(address) view returns (uint8)"
];

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// --- RUTAS ---
router.post('/autenticar', express.json(), async (req, res) => {
    const { userAddress } = req.body;

    if (!userAddress) {
        return res.status(400).json({ success: false, message: "No se proporcionó la dirección de la wallet." });
    }

    try {
        console.log(`Verificando rol para la dirección: ${userAddress}`);
        
        const userRoleBigInt = await contract.roles(userAddress);
        const userRole = Number(userRoleBigInt);

        let responsePayload = { success: true, role: "NINGUNO", message: "La cuenta no está registrada." };

        // Usamos un switch para manejar cada rol
        switch (userRole) {
            case 1: // PACIENTE
                console.log("Rol de Paciente confirmado.");
                responsePayload = { success: true, role: "PACIENTE", redirectUrl: `/PanelPaciente?address=${userAddress}` };
                break;
            case 2: // INVESTIGADOR
                console.log("Rol de Investigador confirmado.");
                responsePayload = { success: true, role: "INVESTIGADOR", redirectUrl: `/panelInvestigador?address=${userAddress}` };
                break;
            case 3: // HOSPITAL
                 console.log("Rol de Hospital confirmado.");
                responsePayload = { success: true, role: "HOSPITAL", redirectUrl: `/PanelHospital?address=${userAddress}` };
                break;
            case 4: // ADMIN
                console.log("Rol de Administrador confirmado.");
                responsePayload = { success: true, role: "ADMIN", redirectUrl: `/PanelAdmin?address=${userAddress}` };
                break;
            default: // NINGUNO (Rol 0)
                console.log("Rol encontrado: 0. No está registrado.");
                break;
        }
        
        res.json(responsePayload);

    } catch (error) {
        console.error("Error al verificar el rol en el contrato:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al consultar la blockchain." });
    }
});

module.exports = router;
