import dotenv from 'dotenv';

dotenv.config();

const COINGECKO_API = process.env.COINGECKO_API;
const COINMARKETCAP_API = 'https://pro-api.coinmarketcap.com/v1';

/**
 * Fetch token data from CoinGecko
 * CoinGecko is free and doesn't require API key
 */
async function fetchFromCoinGecko() {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=crypgpt&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`,
      { timeout: 5000 }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const tokenData = data.crypgpt;

    if (!tokenData) {
      throw new Error('Token ID "crypgpt" not found on CoinGecko');
    }

    // Validate that we have actual data (not zeros)
    const price = tokenData.usd || 0;
    const marketCap = tokenData.usd_market_cap || 0;
    const volume24h = tokenData.usd_24h_vol || 0;

    // If all values are 0 or null, consider it as failed fetch
    if (price === 0 && marketCap === 0 && volume24h === 0) {
      throw new Error('CoinGecko returned zero values for all fields');
    }

    return {
      price,
      marketCap,
      volume24h,
      source: 'coingecko',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('CoinGecko fetch failed:', error.message);
    throw error;
  }
}

/**
 * Fetch token data from CoinMarketCap
 * Requires API key in COINMARKETCAP_API_KEY
 */
async function fetchFromCoinMarketCap() {
  const apiKey = process.env.COINMARKETCAP_API_KEY;

  if (!apiKey) {
    throw new Error('COINMARKETCAP_API_KEY not set');
  }

  try {
    const response = await fetch(
      `${COINMARKETCAP_API}/cryptocurrency/quotes/latest?symbol=CGPT&convert=USD`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey
        },
        timeout: 5000
      }
    );

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.CGPT) {
      throw new Error('Token symbol CGPT not found on CoinMarketCap');
    }

    const tokenData = data.data.CGPT;
    const quote = tokenData.quote?.USD;

    if (!quote) {
      throw new Error('USD quote not found in CoinMarketCap response');
    }

    const price = quote.price || 0;
    const marketCap = quote.market_cap || 0;
    const volume24h = quote.volume_24h || 0;

    // Validate data
    if (price === 0 && marketCap === 0 && volume24h === 0) {
      throw new Error('CoinMarketCap returned zero values for all fields');
    }

    return {
      price,
      marketCap,
      volume24h,
      source: 'coinmarketcap',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('CoinMarketCap fetch failed:', error.message);
    throw error;
  }
}

/**
 * Mock token data for development/demonstration
 * Generates realistic market data with slight variance
 */
function getMockTokenData() {
  // Base values - realistic for a mid-cap token
  const basePrice = 0.00523;
  const priceVariance = basePrice * 0.02; // 2% variance
  const randomPrice = basePrice + (Math.random() - 0.5) * priceVariance;

  const baseMarketCap = 52300000; // $52.3M
  const marketCapVariance = baseMarketCap * 0.03; // 3% variance
  const randomMarketCap = baseMarketCap + (Math.random() - 0.5) * marketCapVariance;

  const baseVolume = 1250000; // $1.25M 24h volume
  const volumeVariance = baseVolume * 0.15; // 15% variance (volume is more volatile)
  const randomVolume = baseVolume + (Math.random() - 0.5) * volumeVariance;

  return {
    price: Math.max(0.00001, randomPrice), // Ensure price is positive
    marketCap: Math.max(0, randomMarketCap),
    volume24h: Math.max(0, randomVolume),
    source: 'demo',
    lastUpdated: new Date().toISOString(),
    note: 'Demo data with realistic variance'
  };
}

/**
 * Fetch token data with fallback to mock data
 */
async function fetchTokenData() {
  const source = process.env.DATA_SOURCE || 'coingecko';

  try {
    if (source === 'coinmarketcap') {
      try {
        console.log('Attempting to fetch from CoinMarketCap...');
        const data = await fetchFromCoinMarketCap();
        console.log('✓ CoinMarketCap fetch successful');
        return data;
      } catch (error) {
        console.warn(`✗ CoinMarketCap failed: ${error.message}. Falling back to CoinGecko...`);
        try {
          const data = await fetchFromCoinGecko();
          console.log('✓ CoinGecko fetch successful');
          return data;
        } catch (geckoError) {
          console.warn(`✗ CoinGecko also failed: ${geckoError.message}. Using demo data...`);
          const mockData = getMockTokenData();
          console.log('ℹ Using demo market data for development');
          return mockData;
        }
      }
    } else {
      try {
        console.log('Attempting to fetch from CoinGecko...');
        const data = await fetchFromCoinGecko();
        console.log('✓ CoinGecko fetch successful');
        return data;
      } catch (error) {
        console.warn(`✗ CoinGecko failed: ${error.message}. Trying CoinMarketCap...`);
        try {
          const data = await fetchFromCoinMarketCap();
          console.log('✓ CoinMarketCap fetch successful');
          return data;
        } catch (marketCapError) {
          console.warn(`✗ CoinMarketCap also failed: ${marketCapError.message}. Using demo data...`);
          const mockData = getMockTokenData();
          console.log('ℹ Using demo market data for development');
          return mockData;
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error in fetchTokenData:', error.message);
    console.log('ℹ Falling back to demo market data');
    return getMockTokenData();
  }
}

export const realTimeDataService = {
  fetchTokenData,
  fetchFromCoinGecko,
  fetchFromCoinMarketCap
};
