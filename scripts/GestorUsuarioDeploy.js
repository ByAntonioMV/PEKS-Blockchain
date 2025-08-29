// Este script está diseñado para usarse con un entorno de desarrollo como Hardhat.

// Importar la librería ethers desde Hardhat, que nos permite interactuar con la blockchain.
const hre = require("hardhat");

async function main() {
  // Mensaje para saber que el proceso ha comenzado.
  console.log("Preparando el despliegue del contrato...");

  // 1. Obtener el "Contrato Compilado" (Contract Factory) de nuestro "GestorUsuarios".
  const GestorUsuarios = await hre.ethers.getContractFactory("GestorUsuarios");
  
  console.log("Desplegando el contrato GestorUsuarios a la red...");

  // 2. Iniciar el despliegue del contrato.
  const gestorUsuarios = await GestorUsuarios.deploy();

  // 3. --- CORRECCIÓN AQUÍ ---
  // Esperar a que el despliegue se confirme en la blockchain.
  // ".deployed()" ya no existe, ahora se usa "waitForDeployment()".
  await gestorUsuarios.waitForDeployment();

  // 4. Obtener la dirección del contrato desplegado.
  const contractAddress = await gestorUsuarios.getAddress();

  // 5. Imprimir la dirección del contrato una vez desplegado.
  console.log(
    `✅ Contrato 'GestorUsuarios' desplegado exitosamente en la direccion: ${contractAddress}`
  );
}

// Patrón estándar recomendado para ejecutar funciones asíncronas y manejar errores correctamente.
main().catch((error) => {
  console.error("❌ Error durante el despliegue:");
  console.error(error);
  process.exitCode = 1;
});
