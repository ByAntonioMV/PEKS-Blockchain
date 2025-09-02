// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./GestorUsuarios.sol";

/**
 * @title GestorReportesMedicos (Versión On-Chain para Pruebas)
 * @dev Almacena el historial clínico completo y el índice PEKS en la blockchain.
 */
contract GestorReportesMedicos {

    GestorUsuarios public gestorUsuarios;

    struct AntecedentesFamiliares { string abuelosPaternos; string abuelosMaternos; string padre; string madre; string hermanos; }
    struct AntecedentesPersonales { string fuma; string alcohol; string drogas; string farmacodependencia; }
    struct Consulta { string peso; string temperatura; string oxigenacion; string presion; string sintomas; string diagnosticoMedico; string medicamentos; }

    struct HistorialCompleto {
        string nombre; uint edad; string sexo; string estadoCivil; string lugarNacimiento; string fechaNacimiento;
        string domicilio; string escolaridad; string ocupacion; string telefono; string religion; string tipoSangre; string alergias;
        AntecedentesFamiliares antecedentesFamiliares;
        AntecedentesPersonales antecedentesPersonales;
        Consulta consulta;
    }

    struct ReporteMedico {
        uint256 idReporte;
        address paciente;
        address hospital;
        uint256 fechaCreacion;
        HistorialCompleto historial;
        bytes palabrasClavePEKS; // Mantenemos el índice PEKS para la búsqueda
    }

    uint256 public contadorReportes;
    mapping(uint256 => ReporteMedico) public reportes;

    event ReporteRegistrado(uint256 indexed idReporte, address indexed paciente);

    constructor(address _direccionGestorUsuarios) {
        gestorUsuarios = GestorUsuarios(_direccionGestorUsuarios);
    }

    function registrarReporte(
        address _paciente,
        HistorialCompleto memory _historial,
        bytes memory _palabrasClavePEKS
    ) public {
        require(gestorUsuarios.roles(msg.sender) == GestorUsuarios.Rol.HOSPITAL, "Solo hospitales pueden registrar.");
        require(gestorUsuarios.roles(_paciente) == GestorUsuarios.Rol.PACIENTE, "Direccion de paciente invalida.");

        contadorReportes++;
        uint256 nuevoId = contadorReportes;

        reportes[nuevoId] = ReporteMedico({
            idReporte: nuevoId,
            paciente: _paciente,
            hospital: msg.sender,
            fechaCreacion: block.timestamp,
            historial: _historial,
            palabrasClavePEKS: _palabrasClavePEKS
        });

        emit ReporteRegistrado(nuevoId, _paciente);
    }
    
    function obtenerTodosLosReportes() public view returns (ReporteMedico[] memory) {
        ReporteMedico[] memory todosReportes = new ReporteMedico[](contadorReportes);
        for (uint i = 0; i < contadorReportes; i++) {
            todosReportes[i] = reportes[i + 1];
        }
        return todosReportes;
    }
}
