const apiKey = 'db6bfa023b2c48b1991502ffbe9509b5'; // Replace with your Open Exchange Rates API key
const apiUrl = `https://openexchangerates.org/api/latest.json?app_id=${apiKey}`;
const currenciesUrl = `https://openexchangerates.org/api/currencies.json?app_id=${apiKey}`;

let exchangeRates = {
    USD: 1 / 120 // Default rate: 120 VRChat Credits = 1 USD
};
let currencies = {};
let subscriptionCount = 1;

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
                exchangeRates[currency] = data.rates[currency] / 120; // Adjust rates based on 120 VRChat Credits = 1 USD
            }
        })
        .catch(error => console.error('Error fetching exchange rates:', error));

    loadMonthlyValuesFromCookies();
    setDefaultConversionRate();

    document.getElementById('credits').addEventListener('input', convertCredits);
    document.getElementById('amount').addEventListener('input', convertAmount);
    document.getElementById('currency').addEventListener('change', convertCredits);
    document.getElementById('subscriptions-container').addEventListener('input', () => {
        calculateMonthly();
        saveMonthlyValuesToCookies();
    });
    document.getElementById('add-subscription').addEventListener('click', () => {
        addSubscription();
        saveMonthlyValuesToCookies();
    });

    document.getElementById('clear-cookies').addEventListener('click', clearCookies);

    // Initialize tab navigation
    initTabs();
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
        <p><strong>Revenue split:</strong></p>
        <p><strong>${creatorShare.toFixed(2)} ${currency}</strong> (50%) to you, the creators.</p>
        <p><strong>${platformShare.toFixed(2)} ${currency}</strong> (30%) to Steam, Oculus, or Google, depending on the platform.</p>
        <p><strong>${vrchatShare.toFixed(2)} ${currency}</strong> (17.1%) to VRChat.</p>
        <p><strong>${tiliaShare.toFixed(2)} ${currency}</strong> (2.9%) to Tilia, our payment processor.</p>
    `;

    // Show the result and breakdown
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('breakdown').classList.remove('hidden');
}

function convertAmount() {
    const amount = document.getElementById('amount').value;
    const currency = document.getElementById('currency').value;
    const rate = exchangeRates[currency];
    const result = amount / rate;

    document.getElementById('result').textContent = `${amount} ${currency} = ${result.toFixed(2)} VRChat Credits`;

    const creatorShare = 0.50 * amount;
    const platformShare = 0.30 * amount;
    const vrchatShare = 0.171 * amount;
    const tiliaShare = 0.029 * amount;

    document.getElementById('breakdown').innerHTML = `
        <p><strong>Revenue split:</strong></p>
        <p><strong>${creatorShare.toFixed(2)} ${currency}</strong> (50%) to you, the creators.</p>
        <p><strong>${platformShare.toFixed(2)} ${currency}</strong> (30%) to Steam, Oculus, or Google, depending on the platform.</p>
        <p><strong>${vrchatShare.toFixed(2)} ${currency}</strong> (17.1%) to VRChat.</p>
        <p><strong>${tiliaShare.toFixed(2)} ${currency}</strong> (2.9%) to Tilia, our payment processor.</p>
    `;

    // Show the result and breakdown
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('breakdown').classList.remove('hidden');
}

function setDefaultConversionRate() {
    const credits = 120;
    const currency = 'USD';
    const rate = exchangeRates[currency];
    const result = credits * rate;

    document.getElementById('result').textContent = `${credits} VRChat Credits = ${result.toFixed(2)} ${currency}`;

    const creatorShare = 0.50 * result;
    const platformShare = 0.30 * result;
    const vrchatShare = 0.171 * result;
    const tiliaShare = 0.029 * result;

    document.getElementById('breakdown').innerHTML = `
        <p><strong>Revenue split:</strong></p>
        <p><strong>${creatorShare.toFixed(2)} ${currency}</strong> (50%) to you, the creators.</p>
        <p><strong>${platformShare.toFixed(2)} ${currency}</strong> (30%) to Steam, Oculus, or Google, depending on the platform.</p>
        <p><strong>${vrchatShare.toFixed(2)} ${currency}</strong> (17.1%) to VRChat.</p>
        <p><strong>${tiliaShare.toFixed(2)} ${currency}</strong> (2.9%) to Tilia, our payment processor.</p>
    `;

    // Show the result and breakdown
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('breakdown').classList.remove('hidden');
}

function addSubscription() {
    subscriptionCount++;
    const container = document.getElementById('subscriptions-container');
    const newSubscription = document.createElement('div');
    newSubscription.classList.add('subscription');
    newSubscription.id = `subscription-${subscriptionCount}`;
    newSubscription.innerHTML = `
        <div class="input-group-row">
            <div class="input-group">
                <label for="credits-per-subscription-${subscriptionCount}">Credits per Subscription:</label>
                <input type="number" id="credits-per-subscription-${subscriptionCount}" class="credits-per-subscription" placeholder="Enter Credits">
            </div>
            <div class="input-group">
                <label for="num-subscriptions-${subscriptionCount}">Number of Subscriptions:</label>
                <input type="number" id="num-subscriptions-${subscriptionCount}" class="num-subscriptions" placeholder="Enter Number">
            </div>
            <button class="remove-subscription" onclick="removeSubscription(${subscriptionCount})">Remove</button>
        </div>
    `;
    container.appendChild(newSubscription);
}

function removeSubscription(id) {
    const subscription = document.getElementById(`subscription-${id}`);
    subscription.remove();
    calculateMonthly();
}

function calculateMonthly() {
    let totalEarnings = 0;
    let totalCreatorShare = 0;
    let totalPlatformShare = 0;
    let totalVrchatShare = 0;
    let totalTiliaShare = 0;

    for (let i = 1; i <= subscriptionCount; i++) {
        if (document.getElementById(`credits-per-subscription-${i}`) && document.getElementById(`num-subscriptions-${i}`)) {
            const credits = document.getElementById(`credits-per-subscription-${i}`).value;
            const numSubscriptions = document.getElementById(`num-subscriptions-${i}`).value;
            const earnings = (credits * numSubscriptions / 120);
            totalEarnings += earnings;

            totalCreatorShare += 0.50 * earnings;
            totalPlatformShare += 0.30 * earnings;
            totalVrchatShare += 0.171 * earnings;
            totalTiliaShare += 0.029 * earnings;
        }
    }

    document.getElementById('monthly-result').textContent = `Total Monthly Earnings: ${totalEarnings.toFixed(2)} USD`;

    document.getElementById('monthly-breakdown').innerHTML = `
        <p><strong>Revenue split:</strong></p>
        <p><strong>${totalCreatorShare.toFixed(2)} USD</strong> (50%) to you, the creators.</p>
        <p><strong>${totalPlatformShare.toFixed(2)} USD</strong> (30%) to Steam, Oculus, or Google, depending on the platform.</p>
        <p><strong>${totalVrchatShare.toFixed(2)} USD</strong> (17.1%) to VRChat.</p>
        <p><strong>${totalTiliaShare.toFixed(2)} USD</strong> (2.9%) to Tilia, our payment processor.</p>
    `;

    // Show the result and breakdown
    document.getElementById('monthly-result').classList.remove('hidden');
    document.getElementById('monthly-breakdown').classList.remove('hidden');
}

function saveMonthlyValuesToCookies() {
    const subscriptions = [];

    for (let i = 1; i <= subscriptionCount; i++) {
        if (document.getElementById(`credits-per-subscription-${i}`) && document.getElementById(`num-subscriptions-${i}`)) {
            const subscription = {
                credits: document.getElementById(`credits-per-subscription-${i}`).value,
                number: document.getElementById(`num-subscriptions-${i}`).value
            };
            subscriptions.push(subscription);
        }
    }

    document.cookie = `monthlyData=${JSON.stringify({ subscriptions })}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

function loadMonthlyValuesFromCookies() {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('monthlyData='));
    if (cookie) {
        const data = JSON.parse(cookie.split('=')[1]);

        data.subscriptions.forEach((subscription, index) => {
            if (index > 0) addSubscription();
            document.getElementById(`credits-per-subscription-${index + 1}`).value = subscription.credits;
            document.getElementById(`num-subscriptions-${index + 1}`).value = subscription.number;
        });

        calculateMonthly();
    }
}

function clearCookies() {
    document.cookie = 'monthlyData=; path=/; max-age=0';
    location.reload(); // Reload the page to reset the inputs and calculations
}

function initTabs() {
    const tabs = document.querySelectorAll('nav a');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', event => {
            event.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            document.querySelector(tab.getAttribute('href')).classList.add('active');
        });
    });

    // Set default tab
    document.querySelector('nav a').classList.add('active');
    document.querySelector('.tab-content').classList.add('active');
}
