// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./GestorUsuarios.sol";

/**
 * @title GestorReportesMedicos
 * @dev Guarda reportes médicos adaptados al formulario de pacientes, con función separada para auto-reportes.
 */
contract GestorReportesMedicos {
    GestorUsuarios public gestorUsuarios;

    struct AntecedentesFamiliares {
        string abuelosPaternos;
        string abuelosMaternos;
        string padre;
        string madre;
        string hermanos;
    }

    struct Consulta {
        string peso;
        string temperatura;
        string oxigenacion;
        string presion;
        string sintomas;
        string diagnosticoMedico;
        string medicamentos;
    }

    struct HistorialClinico {
        string nombre;
        string apellidos;
        uint edad;
        string sexo;
        string alergias;
        AntecedentesFamiliares antecedentesFamiliares;
        Consulta consulta;
    }

    struct ReporteMedico {
        uint256 idReporte;
        address paciente;
        address hospital; // Si es auto-reporte, puede ser address(0)
        uint256 fechaCreacion;
        HistorialClinico historial;
        bytes palabrasClavePEKS; // índice para búsquedas cifradas
    }

    uint256 public contadorReportes;
    mapping(uint256 => ReporteMedico) public reportes;

    event ReporteRegistrado(
        uint256 indexed idReporte,
        address indexed paciente
    );

    constructor(address _direccionGestorUsuarios) {
        gestorUsuarios = GestorUsuarios(_direccionGestorUsuarios);
    }

    /**
     * @notice Registrar reporte desde hospital
     */
    function registrarReporte(
        address _paciente,
        HistorialClinico memory _historial,
        bytes memory _palabrasClavePEKS
    ) public {
        require(
            gestorUsuarios.obtenerRol(msg.sender) == GestorUsuarios.Rol.MEDICO,
            "Solo medicos pueden registrar."
        );
        require(
            gestorUsuarios.obtenerRol(_paciente) == GestorUsuarios.Rol.PACIENTE,
            "Direccion de paciente invalida."
        );

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

    /**
     * @notice Registrar auto-reporte desde paciente
     */
    function registrarAutoReporte(
        HistorialClinico memory _historial,
        bytes memory _palabrasClavePEKS
    ) public {
        require(
            gestorUsuarios.obtenerRol(msg.sender) ==
                GestorUsuarios.Rol.PACIENTE,
            "Solo pacientes pueden registrar auto-reportes."
        );

        contadorReportes++;
        uint256 nuevoId = contadorReportes;

        reportes[nuevoId] = ReporteMedico({
            idReporte: nuevoId,
            paciente: msg.sender,
            hospital: address(0),
            fechaCreacion: block.timestamp,
            historial: _historial,
            palabrasClavePEKS: _palabrasClavePEKS
        });

        emit ReporteRegistrado(nuevoId, msg.sender);
    }

    /**
     * @notice Obtener todos los reportes
     */
    function obtenerTodosLosReportes()
        public
        view
        returns (ReporteMedico[] memory)
    {
        ReporteMedico[] memory todosReportes = new ReporteMedico[](
            contadorReportes
        );
        for (uint i = 0; i < contadorReportes; i++) {
            todosReportes[i] = reportes[i + 1];
        }
        return todosReportes;
    }
}
