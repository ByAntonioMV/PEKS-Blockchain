// Dirección del contrato desplegado
const contractAddress = "0x901d3b9532E9ef7AD2E1c95105B7Bb43D749baB8";
const contractABI = [
    "function registrarUsuarioPorAdmin(address _direccionUsuario, string memory _nombre, string memory _apellido, string memory _nacionalidad, string memory _correo, uint8 _rol)",
    "function registrarMedicoPorAdmin(address _direccionMedico, string memory _nombre, string memory _idOficial, string memory _direccionFisica)"
];

let signer;
let contract;

// --- Inicializa signer y contrato ---
async function getContractWithSigner() {
    if (typeof window.ethereum === 'undefined') throw new Error("MetaMask no está instalado.");

    if (contract && signer) return contract;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    return contract;
}

// --- Lógica de registro ---
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
        const rol = parseInt(document.getElementById('userRole').value); // 1=Paciente,2=Investigador,3=Médico

        console.log("📤 Datos a enviar ->", { address, nombre, apellido, correo, nacionalidad, rol });

        userMessage.textContent = "Por favor, firma la transacción en MetaMask.";

        let tx;
        if (rol === 3) {
            // Registrar médico
            const idOficial = prompt("Ingresa la cedula del médico:");
            const direccionFisica = prompt("Ingresa dirección física del médico:");
            tx = await contractInstance.registrarMedicoPorAdmin(address, nombre, idOficial, direccionFisica);
        } else {
            // Registrar paciente o investigador
            tx = await contractInstance.registrarUsuarioPorAdmin(address, nombre, apellido, nacionalidad, correo, rol);
        }

        console.log("⏳ Hash de transacción:", tx.hash);
        userMessage.textContent = "Procesando registro en la blockchain...";
        await tx.wait();

        console.log("✅ Transacción confirmada:", tx);

        if (rol === 1) {
            // Generar JWT para paciente
            const response = await fetch('/api/generar-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, nombre })
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem("jwt_paciente", data.token);
                console.log("🔑 Token JWT generado:", data.token); // <-- Agregado
                userMessage.textContent = `¡Paciente registrado exitosamente! Token generado.`;
            } else {
                console.log("⚠️ Error al generar token:", data); // <-- opcional, para debug
                userMessage.textContent = `Paciente registrado, pero no se pudo generar el token.`;
            }
        }

        userMessage.className = "text-green-600";
        userForm.reset();

    } catch (error) {
        console.error("❌ Error al registrar usuario:", error);
        userMessage.className = "text-red-600";
        userMessage.textContent = error.message.includes("MetaMask")
            ? error.message
            : "Error: La dirección ya podría estar registrada o la transacción fue rechazada.";
    }
});
