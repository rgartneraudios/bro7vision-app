// /data/jaguar/calcularSigno.js
// Zodiaco SIDERAL — 13 signos — fechas reales de las constelaciones
// Jaguar estudió las estrellas reales desde la selva. Ofiuco existe. Siempre existió.

const SIGNOS_SIDERALES = [
  { signo: "aries",       inicio: { mes: 4,  dia: 19 }, fin: { mes: 5,  dia: 13 } },
  { signo: "tauro",       inicio: { mes: 5,  dia: 14 }, fin: { mes: 6,  dia: 19 } },
  { signo: "geminis",     inicio: { mes: 6,  dia: 20 }, fin: { mes: 7,  dia: 20 } },
  { signo: "cancer",      inicio: { mes: 7,  dia: 21 }, fin: { mes: 8,  dia: 9  } },
  { signo: "leo",         inicio: { mes: 8,  dia: 10 }, fin: { mes: 9,  dia: 15 } },
  { signo: "virgo",       inicio: { mes: 9,  dia: 16 }, fin: { mes: 10, dia: 30 } },
  { signo: "libra",       inicio: { mes: 10, dia: 31 }, fin: { mes: 11, dia: 22 } },
  { signo: "escorpio",    inicio: { mes: 11, dia: 23 }, fin: { mes: 11, dia: 29 } },
  { signo: "ofiuco",      inicio: { mes: 11, dia: 30 }, fin: { mes: 12, dia: 17 } },
  { signo: "sagitario",   inicio: { mes: 12, dia: 18 }, fin: { mes: 1,  dia: 18 } },
  { signo: "capricornio", inicio: { mes: 1,  dia: 19 }, fin: { mes: 2,  dia: 15 } },
  { signo: "acuario",     inicio: { mes: 2,  dia: 16 }, fin: { mes: 3,  dia: 11 } },
  { signo: "piscis",      inicio: { mes: 3,  dia: 12 }, fin: { mes: 4,  dia: 18 } },
];

/**
 * Convierte mes y día a número comparable tipo MMDD
 */
const toMMDD = (mes, dia) => mes * 100 + dia;

/**
 * calcularSignoSideral
 * @param {string} fechaNacimiento — formato "YYYY-MM-DD" o "DD/MM/YYYY"
 * @returns {string} — nombre del signo en minúsculas (ej: "aries", "ofiuco") o "desconocido"
 */
export const calcularSignoSideral = (fechaNacimiento) => {
  try {
    let mes, dia;

    if (fechaNacimiento.includes("-")) {
      // Formato YYYY-MM-DD
      const partes = fechaNacimiento.split("-");
      mes = parseInt(partes[1], 10);
      dia = parseInt(partes[2], 10);
    } else if (fechaNacimiento.includes("/")) {
      // Formato DD/MM/YYYY
      const partes = fechaNacimiento.split("/");
      dia = parseInt(partes[0], 10);
      mes = parseInt(partes[1], 10);
    } else {
      return "desconocido";
    }

    if (!mes || !dia || mes < 1 || mes > 12 || dia < 1 || dia > 31) {
      return "desconocido";
    }

    const fechaMMDD = toMMDD(mes, dia);

    for (const { signo, inicio, fin } of SIGNOS_SIDERALES) {
      const inicioMMDD = toMMDD(inicio.mes, inicio.dia);
      const finMMDD    = toMMDD(fin.mes,    fin.dia);

      if (inicioMMDD <= finMMDD) {
        // Rango normal (no cruza año)
        if (fechaMMDD >= inicioMMDD && fechaMMDD <= finMMDD) return signo;
      } else {
        // Rango que cruza año nuevo (sagitario: dic 18 → ene 18)
        if (fechaMMDD >= inicioMMDD || fechaMMDD <= finMMDD) return signo;
      }
    }

    return "desconocido";

  } catch {
    return "desconocido";
  }
};

export default calcularSignoSideral;
