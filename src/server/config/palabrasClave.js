// src/server/config/palabrasClave.js

// Lista de palabras clave médicas, optimizada para búsquedas de términos individuales.
const palabrasClaveMedicas = [
    // Crónicas
    "diabetes",
    "hipertension",
    "cancer",
    "asma",
    "epoc",
    "artritis",
    "renal", // Más genérico que "insuficiencia renal"
    "hipotiroidismo",
    "hipertiroidismo",
    "colesterol",
    "migraña",
    "VIH",
    "osteoporosis",
    "fibromialgia",
    "lupus",

    // Agudas
    "apendicitis",
    "gripe",
    "influenza",
    "resfriado",
    "bronquitis",
    "neumonia",
    "gastroenteritis",
    "calculos", // Genérico para "cálculos renales"
    "infarto",
    "ACV",
    "fractura",
    "esguince",
    "alergia",
    "varicela",
    "dengue",
    "covid",
    "hernia",
    "anemia",

    // Infecciones y Síntomas (Más detallado)
    "infeccion", // Término general
    "urinaria",
    "cistitis",
    "garganta", // Término específico
    "faringitis",
    "amigdalitis",
    "estomago",
    "oido",
    "otitis",
    "piel",
    "celulitis",
    "respiratoria",
    "dental",
    "absceso",
    "ITS",
    "sifilis",
    "gonorrea",
    "conjuntivitis",
    "hepatitis",
    
    // Síntomas clave
    "irritacion",
    "enrojecimiento",
    "fiebre",
    "dolor",
    "inflamacion"
];

module.exports = palabrasClaveMedicas;
