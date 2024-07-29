const apiKey = 'db6bfa023b2c48b1991502ffbe9509b5'; // Replace with your Open Exchange Rates API key
const apiUrl = `https://openexchangerates.org/api/latest.json?app_id=${apiKey}`;
const currenciesUrl = `https://openexchangerates.org/api/currencies.json?app_id=${apiKey}`;

let exchangeRates = {
    USD: 1 / 201 // Default rate: 201 VRChat Credits = 1 USD
};
let currencies = {};

document.addEventListener('DOMContentLoaded', (event) => {
    // Fetch currency names
    fetch(currenciesUrl)
        .then(response => response.json())
        .then(data => {
            currencies = data;
            populateCurrencyDropdown();
        })
        .catch(error => console.error('Error fetching currency names:', error));

    // Fetch exchange rates
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            for (let currency in data.rates) {
                exchangeRates[currency] = data.rates[currency] / 201; // Adjust rates based on 201 VRChat Credits = 1 USD
            }
        })
        .catch(error => console.error('Error fetching exchange rates:', error));

    document.getElementById('credits').addEventListener('input', convertCredits);
    document.getElementById('currency').addEventListener('change', convertCredits);
});

function populateCurrencyDropdown() {
    const currencySelect = document.getElementById('currency');
    for (let currencyCode in currencies) {
        let option = document.createElement('option');
        option.value = currencyCode;
        option.textContent = `${currencyCode} - ${currencies[currencyCode]}`;
        currencySelect.appendChild(option);
    }
    currencySelect.value = 'USD'; // Set USD as the default currency
}

function convertCredits() {
    const credits = document.getElementById('credits').value;
    const currency = document.getElementById('currency').value;
    const rate = exchangeRates[currency];
    const result = credits * rate;

    document.getElementById('result').textContent = `${credits} VRChat Credits = ${result.toFixed(2)} ${currency}`;

    const creatorShare = 0.50 * result;
    const platformShare = 0.30 * result;
    const vrchatShare = 0.171 * result;
    const tiliaShare = 0.029 * result;

    document.getElementById('breakdown').innerHTML = `
        <p>Approximately:</p>
        <p>${creatorShare.toFixed(2)} ${currency} (50%) to you, the creators.</p>
        <p>${platformShare.toFixed(2)} ${currency} (30%) to Steam, Oculus, or Google, depending on the platform.</p>
        <p>${vrchatShare.toFixed(2)} ${currency} (17.1%) to VRChat.</p>
        <p>${tiliaShare.toFixed(2)} ${currency} (2.9%) to Tilia, our payment processor.</p>
    `;
}