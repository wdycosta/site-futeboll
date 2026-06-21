exports.handler = async () => {

  const resposta = await fetch(
    "https://api.football-data.org/v4/matches",
    {
      headers: {
        "X-Auth-Token": "bfde9a9257fc40aa89fa785d8ff219c8"
      }
    }
  );

  const dados = await resposta.json();

  return {
    statusCode: 200,
    body: JSON.stringify(dados)
  };

};