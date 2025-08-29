// Este script está diseñado para usarse con un entorno de desarrollo como Hardhat.
const hre = require("hardhat");

async function main() {
  // 1. Obtener la dirección del contrato GestorUsuarios desde el archivo .env
  // Es crucial que este contrato ya esté desplegado y su dirección esté en el .env
  const gestorUsuariosAddress = process.env.GESTOR_USUARIOS_ADDRESS;

  if (!gestorUsuariosAddress) {
    console.error("❌ Error: La dirección de GESTOR_USUARIOS_ADDRESS no se encontró en el archivo .env");
    process.exit(1);
  }

  console.log(`Usando la dirección de GestorUsuarios: ${gestorUsuariosAddress}`);
  console.log("Preparando el despliegue del contrato GestorReportesMedicos...");

  // 2. Obtener el "Contrato Compilado" (Contract Factory) de "GestorReportesMedicos".
  const GestorReportesMedicos = await hre.ethers.getContractFactory("GestorReportesMedicos");
  
  console.log("Desplegando el contrato GestorReportesMedicos...");

  // 3. Iniciar el despliegue del contrato, pasándole la dirección del GestorUsuarios
  // como argumento al constructor.
  const gestorReportes = await GestorReportesMedicos.deploy(gestorUsuariosAddress);

  // 4. Esperar a que el despliegue se confirme en la blockchain.
  await gestorReportes.waitForDeployment();

  // 5. Obtener la dirección del nuevo contrato desplegado.
  const contractAddress = await gestorReportes.getAddress();

  // 6. Imprimir la dirección del nuevo contrato.
  // Deberás añadir esta nueva dirección a tu archivo .env como GESTOR_REPORTES_ADDRESS.
  console.log(
    `✅ Contrato 'GestorReportesMedicos' desplegado exitosamente en la direccion: ${contractAddress}`
  );
}

// Patrón estándar para manejar errores.
main().catch((error) => {
  console.error("❌ Error durante el despliegue:");
  console.error(error);
  process.exitCode = 1;
});
