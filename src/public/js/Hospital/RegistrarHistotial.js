// --- CONFIGURACIÓN ---
const gestorReportesAddress = "0x36082FdADc2fB368b68eF7a7459f1C0Dde2521AF";
const gestorReportesABI = [
    "function registrarReporte(address _paciente, tuple(string nombre, string apellidos, uint edad, string sexo, string alergias, tuple(string abuelosPaternos, string abuelosMaternos, string padre, string madre, string hermanos) antecedentesFamiliares, tuple(string peso, string temperatura, string oxigenacion, string presion, string sintomas, string diagnosticoMedico, string medicamentos) consulta) memory _historial, bytes memory _palabrasClavePEKS)"
];

// --- ELEMENTOS DEL DOM ---
const modal = document.getElementById('historialModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const historialForm = document.getElementById('historialForm');
const modalMessage = document.getElementById('modalMessage');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');


// --- LÓGICA DEL MODAL (REGISTRO) ---
const showModal = () => modal.classList.remove('hidden');
const hideModal = () => modal.classList.add('hidden');

openModalBtn.addEventListener('click', showModal);
closeModalBtn.addEventListener('click', hideModal);
cancelModalBtn.addEventListener('click', hideModal);

historialForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    modalMessage.textContent = "Generando índice de búsqueda...";

    try {
        const formData = new FormData(historialForm);
        const data = Object.fromEntries(formData.entries());

        // --- 🔹 Generar par de claves ECDH para autenticación mutua ---
        const keyPairPaciente = await window.crypto.subtle.generateKey(
            { name: "ECDH", namedCurve: "P-256" },
            true,
            ["deriveKey", "deriveBits"]
        );
        const publicKeyPaciente = await window.crypto.subtle.exportKey("raw", keyPairPaciente.publicKey);
        document.getElementById('clavePublicaPaciente').value =
            btoa(String.fromCharCode(...new Uint8Array(publicKeyPaciente)));

        // --- 🔹 Generar JWT del paciente si existe ---
        const jwt = data.jwtPaciente || '';

        // --- 🔹 Simulación de intercambio de clave de sesión (AES-GCM) ---
        // Generamos clave de sesión local
        const claveSesion = crypto.getRandomValues(new Uint8Array(32));

        // Ejemplo: clave privada del paciente (simulada)
        const clavePrivadaPaciente = await window.crypto.subtle.exportKey("pkcs8", keyPairPaciente.privateKey);
        const encoder = new TextEncoder();
        const dataPrivada = encoder.encode(clavePrivadaPaciente);

        // Importar clave de sesión AES
        const cryptoKeySesion = await crypto.subtle.importKey(
            "raw",
            claveSesion,
            "AES-GCM",
            false,
            ["encrypt", "decrypt"]
        );

        // Generar IV y cifrar clave privada
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedPrivada = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            cryptoKeySesion,
            dataPrivada
        );

        // --- 🔹 Guardamos valores en campos ocultos separados ---
        document.getElementById('clavePrivadaCifrada').value =
            btoa(String.fromCharCode(...new Uint8Array(encryptedPrivada)));
        document.getElementById('ivSesion').value =
            btoa(String.fromCharCode(...iv));

        // --- 🔹 Generar índice PEKS en backend ---
        const peksResponse = await fetch('/api/ingresar-historial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ historialData: data })
        });
        const peksResult = await peksResponse.json();
        if (!peksResult.success) throw new Error(peksResult.message);

        const { indicePEKS } = peksResult.datosParaTransaccion;
        modalMessage.textContent = "Índice generado. Por favor, firma la transacción.";

        // --- 🔹 Construcción del historial adaptado al contrato ---
        const historial = {
            nombre: data.nombre || "",
            apellidos: data.apellidos || "",
            edad: parseInt(data.edad) || 0,
            sexo: data.sexo || "",
            alergias: data.alergias || "",
            antecedentesFamiliares: {
                abuelosPaternos: data.abuelosPaternos || "",
                abuelosMaternos: data.abuelosMaternos || "",
                padre: data.padre || "",
                madre: data.madre || "",
                hermanos: data.hermanos || ""
            },
            consulta: {
                peso: data.peso || "",
                temperatura: data.temperatura || "",
                oxigenacion: data.oxigenacion || "",
                presion: data.presion || "",
                sintomas: data.sintomas || "",
                diagnosticoMedico: data.diagnosticoMedico || "",
                medicamentos: data.medicamentos || ""
            }
        };

        // --- 🔹 Conexión con Metamask y contrato ---
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(gestorReportesAddress, gestorReportesABI, signer);

        // --- 🔹 Envío de la transacción a la blockchain ---
        const tx = await contract.registrarReporte(data.direccionPaciente, historial, indicePEKS);
        modalMessage.textContent = "Registrando en la blockchain...";
        await tx.wait();

        modalMessage.textContent = "¡Historial registrado exitosamente!";
        modalMessage.className = "text-green-600";
        historialForm.reset();
        setTimeout(() => modal.classList.add('hidden'), 2000);

    } catch (error) {
        console.error("Error en el registro:", error);
        modalMessage.textContent = `Error: ${error.message}`;
        modalMessage.className = "text-red-600";
    }
});


// --- LÓGICA DE BÚSQUEDA ---
const performSearch = async () => {
    const keyword = searchInput.value.trim().toLowerCase();
    if (!keyword) return;

    resultsContainer.innerHTML = '<p class="text-gray-500 col-span-full text-center">Buscando...</p>';

    try {
        const response = await fetch('/api/buscar-hospital', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword })
        });

        const data = await response.json();

        if (data.success) {
            if (data.resultados.length === 0) {
                resultsContainer.innerHTML = `
                    <p class="text-yellow-600 font-medium col-span-full text-center">
                        No se encontraron resultados.
                    </p>`;
            } else {
                resultsContainer.innerHTML = data.resultados.map(res => `
                    <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-3">
                        <div class="border-b pb-2">
                            <p class="text-sm text-gray-500">Reporte ID: ${res.id}</p>
                            <h3 class="text-xl font-bold text-peks-blue">
                                ${res.detalles.nombre || 'N/A'} ${res.detalles.apellidos || ''}
                            </h3>
                        </div>

                        <div>
                            <p><strong class="font-medium text-gray-600">Edad:</strong> ${res.detalles.edad || 'N/A'}</p>
                            <p><strong class="font-medium text-gray-600">Sexo:</strong> ${res.detalles.sexo || 'N/A'}</p>
                            <p><strong class="font-medium text-gray-600">Alergias:</strong> ${res.detalles.alergias || 'N/A'}</p>
                        </div>

                        <div class="pt-2">
                            <p class="font-medium text-gray-600">Diagnóstico Médico:</p>
                            <p class="text-gray-800 bg-gray-50 p-2 rounded-md">
                                ${res.detalles.consulta?.diagnosticoMedico || 'No especificado'}
                            </p>
                        </div>

                        <div class="pt-2">
                            <p class="font-medium text-gray-600">Receta / Medicamentos:</p>
                            <p class="text-gray-800 bg-gray-50 p-2 rounded-md">
                                ${res.detalles.consulta?.medicamentos || 'No especificado'}
                            </p>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        resultsContainer.innerHTML = `
            <p class="text-red-500 col-span-full text-center">
                ${error.message}
            </p>`;
    }
};

// --- EVENTOS ---
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});