const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const BELVO_ID = process.env.BELVO_ID || "4f318931-75cb-4569-a1c9-55aef78886f0";
const BELVO_PASSWORD = process.env.BELVO_PASSWORD || "o-fsvJ@kyrOtIUxLPkF8o-nFjW51kj_aXq_HvWV6RlSehchdBlW6iHSENC13IQKt";

console.log("BELVO_ID:", BELVO_ID);
console.log("BELVO_PASSWORD:", BELVO_PASSWORD ? "OK" : "FALTANDO");

app.post('/gerar-widget', async (req, res) => {
  const { external_id } = req.body;
  

  try {
    const accessRes = await axios.post('https://sandbox.belvo.com/api/token/', {
      id: BELVO_ID,
      password: BELVO_PASSWORD,
      scopes: 'read_institutions,write_links',
      fetch_resources: ['ACCOUNTS', 'TRANSACTIONS', 'OWNERS'],
      credentials_storage: 'store',
      stale_in: '300d'
    });

    const accessToken = accessRes.data.access;

    const widgetRes = await axios.post(
      'https://sandbox.belvo.com/api/widget-sessions/',
      {
        access_mode: 'single',
        external_id
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ widget_token: widgetRes.data.token });
} catch (err) {
  console.error("Erro completo:", {
    status: err?.response?.status,
    data: err?.response?.data,
    headers: err?.response?.headers,
    message: err.message
  });
  res.status(500).json({ error: 'Erro ao gerar token do widget' });
}
});

app.get('/', (req, res) => {
  res.send('Proxy da Belvo rodando ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
