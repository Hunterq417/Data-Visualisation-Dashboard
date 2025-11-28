const fetch = require('node-fetch');

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Fetch intraday stock data for a given symbol
 * @param {string} symbol - The stock symbol (e.g., 'IBM')
 * @param {string} interval - Time interval (e.g., '5min')
 * @returns {Promise<Object>} - The JSON response from Alpha Vantage
 */
const getIntradayData = async (symbol = 'IBM', interval = '5min') => {
    if (!API_KEY) {
        throw new Error('Alpha Vantage API key is missing');
    }

    const url = `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': 'request' }
        });

        if (!response.ok) {
            throw new Error(`Alpha Vantage API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch stock data:', error.message);
        throw error;
    }
};

module.exports = {
    getIntradayData,
};
