// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./GestorUsuarios.sol";

/**
 * @title GestorReportesMedicos (Versión PEKS y Off-Chain)
 * @dev Este contrato gestiona metadatos de reportes médicos. Los datos completos
 * se cifran, se almacenan fuera de la cadena (ej. IPFS), y se registran aquí
 * junto con un índice PEKS para búsquedas seguras por palabra clave.
 */
contract GestorReportesMedicos {

    GestorUsuarios public gestorUsuarios;

    // Estructura que se almacena en la blockchain por cada reporte.
    struct ReporteMedico {
        uint256 idReporte;
        address paciente;
        address hospital;
        uint256 fechaCreacion;
        string reporteCifradoHash;
        bytes palabrasClavePEKS;
    }

    uint256 public contadorReportes;
    mapping(uint256 => ReporteMedico) public reportes;

    event ReporteRegistrado(
        uint256 indexed idReporte,
        address indexed paciente,
        address indexed hospital,
        string reporteCifradoHash
    );

    constructor(address _direccionGestorUsuarios) {
        gestorUsuarios = GestorUsuarios(_direccionGestorUsuarios);
    }

    /**
     * @dev Permite a un hospital verificado registrar los metadatos de un nuevo reporte.
     */
    function registrarReporte(
        address _paciente,
        string memory _reporteCifradoHash,
        bytes memory _palabrasClavePEKS
    ) public {
        require(gestorUsuarios.roles(msg.sender) == GestorUsuarios.Rol.HOSPITAL, "Solo los hospitales pueden registrar.");
        require(gestorUsuarios.roles(_paciente) == GestorUsuarios.Rol.PACIENTE, "Direccion de paciente invalida.");

        contadorReportes++;
        uint256 nuevoId = contadorReportes;

        reportes[nuevoId] = ReporteMedico({
            idReporte: nuevoId,
            paciente: _paciente,
            hospital: msg.sender,
            fechaCreacion: block.timestamp,
            reporteCifradoHash: _reporteCifradoHash,
            palabrasClavePEKS: _palabrasClavePEKS
        });

        emit ReporteRegistrado(nuevoId, _paciente, msg.sender, _reporteCifradoHash);
    }

    /**
     * @dev NUEVA FUNCIÓN: Devuelve todos los reportes registrados en el sistema.
     * Es necesaria para que el backend pueda realizar la prueba de búsqueda.
     * ADVERTENCIA: Esta función es ineficiente en una red real con muchos datos.
     */
    function obtenerTodosLosReportes() public view returns (ReporteMedico[] memory) {
        ReporteMedico[] memory todosReportes = new ReporteMedico[](contadorReportes);
        for (uint i = 0; i < contadorReportes; i++) {
            // Los IDs de los reportes empiezan en 1, no en 0.
            todosReportes[i] = reportes[i + 1];
        }
        return todosReportes;
    }
}
