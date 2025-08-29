// Asegúrate de que esta sea la dirección de tu ÚLTIMO despliegue
const contractAddress = "0x1A56D104E68F0697a74B17DC5c6A6BAa1F385cEc"; //Contrato de GestorEntidad
const contractABI = [
    "function registrarUsuarioPorAdmin(address _direccionUsuario, string memory _nombre, string memory _apellido, string memory _nacionalidad, string memory _correo, uint8 _rol)",
    "function registrarHospitalPorAdmin(address _direccionHospital, string memory _nombre, string memory _idOficial, string memory _direccionFisica)",
    "function verificarHospital(address _direccionHospital, bool _estaVerificado)"
];

let signer;
let contract;

// Función para inicializar signer y contract de forma segura
async function getContractWithSigner() {
    if (typeof window.ethereum === 'undefined') {
        throw new Error("MetaMask no está instalado.");
    }
    if (contract && signer) return contract; // Evita reconectar innecesariamente

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    return contract;
}

// --- LÓGICA DE REGISTRO DE USUARIO ---
const userForm = document.getElementById('registerUserForm');
const userMessage = document.getElementById('userMessage');
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const contractInstance = await getContractWithSigner();
        userMessage.textContent = "Preparando transacción...";

        const address = document.getElementById('userAddress').value;
        const nombre = document.getElementById('userName').value;
        const apellido = document.getElementById('userLastName').value;
        const correo = document.getElementById('userEmail').value;
        const nacionalidad = document.getElementById('userNationality').value;
        const rol = document.getElementById('userRole').value;

        userMessage.textContent = "Por favor, firma la transacción en MetaMask.";
        const tx = await contractInstance.registrarUsuarioPorAdmin(address, nombre, apellido, nacionalidad, correo, rol);

        userMessage.textContent = "Procesando registro en la blockchain...";
        await tx.wait();

        userMessage.className = "text-green-600";
        userMessage.textContent = `¡Usuario registrado exitosamente!`;
        userForm.reset();
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        userMessage.className = "text-red-600";
        userMessage.textContent = error.message.includes("MetaMask") ? error.message : "Error: La dirección ya podría estar registrada o la transacción fue rechazada.";
    }
});

// --- LÓGICA DE REGISTRO DE HOSPITAL (CORREGIDA) ---
const hospitalForm = document.getElementById('registerHospitalForm');
const hospitalMessage = document.getElementById('hospitalMessage');
hospitalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const contractInstance = await getContractWithSigner();
        hospitalMessage.textContent = "Preparando transacción...";

        const address = document.getElementById('hospitalAddress').value;
        const name = document.getElementById('hospitalName').value;
        const id = document.getElementById('hospitalId').value;
        const physicalAddress = document.getElementById('hospitalPhysicalAddress').value;

        hospitalMessage.textContent = "Por favor, firma la transacción en MetaMask.";

        const tx = await contractInstance.registrarHospitalPorAdmin(address, name, id, physicalAddress);

        hospitalMessage.textContent = "Procesando registro en la blockchain...";
        await tx.wait();

        hospitalMessage.className = "text-green-600";
        hospitalMessage.textContent = `¡Hospital registrado exitosamente!`;
        hospitalForm.reset();

    } catch (error) {
        console.error("Error al registrar hospital:", error);
        hospitalMessage.className = "text-red-600";
        hospitalMessage.textContent = error.message.includes("MetaMask") ? error.message : "Error: La dirección ya podría estar registrada o la transacción fue rechazada.";
    }
});