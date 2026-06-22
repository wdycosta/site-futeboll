const COMPETITION_CODES = new Set([
  "BSA",
  "BSB",
  "CBR",
  "CLI",
  "CSA",
  "LIB",
  "SUD",
]);

const COMPETITION_TERMS = [
  "brasileiro",
  "brasileirao",
  "copa do brasil",
  "conmebol",
  "libertadores",
  "sudamericana",
  "sul-americana",
  "recopa sudamericana",
];

const FOOTBALL_DATA_URL = "https://api.football-data.org/v4/matches";
const FOOTBALL_DATA_TOKEN =
  process.env.FOOTBALL_DATA_TOKEN || "bfde9a9257fc40aa89fa785d8ff219c8";
const SUCCESS_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=60",
};
const ERROR_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isBrazilianOrSouthAmericanMatch(match) {
  const competition = match.competition || {};
  const competitionCode = String(competition.code || "")
    .trim()
    .toUpperCase();
  const competitionName = normalizeText(competition.name);

  return (
    COMPETITION_CODES.has(competitionCode) ||
    COMPETITION_TERMS.some((term) => competitionName.includes(term))
  );
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

exports.handler = async (event = {}) => {
  if (event.httpMethod && event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: {
        ...ERROR_HEADERS,
        Allow: "GET",
      },
      body: JSON.stringify({
        message: "Metodo nao permitido.",
        matches: [],
      }),
    };
  }

  try {
    const resposta = await fetch(FOOTBALL_DATA_URL, {
      headers: {
        "X-Auth-Token": FOOTBALL_DATA_TOKEN,
      },
    });

    const dados = await readJson(resposta);

    if (!resposta.ok) {
      return {
        statusCode: 502,
        headers: ERROR_HEADERS,
        body: JSON.stringify({
          message:
            dados.message ||
            "Nao foi possivel buscar os jogos no Football Data.",
          matches: [],
        }),
      };
    }

    const matches = Array.isArray(dados.matches)
      ? dados.matches.filter(isBrazilianOrSouthAmericanMatch)
      : [];

    return {
      statusCode: 200,
      headers: SUCCESS_HEADERS,
      body: JSON.stringify({
        ...dados,
        count: matches.length,
        matches,
      }),
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: ERROR_HEADERS,
      body: JSON.stringify({
        message: error.message || "Erro ao carregar os jogos.",
        matches: [],
      }),
    };
  }

};
