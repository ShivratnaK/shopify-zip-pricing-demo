const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json());
const ZIP_PRICE_RULES = {
  '75028': 149900, 
  '10001': 169900, 
  '90210': 179900,
};

const DEFAULT_PRICE = 159900; 

function formatUSD(cents) {
  return (cents / 100).toFixed(2);
}

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'zip-price-backend' });
});

app.post('/api/price', (req, res) => {
  const { zip, productId, variantId } = req.body || {};

  if (!zip || typeof zip !== 'string') {
    return res.status(400).json({ error: 'A valid "zip" string is required.' });
  }

  const cleanZip = zip.trim().slice(0, 5);
  const priceCents = ZIP_PRICE_RULES[cleanZip] ?? DEFAULT_PRICE;
  const matched = ZIP_PRICE_RULES.hasOwnProperty(cleanZip);

  return res.json({
    zip: cleanZip,
    price: formatUSD(priceCents),
    priceCents,
    currency: 'USD',
    matchedRule: matched,
    productId: productId || null,
    variantId: variantId || null,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ZIP pricing backend running on port ${PORT}`);
});
