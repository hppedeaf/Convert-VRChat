// VRChat Credit Converter - Mobile Optimized 2025
// Enhanced with performance optimizations and mobile-first features

const apiKey = 'db6bfa023b2c48b1991502ffbe9509b5';
const apiUrl = `https://openexchangerates.org/api/latest.json?app_id=${apiKey}`;
const currenciesUrl = `https://openexchangerates.org/api/currencies.json?app_id=${apiKey}`;

let exchangeRates = {
    USD: 1 / 120 // Default rate: 120 VRChat Credits = 1 USD
};
let currencies = {};
let subscriptionCount = 1;

// Mobile Performance: Optimize for touch devices
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Mobile-optimized debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, isMobile ? wait * 1.5 : wait); // Longer wait on mobile
    };
}

// Enhanced error handling for mobile users
function handleFetchError(error, context) {
    console.error(`Error ${context}:`, error);
    // Show user-friendly error message optimized for mobile
    showErrorMessage(`Unable to load ${context}. Using default rates.`);
}

// Mobile-optimized error message display
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background: #ff6b6b; 
        color: white; 
        padding: ${isMobile ? '1.25em' : '1em'}; 
        border-radius: 8px; 
        margin: 1em 0;
        font-size: ${isMobile ? '1em' : '0.9em'};
        touch-action: manipulation;
    `;
    
    const converter = document.querySelector('.converter');
    if (converter) {
        converter.insertBefore(errorDiv, converter.firstChild);
        setTimeout(() => errorDiv.remove(), isMobile ? 7000 : 5000); // Longer display on mobile
    }
}

// Mobile Performance: Track user interactions
function trackInteraction(action, details = {}) {
    // Google Analytics 4 tracking with mobile context
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: 'VRChat_Converter',
            event_label: details.label || '',
            value: details.value || 0,
            currency: details.currency || 'USD'
        });
    }
    
    // Optional: Custom analytics tracking
    console.log(`User action: ${action}`, details);
}

document.addEventListener('DOMContentLoaded', (event) => {
    // GPU and Performance Detection
    detectGPUAcceleration();
    monitorPerformance();
    
    // Initialize Theme System
    initializeTheme();
    
    // SEO: Track page load
    trackInteraction('page_load', { label: 'converter_ready' });
    
    // Performance: Use Promise.allSettled for parallel API requests
    Promise.allSettled([
        fetch(currenciesUrl).then(response => response.json()),
        fetch(apiUrl).then(response => response.json())
    ]).then(results => {
        // Handle currency names
        if (results[0].status === 'fulfilled') {
            currencies = results[0].value;
            populateCurrencyDropdown();
        } else {
            handleFetchError(results[0].reason, 'fetching currency names');
        }

        // Handle exchange rates
        if (results[1].status === 'fulfilled') {
            const data = results[1].value;
            for (let currency in data.rates) {
                exchangeRates[currency] = data.rates[currency] / 120;
            }
            trackInteraction('api_success', { label: 'exchange_rates_loaded' });
        } else {
            handleFetchError(results[1].reason, 'fetching exchange rates');
        }
    });

    // Initialize components
    loadMonthlyValuesFromCookies();
    setDefaultConversionRate();
    initializePreloadedValues();
    
    // SEO: Debounced event listeners for better performance
    const debouncedConvertCredits = debounce(convertCredits, 300);
    const debouncedConvertAmount = debounce(convertAmount, 300);
    const debouncedCalculateMonthly = debounce(() => {
        calculateMonthly();
        saveMonthlyValuesToCookies();
    }, 500);

    // Mobile-optimized event listeners
    const creditsInput = document.getElementById('credits');
    const amountInput = document.getElementById('amount');
    
    // Add mobile-specific event handling
    if (isTouch) {
        // Better touch handling for mobile
        creditsInput.addEventListener('input', debouncedConvertCredits);
        creditsInput.addEventListener('blur', convertCredits); // Ensure calculation on blur
        
        amountInput.addEventListener('input', debouncedConvertAmount);
        amountInput.addEventListener('blur', convertAmount); // Ensure calculation on blur
    } else {
        creditsInput.addEventListener('input', debouncedConvertCredits);
        amountInput.addEventListener('input', debouncedConvertAmount);
    }
    
    document.getElementById('currency').addEventListener('change', (e) => {
        convertCredits();
        trackInteraction('currency_change', { label: e.target.value, mobile: isMobile });
    });
    document.getElementById('subscriptions-container').addEventListener('input', debouncedCalculateMonthly);
    document.getElementById('add-subscription').addEventListener('click', () => {
        addSubscription();
        saveMonthlyValuesToCookies();
        trackInteraction('add_subscription', { value: subscriptionCount, mobile: isMobile });
    });

    document.getElementById('clear-cookies').addEventListener('click', clearCookies);

    // Initialize tab navigation
    initTabs();
    
    // SEO: Initialize structured data updates
    updateStructuredData();
});

// SEO: Initialize with popular conversion examples
function initializePreloadedValues() {
    // Pre-populate with common search queries
    const urlParams = new URLSearchParams(window.location.search);
    const credits = urlParams.get('credits');
    const currency = urlParams.get('currency');
    
    if (credits && !isNaN(credits)) {
        document.getElementById('credits').value = credits;
        if (currency && currencies[currency.toUpperCase()]) {
            document.getElementById('currency').value = currency.toUpperCase();
        }
        setTimeout(convertCredits, 500); // Wait for rates to load
    }
}

function populateCurrencyDropdown() {
    const currencySelect = document.getElementById('currency');
    const fragment = document.createDocumentFragment();
    
    // SEO: Popular currencies first (matching search intent)
    const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'KRW'];
    const otherCurrencies = [];
    
    for (let currencyCode in currencies) {
        if (!popularCurrencies.includes(currencyCode)) {
            otherCurrencies.push(currencyCode);
        }
    }
    
    // Add popular currencies with enhanced descriptions
    popularCurrencies.forEach(currencyCode => {
        if (currencies[currencyCode]) {
            const option = document.createElement('option');
            option.value = currencyCode;
            option.textContent = `${currencyCode} - ${currencies[currencyCode]}`;
            if (currencyCode === 'USD') option.textContent += ' (Default)';
            fragment.appendChild(option);
        }
    });
    
    // Add separator for UX
    if (otherCurrencies.length > 0) {
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '──── Other Currencies ────';
        fragment.appendChild(separator);
    }
    
    // Add other currencies
    otherCurrencies.sort().forEach(currencyCode => {
        const option = document.createElement('option');
        option.value = currencyCode;
        option.textContent = `${currencyCode} - ${currencies[currencyCode]}`;
        fragment.appendChild(option);
    });
    
    currencySelect.appendChild(fragment);
    currencySelect.value = 'USD';
}

function convertCredits() {
    const credits = parseFloat(document.getElementById('credits').value);
    const currency = document.getElementById('currency').value;
    
    if (!credits || credits <= 0) {
        document.getElementById('result').classList.add('hidden');
        document.getElementById('breakdown').classList.add('hidden');
        return;
    }
    
    const rate = exchangeRates[currency] || exchangeRates['USD'];
    const result = credits * rate;

    // Clear amount field to avoid confusion
    document.getElementById('amount').value = '';

    // SEO: Rich, descriptive result text
    document.getElementById('result').textContent = 
        `${credits.toLocaleString()} VRChat Credits = ${result.toLocaleString('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    updateBreakdown(result, currency);
    showResults();
    
    // SEO: Track conversions for analytics
    trackInteraction('convert_credits', {
        label: `${credits}_VRC_to_${currency}`,
        value: result,
        currency: currency
    });
    
    // SEO: Update page title with conversion result
    updatePageTitle(credits, result, currency);
    
    // SEO: Update URL for sharing (without page reload)
    updateURL({ credits, currency });
}

function convertAmount() {
    const amount = parseFloat(document.getElementById('amount').value);
    const currency = document.getElementById('currency').value;
    
    if (!amount || amount <= 0) {
        document.getElementById('result').classList.add('hidden');
        document.getElementById('breakdown').classList.add('hidden');
        return;
    }
    
    const rate = exchangeRates[currency] || exchangeRates['USD'];
    const result = amount / rate;

    // Clear credits field to avoid confusion
    document.getElementById('credits').value = '';

    document.getElementById('result').textContent = 
        `${amount.toLocaleString('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })} = ${Math.round(result).toLocaleString()} VRChat Credits`;

    updateBreakdown(amount, currency, true);
    showResults();
    
    // SEO: Track reverse conversions
    trackInteraction('convert_amount', {
        label: `${amount}_${currency}_to_VRC`,
        value: amount,
        currency: currency
    });
}

function updateBreakdown(amount, currency, isFromCurrency = false) {
    const creatorShare = 0.50 * amount;
    const platformShare = 0.30 * amount;
    const vrchatShare = 0.171 * amount;
    const tiliaShare = 0.029 * amount;

    const formatCurrency = (value) => value.toLocaleString('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // SEO: Rich, semantic breakdown content
    document.getElementById('breakdown').innerHTML = `
        <h3>Revenue Breakdown ${isFromCurrency ? '(if you earned this amount)' : ''}</h3>
        <div class="breakdown-list" role="list">
            <div class="breakdown-item creator" role="listitem">
                <span class="amount">${formatCurrency(creatorShare)}</span>
                <span class="percentage">(50%)</span>
                <span class="description">goes to content creators</span>
            </div>
            <div class="breakdown-item platform" role="listitem">
                <span class="amount">${formatCurrency(platformShare)}</span>
                <span class="percentage">(30%)</span>
                <span class="description">to platform stores (Steam, Oculus, etc.)</span>
            </div>
            <div class="breakdown-item vrchat" role="listitem">
                <span class="amount">${formatCurrency(vrchatShare)}</span>
                <span class="percentage">(17.1%)</span>
                <span class="description">to VRChat</span>
            </div>
            <div class="breakdown-item tilia" role="listitem">
                <span class="amount">${formatCurrency(tiliaShare)}</span>
                <span class="percentage">(2.9%)</span>
                <span class="description">to Tilia (payment processor)</span>
            </div>
        </div>
    `;
}

function showResults() {
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('breakdown').classList.remove('hidden');
}

// SEO: Update page title with current conversion
function updatePageTitle(credits, result, currency) {
    const newTitle = `${credits} VRC = ${result.toLocaleString('en-US', {
        style: 'currency',
        currency: currency
    })} | VRChat Credit Converter`;
    document.title = newTitle;
}

// SEO: Update URL for better sharing and bookmarking
function updateURL(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.replaceState({}, '', url);
}

// SEO: Update structured data with current conversion
function updateStructuredData() {
    const script = document.querySelector('script[type="application/ld+json"]');
    if (script) {
        try {
            const data = JSON.parse(script.textContent);
            data.dateModified = new Date().toISOString();
            script.textContent = JSON.stringify(data);
        } catch (e) {
            console.log('Could not update structured data');
        }
    }
}

function setDefaultConversionRate() {
    const credits = 120;
    const currency = 'USD';
    const rate = exchangeRates[currency] || (1 / 120);
    const result = credits * rate;

    document.getElementById('result').textContent = 
        `${credits} VRChat Credits = ${result.toLocaleString('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    updateBreakdown(result, currency);
    showResults();
}

function addSubscription() {
    subscriptionCount++;
    const container = document.getElementById('subscriptions-container');
    const newSubscription = document.createElement('div');
    newSubscription.classList.add('subscription');
    newSubscription.id = 'subscription-' + subscriptionCount;
    newSubscription.innerHTML = 
        '<div class="input-group-row">' +
            '<div class="input-group">' +
                '<label for="credits-per-subscription-' + subscriptionCount + '">Credits per Subscription:</label>' +
                '<input type="number" id="credits-per-subscription-' + subscriptionCount + '" class="credits-per-subscription" placeholder="Enter Credits" min="0" step="1">' +
            '</div>' +
            '<div class="input-group">' +
                '<label for="num-subscriptions-' + subscriptionCount + '">Number of Subscriptions:</label>' +
                '<input type="number" id="num-subscriptions-' + subscriptionCount + '" class="num-subscriptions" placeholder="Enter Number" min="0" step="1">' +
            '</div>' +
            '<button class="remove-subscription" onclick="removeSubscription(' + subscriptionCount + ')" aria-label="Remove this subscription tier">Remove</button>' +
        '</div>';
    container.appendChild(newSubscription);
}

function removeSubscription(id) {
    const subscription = document.getElementById('subscription-' + id);
    subscription.remove();
    calculateMonthly();
    trackInteraction('remove_subscription', { value: id });
}

function calculateMonthly() {
    let totalEarnings = 0;
    let totalCredits = 0;

    for (let i = 1; i <= subscriptionCount; i++) {
        const creditsInput = document.getElementById('credits-per-subscription-' + i);
        const numSubsInput = document.getElementById('num-subscriptions-' + i);
        
        if (creditsInput && numSubsInput) {
            const credits = parseFloat(creditsInput.value) || 0;
            const numSubscriptions = parseFloat(numSubsInput.value) || 0;
            
            if (credits > 0 && numSubscriptions > 0) {
                const monthlyCredits = credits * numSubscriptions;
                const monthlyEarnings = monthlyCredits * (exchangeRates['USD'] || (1/120));
                
                totalCredits += monthlyCredits;
                totalEarnings += monthlyEarnings;
            }
        }
    }

    if (totalEarnings > 0) {
        // SEO: Rich result text
        document.getElementById('monthly-result').textContent = 
            'Total Monthly Earnings: ' + totalEarnings.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            }) + ' (' + totalCredits.toLocaleString() + ' VRC Credits)';

        const creatorShare = 0.50 * totalEarnings;
        const platformShare = 0.30 * totalEarnings;
        const vrchatShare = 0.171 * totalEarnings;
        const tiliaShare = 0.029 * totalEarnings;

        document.getElementById('monthly-breakdown').innerHTML = 
            '<h3>Monthly Revenue Breakdown</h3>' +
            '<p><strong>' + creatorShare.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) + '</strong> (50%) to you, the creators.</p>' +
            '<p><strong>' + platformShare.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) + '</strong> (30%) to platform stores.</p>' +
            '<p><strong>' + vrchatShare.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) + '</strong> (17.1%) to VRChat.</p>' +
            '<p><strong>' + tiliaShare.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) + '</strong> (2.9%) to Tilia.</p>';
        
        document.getElementById('monthly-result').classList.remove('hidden');
        document.getElementById('monthly-breakdown').classList.remove('hidden');
        
        // SEO: Track monthly calculations
        trackInteraction('monthly_calculation', {
            label: 'earnings_calculated',
            value: totalEarnings,
            currency: 'USD'
        });
    } else {
        document.getElementById('monthly-result').classList.add('hidden');
        document.getElementById('monthly-breakdown').classList.add('hidden');
    }
}

function saveMonthlyValuesToCookies() {
    const monthlyData = {};
    for (let i = 1; i <= subscriptionCount; i++) {
        const creditsInput = document.getElementById('credits-per-subscription-' + i);
        const numSubsInput = document.getElementById('num-subscriptions-' + i);
        
        if (creditsInput && numSubsInput) {
            monthlyData[i] = {
                credits: creditsInput.value,
                subscriptions: numSubsInput.value
            };
        }
    }
    localStorage.setItem('vrchat-monthly-data', JSON.stringify(monthlyData));
    localStorage.setItem('vrchat-subscription-count', subscriptionCount.toString());
}

function loadMonthlyValuesFromCookies() {
    try {
        const savedData = localStorage.getItem('vrchat-monthly-data');
        const savedCount = localStorage.getItem('vrchat-subscription-count');
        
        if (savedData && savedCount) {
            const monthlyData = JSON.parse(savedData);
            subscriptionCount = parseInt(savedCount);
            
            const container = document.getElementById('subscriptions-container');
            for (let i = 2; i <= subscriptionCount; i++) {
                if (!document.getElementById('subscription-' + i)) {
                    addSubscription();
                    subscriptionCount--;
                }
            }
            
            for (let i in monthlyData) {
                const creditsInput = document.getElementById('credits-per-subscription-' + i);
                const numSubsInput = document.getElementById('num-subscriptions-' + i);
                
                if (creditsInput && numSubsInput) {
                    creditsInput.value = monthlyData[i].credits;
                    numSubsInput.value = monthlyData[i].subscriptions;
                }
            }
            
            calculateMonthly();
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function clearCookies() {
    localStorage.removeItem('vrchat-monthly-data');
    localStorage.removeItem('vrchat-subscription-count');
    
    const inputs = document.querySelectorAll('.credits-per-subscription, .num-subscriptions');
    inputs.forEach(input => input.value = '');
    
    const subscriptions = document.querySelectorAll('.subscription');
    subscriptions.forEach((sub, index) => {
        if (index > 0) sub.remove();
    });
    
    subscriptionCount = 1;
    calculateMonthly();
    
    // SEO: Track data clearing
    trackInteraction('clear_data', { label: 'user_cleared_data' });
    
    alert('All data cleared successfully!');
}

// SEO: Enhanced tab navigation with analytics
function initTabs() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.tab-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // SEO: Track section views
                trackInteraction('section_view', { label: targetId });
            }
            
            history.pushState(null, null, '#' + targetId);
        });
    });
    
    // Handle direct links and back button
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(hash).classList.add('active');
        trackInteraction('direct_link', { label: hash });
    }
}

// SEO: Add keyboard shortcuts for power users
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                document.querySelector('a[href="#converter"]').click();
                break;
            case '2':
                e.preventDefault();
                document.querySelector('a[href="#monthly"]').click();
                break;
            case '3':
                e.preventDefault();
                document.querySelector('a[href="#faq"]').click();
                break;
        }
    }
});

// SEO: Performance monitoring
window.addEventListener('load', () => {
    // Track Core Web Vitals for SEO
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'measure') {
                    trackInteraction('performance', {
                        label: entry.name,
                        value: Math.round(entry.duration)
                    });
                }
            });
        });
        observer.observe({ entryTypes: ['measure'] });
    }
});

// GPU Detection and Performance Optimization
function detectGPUAcceleration() {
    // Force performance mode for better compatibility
    document.body.classList.add('performance-mode');
    
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
        console.warn('WebGL not supported - GPU acceleration disabled');
        // Disable heavy animations if no GPU acceleration
        document.body.classList.add('no-gpu');
        return false;
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        
        console.log('GPU Info:', { vendor, renderer });
        
        // Track GPU capabilities for analytics
        trackInteraction('gpu_detection', {
            label: vendor.includes('Intel') ? 'integrated' : 'dedicated',
            value: 1
        });
        
        // Always use low-performance mode for better compatibility
        document.body.classList.add('low-gpu');
    }
    
    return true;
}

// Performance monitoring function
function monitorPerformance() {
    if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            trackInteraction('page_timing', {
                label: 'dom_content_loaded',
                value: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)
            });
        }
    }
}

// Theme System Functions - Mobile Optimized
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('vrchat-converter-theme') || 'dark';
    applyTheme(savedTheme);
    
    // Mobile-optimized theme toggle event listener
    if (isTouch) {
        // Use touchend for better mobile performance
        themeToggle.addEventListener('touchend', (e) => {
            e.preventDefault(); // Prevent double-tap zoom
            toggleTheme();
        });
        // Fallback for non-touch
        themeToggle.addEventListener('click', (e) => {
            if (!e.isTrusted) return; // Ignore programmatic clicks
            toggleTheme();
        });
    } else {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        applyTheme(newTheme);
        localStorage.setItem('vrchat-converter-theme', newTheme);
        
        // Track theme changes for analytics
        trackInteraction('theme_change', {
            label: newTheme,
            value: 1,
            mobile: isMobile
        });
    }
}

function applyTheme(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = '☀️';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '🌙';
    }
    
    // Add smooth transition class
    document.body.classList.add('theme-transition');
    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 300);
}
