require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Carga las variables del archivo .env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // URL de tu Ganache
      accounts: [process.env.GANACHE_PRIVATE_KEY] // Usa la clave privada del .env
    }
  }
};