// --- CONFIGURACIÓN ---
// ¡IMPORTANTE! Esta debe ser la dirección de tu contrato GESTOR DE REPORTES (el que usa PEKS)
const gestorReportesAddress = "0x75235f9291eb5758457252A34d1Bb9564A318daB";
const gestorReportesABI = [
    // El ABI debe coincidir con el contrato de PEKS
    "function registrarReporte(address _paciente, string memory _reporteCifradoHash, bytes memory _palabrasClavePEKS)"
];

const modal = document.getElementById('historialModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const historialForm = document.getElementById('historialForm');
const modalMessage = document.getElementById('modalMessage');

openModalBtn.addEventListener('click', () => modal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

historialForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    modalMessage.textContent = "Procesando datos...";
    modalMessage.className = "text-gray-600";

    try {
        // 1. Recolectar datos del formulario
        const formData = new FormData(historialForm);
        const historialData = Object.fromEntries(formData.entries());

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const hospitalAddress = await signer.getAddress();

        // 2. Enviar al backend para simular cifrado, IPFS y PEKS
        const response = await fetch('/api/ingresar-historial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ historialData, hospitalAddress })
        });
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        modalMessage.textContent = "Datos procesados. Por favor, firma la transacción en MetaMask.";

        // 3. Usar los datos procesados para llamar al contrato desde el frontend
        const contract = new ethers.Contract(gestorReportesAddress, gestorReportesABI, signer);
        const { paciente, ipfsHash, indicePEKS } = result.datosParaTransaccion;

        const tx = await contract.registrarReporte(paciente, ipfsHash, indicePEKS);

        modalMessage.textContent = "Registrando en la blockchain... por favor espera.";
        await tx.wait();

        modalMessage.textContent = "¡Historial registrado exitosamente en la blockchain!";
        modalMessage.className = "text-green-600";
        historialForm.reset();
        setTimeout(() => modal.classList.add('hidden'), 3000);

    } catch (error) {
        console.error("Error en el registro del historial:", error);
        modalMessage.textContent = `Error: ${error.message}`;
        modalMessage.className = "text-red-600";
    }
});