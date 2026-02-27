import dotenv from 'dotenv';

dotenv.config();

const CMC_BASE_URL = process.env.COINMARKETCAP_API; 
const CMC_API_KEY = process.env.CMC_API_KEY;

// 🔒 Locked correct CoinMarketCap ID
const TOKEN_ID = 38439;

/**
 * Fetch token data from CoinMarketCap (Production Ready)
 */
async function fetchFromCoinMarketCap() {
  if (!CMC_BASE_URL) {
    throw new Error('COINMARKETCAP_API not set in .env');
  }

  if (!CMC_API_KEY) {
    throw new Error('CMC_API_KEY not set in .env');
  }

  const url = `${CMC_BASE_URL}/cryptocurrency/quotes/latest?id=${TOKEN_ID}&convert=USD`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CoinMarketCap API error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();

    const token = data?.data?.[TOKEN_ID];
    if (!token) {
      throw new Error('Token data not found in CoinMarketCap response');
    }

    const quote = token?.quote?.USD;
    if (!quote) {
      throw new Error('USD quote not found in CoinMarketCap response');
    }

    // Match CMC portal display logic
    const marketCap =
    quote.self_reported_market_cap ??
    (token.self_reported_circulating_supply
    ? quote.price * token.self_reported_circulating_supply
    : 0);

    return {
      price: quote.price ?? 0,
      marketCap,
      volume24h: quote.volume_24h ?? 0,
      source: 'coinmarketcap',
      lastUpdated: new Date().toISOString()
      
    };

  } catch (error) {
    console.error('CoinMarketCap fetch failed:', error.message);
    throw error;
  }
}

/**
 * Public function used by your route
 */
async function fetchTokenData() {
  const data = await fetchFromCoinMarketCap();
  console.log(JSON.stringify(data, null, 2));
  return data;
}

export const realTimeDataService = {
  fetchTokenData,
  fetchFromCoinMarketCap
};