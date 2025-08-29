// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title GestorUsuarios
 * @dev Contrato final con funciones de administrador para registrar usuarios y hospitales.
 */
contract GestorUsuarios { 

    // --- ESTRUCTURAS DE DATOS ---
    enum Rol { NINGUNO, PACIENTE, INVESTIGADOR, HOSPITAL, ADMIN }

    struct Usuario {
        string nombre;
        string apellido;
        string nacionalidad;
        string correo;
        bool estaRegistrado;
    }

    struct Hospital {
        string nombre;
        string idOficial;
        string direccionFisica;
        bool estaRegistrado;
        bool estaVerificado;
    }

    // --- VARIABLES DE ESTADO ---
    address public propietario;
    mapping(address => Rol) public roles;
    mapping(address => Usuario) public usuarios;
    mapping(address => Hospital) public hospitales;

    // --- EVENTOS ---
    event EntidadRegistrada(address indexed direccionEntidad, Rol rol, string nombre);
    event HospitalVerificado(address indexed direccionHospital, bool estaVerificado);

    // --- MODIFICADORES ---
    modifier soloPropietario() {
        require(msg.sender == propietario, "GestorUsuarios: Quien llama no es el propietario");
        _;
    }

    // --- CONSTRUCTOR ---
    constructor() {
        propietario = msg.sender;
        roles[msg.sender] = Rol.ADMIN;
        emit EntidadRegistrada(msg.sender, Rol.ADMIN, "Propietario del Contrato");
    }

    // --- FUNCIONES DE REGISTRO PÚBLICO ---
    function autoRegistroUsuario(
        string memory _nombre,
        string memory _apellido,
        string memory _nacionalidad,
        string memory _correo,
        Rol _rol
    ) public {
        require(roles[msg.sender] == Rol.NINGUNO, "La direccion ya esta registrada");
        require(_rol == Rol.PACIENTE || _rol == Rol.INVESTIGADOR, "Rol invalido");
        roles[msg.sender] = _rol;
        usuarios[msg.sender] = Usuario(_nombre, _apellido, _nacionalidad, _correo, true);
        emit EntidadRegistrada(msg.sender, _rol, string.concat(_nombre, " ", _apellido));
    }
    
    function registrarHospital(
        string memory _nombre,
        string memory _idOficial,
        string memory _direccionFisica
    ) public {
        require(roles[msg.sender] == Rol.NINGUNO, "La direccion ya esta registrada");
        roles[msg.sender] = Rol.HOSPITAL;
        hospitales[msg.sender] = Hospital(_nombre, _idOficial, _direccionFisica, true, false);
        emit EntidadRegistrada(msg.sender, Rol.HOSPITAL, _nombre);
    }

    // --- FUNCIONES DE ADMINISTRADOR ---
    function registrarUsuarioPorAdmin(
        address _direccionUsuario,
        string memory _nombre,
        string memory _apellido,
        string memory _nacionalidad,
        string memory _correo,
        Rol _rol
    ) public soloPropietario {
        require(roles[_direccionUsuario] == Rol.NINGUNO, "La direccion del usuario ya esta registrada");
        require(_rol == Rol.PACIENTE || _rol == Rol.INVESTIGADOR, "Rol invalido");
        roles[_direccionUsuario] = _rol;
        usuarios[_direccionUsuario] = Usuario(_nombre, _apellido, _nacionalidad, _correo, true);
        emit EntidadRegistrada(_direccionUsuario, _rol, string.concat(_nombre, " ", _apellido));
    }

    /**
     * @dev NUEVA FUNCIÓN: Permite al admin registrar un hospital con todos sus datos.
     */
    function registrarHospitalPorAdmin(
        address _direccionHospital,
        string memory _nombre,
        string memory _idOficial,
        string memory _direccionFisica
    ) public soloPropietario {
        require(roles[_direccionHospital] == Rol.NINGUNO, "La direccion del hospital ya esta registrada");
        roles[_direccionHospital] = Rol.HOSPITAL;
        hospitales[_direccionHospital] = Hospital(_nombre, _idOficial, _direccionFisica, true, false);
        emit EntidadRegistrada(_direccionHospital, Rol.HOSPITAL, _nombre);
    }

    function verificarHospital(address _direccionHospital, bool _estaVerificado) public soloPropietario {
        require(roles[_direccionHospital] == Rol.HOSPITAL, "La direccion no es de un hospital");
        hospitales[_direccionHospital].estaVerificado = _estaVerificado;
        emit HospitalVerificado(_direccionHospital, _estaVerificado);
    }

    // --- FUNCIONES DE LECTURA (GETTERS) ---
    function obtenerRol(address _direccionEntidad) public view returns (Rol) {
        return roles[_direccionEntidad];
    }
}
