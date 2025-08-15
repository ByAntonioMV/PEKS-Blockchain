// Este script está diseñado para usarse con un entorno de desarrollo como Hardhat.

// Importar la librería ethers desde Hardhat, que nos permite interactuar con la blockchain.
const hre = require("hardhat");

async function main() {
  // Mensaje para saber que el proceso ha comenzado.
  console.log("Preparando el despliegue del contrato...");

  // 1. Obtener el "Contrato Compilado" (Contract Factory) de nuestro "GestorUsuarios".
  // Un Contract Factory en ethers.js es un objeto que sabe cómo crear y desplegar
  // instancias de nuestro contrato inteligente.
  const GestorUsuarios = await hre.ethers.getContractFactory("GestorUsuarios");
  
  console.log("Desplegando el contrato GestorUsuarios a la red...");

  // 2. Iniciar el despliegue del contrato.
  // Esta línea crea y envía la transacción que pondrá el contrato en la blockchain.
  // No se le pasan argumentos al .deploy() porque nuestro constructor no los requiere.
  const gestorUsuarios = await GestorUsuarios.deploy();

  // 3. Esperar a que el despliegue se confirme en la blockchain.
  // Es fundamental esperar a que la transacción sea minada y confirmada.
  // La función deployed() devuelve una promesa que se resuelve cuando esto sucede.
  await gestorUsuarios.deployed();

  // 4. Imprimir la dirección del contrato una vez desplegado.
  // ¡Esta dirección es muy importante! Es la que usaremos en nuestra aplicación web
  // para saber dónde se encuentra y cómo interactuar con nuestro contrato.
  console.log(
    `✅ Contrato 'GestorUsuarios' desplegado exitosamente en la direccion: ${gestorUsuarios.address}`
  );
}

// Patrón estándar recomendado para ejecutar funciones asíncronas y manejar errores correctamente.
// Si algo sale mal durante el despliegue, veremos el error en la consola.
main().catch((error) => {
  console.error("Error durante el despliegue:");
  console.error(error);
  process.exitCode = 1;
});
