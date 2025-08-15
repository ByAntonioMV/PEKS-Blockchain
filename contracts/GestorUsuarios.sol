// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title GestorUsuarios
 * @dev Este contrato gestiona el registro, los roles y los datos de los usuarios
 * (Pacientes, Investigadores) y Hospitales en la plataforma médica.
 * La dirección que despliega el contrato se convierte en el administrador principal.
 */
contract GestorUsuarios { 

    // --- ESTRUCTURAS DE DATOS ---

    // Define los roles disponibles en el sistema.
    enum Rol { NINGUNO, PACIENTE, INVESTIGADOR, HOSPITAL, ADMIN }

    // Estructura para almacenar los datos de un usuario personal.
    struct Usuario {
        string nombre;
        string apellido;
        string nacionalidad;
        string correo; // Se almacena con fines informativos, la autenticación real no depende de esto.
        bool estaRegistrado;
    }

    // Estructura para almacenar los datos de una institución hospitalaria.
    struct Hospital {
        string nombre;
        string idOficial; // ID o licencia oficial para verificación.
        string direccionFisica;
        bool estaRegistrado;
        bool estaVerificado; // El admin debe verificar al hospital.
    }

    // --- VARIABLES DE ESTADO ---

    address public propietario; // La dirección del dueño y administrador principal del contrato.

    // Mapeos para vincular una dirección de wallet a sus datos y rol.
    mapping(address => Rol) public roles;
    mapping(address => Usuario) public usuarios;
    mapping(address => Hospital) public hospitales;

    // --- EVENTOS ---

    // Se emite cuando un nuevo usuario o entidad se registra.
    event EntidadRegistrada(address indexed direccionEntidad, Rol rol, string nombre);
    // Se emite cuando el estado de verificación de un hospital cambia.
    event HospitalVerificado(address indexed direccionHospital, bool estaVerificado);


    // --- MODIFICADORES ---

    // Restringe la ejecución de una función solo al dueño del contrato.
    modifier soloPropietario() {
        require(msg.sender == propietario, "GestorUsuarios: Quien llama no es el propietario");
        _;
    }

    // Restringe la ejecución de una función a un rol específico.
    modifier soloRol(Rol _rolRequerido) {
        require(roles[msg.sender] == _rolRequerido, "GestorUsuarios: Quien llama no tiene el rol requerido");
        _;
    }

    // --- CONSTRUCTOR ---

    /**
     * @dev Se ejecuta una sola vez al desplegar el contrato.
     * Asigna al desplegador como el 'propietario' y le da el rol de ADMIN.
     */
    constructor() {
        propietario = msg.sender;
        roles[msg.sender] = Rol.ADMIN;
        emit EntidadRegistrada(msg.sender, Rol.ADMIN, "Propietario del Contrato");
    }


    // --- FUNCIONES DE REGISTRO ---

    /**
     * @dev Permite a un nuevo usuario (Paciente o Investigador) registrarse.
     * La dirección del que llama a la función (msg.sender) será su identificador único.
     * @param _nombre Nombre del usuario.
     * @param _apellido Apellido del usuario.
     * @param _nacionalidad Nacionalidad del usuario.
     * @param _correo Correo electrónico del usuario.
     * @param _rol El rol que desea registrar (solo PACIENTE o INVESTIGADOR).
     */
    function registrarUsuario(
        string memory _nombre,
        string memory _apellido,
        string memory _nacionalidad,
        string memory _correo,
        Rol _rol
    ) public {
        require(roles[msg.sender] == Rol.NINGUNO, "GestorUsuarios: La direccion ya esta registrada");
        require(_rol == Rol.PACIENTE || _rol == Rol.INVESTIGADOR, "GestorUsuarios: Rol invalido para registro de usuario");

        roles[msg.sender] = _rol;
        usuarios[msg.sender] = Usuario({
            nombre: _nombre,
            apellido: _apellido,
            nacionalidad: _nacionalidad,
            correo: _correo,
            estaRegistrado: true
        });

        emit EntidadRegistrada(msg.sender, _rol, string.concat(_nombre, " ", _apellido));
    }

    /**
     * @dev Permite a una institución registrarse como hospital.
     * Inicialmente, un hospital no está verificado. El admin debe verificarlo.
     * @param _nombre Nombre del hospital.
     * @param _idOficial ID o licencia oficial.
     * @param _direccionFisica Dirección física del hospital.
     */
    function registrarHospital(
        string memory _nombre,
        string memory _idOficial,
        string memory _direccionFisica
    ) public {
        require(roles[msg.sender] == Rol.NINGUNO, "GestorUsuarios: La direccion ya esta registrada");

        roles[msg.sender] = Rol.HOSPITAL;
        hospitales[msg.sender] = Hospital({
            nombre: _nombre,
            idOficial: _idOficial,
            direccionFisica: _direccionFisica,
            estaRegistrado: true,
            estaVerificado: false // El admin debe verificarlo manualmente.
        });

        emit EntidadRegistrada(msg.sender, Rol.HOSPITAL, _nombre);
    }


    // --- FUNCIONES DE ADMINISTRADOR ---

    /**
     * @dev Permite al admin verificar o desverificar un hospital.
     * Un hospital solo puede operar en la plataforma si está verificado.
     * @param _direccionHospital La dirección del hospital a verificar.
     * @param _estaVerificado El estado de verificación (true o false).
     */
    function verificarHospital(address _direccionHospital, bool _estaVerificado) public soloPropietario {
        require(roles[_direccionHospital] == Rol.HOSPITAL, "GestorUsuarios: La direccion no es de un hospital");
        
        hospitales[_direccionHospital].estaVerificado = _estaVerificado;
        emit HospitalVerificado(_direccionHospital, _estaVerificado);
    }


    // --- FUNCIONES DE LECTURA (GETTERS) ---

    /**
     * @dev Devuelve el rol de una dirección específica.
     * @param _direccionEntidad La dirección a consultar.
     * @return El rol como un valor del enum Rol.
     */
    function obtenerRol(address _direccionEntidad) public view returns (Rol) {
        return roles[_direccionEntidad];
    }

    /**
     * @dev Devuelve los detalles de un usuario registrado.
     * @param _direccionUsuario La dirección del usuario a consultar.
     * @return La estructura Usuario con los datos.
     */
    function obtenerDetallesUsuario(address _direccionUsuario) public view returns (Usuario memory) {
        require(usuarios[_direccionUsuario].estaRegistrado, "GestorUsuarios: Usuario no encontrado");
        return usuarios[_direccionUsuario];
    }

    /**
     * @dev Devuelve los detalles de un hospital registrado.
     * @param _direccionHospital La dirección del hospital a consultar.
     * @return La estructura Hospital con los datos.
     */
    function obtenerDetallesHospital(address _direccionHospital) public view returns (Hospital memory) {
        require(hospitales[_direccionHospital].estaRegistrado, "GestorUsuarios: Hospital no encontrado");
        return hospitales[_direccionHospital];
    }
}
