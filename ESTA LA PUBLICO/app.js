// ========================================
// CriptoLive - Cryptocurrency Platform
// ========================================

// === Configuration ===
const CONFIG = {
    API_BASE_URL: 'https://api.coingecko.com/api/v3', // Use direct API url
    DEFAULT_CURRENCY: 'usd',
    UPDATE_INTERVAL: 60000, // 60 seconds
    TOP_CRYPTOS_COUNT: 20, // Increased for better trending data
    DEFAULT_BALANCE: 10000,
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID' // Replace with actual client ID
};

// === State Management ===
const state = {
    currentUser: null,
    userBalance: CONFIG.DEFAULT_BALANCE,
    userPortfolio: {},
    transactions: [],
    marketData: {},
    currentPrices: {},
    cryptoData: {}, // Store full crypto data (price, change, image, etc)
    updateInterval: null,
    charts: {}
};

// === Utility Functions ===
const utils = {
    formatCurrency(value, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },

    formatNumber(value, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },

    formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    getChangeClass(value) {
        return value >= 0 ? 'positive' : 'negative';
    },

    showLoading(element) {
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Cargando...</p>
            </div>
        `;
    },

    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// === Toast Notifications ===
const toast = {
    show(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toastEl = document.createElement('div');
        toastEl.className = `toast ${type}`;
        toastEl.innerHTML = `<p class="toast-message">${message}</p>`;

        container.appendChild(toastEl);

        setTimeout(() => {
            toastEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toastEl.remove(), 300);
        }, 3000);
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    },

    warning(message) {
        this.show(message, 'warning');
    }
};

// === Local Storage Management ===
const storage = {
    save() {
        try {
            const data = {
                user: state.currentUser,
                balance: state.userBalance,
                portfolio: state.userPortfolio,
                transactions: state.transactions
            };
            localStorage.setItem('criptolive_data', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
            toast.error('Error al guardar datos');
        }
    },

    load() {
        try {
            const data = localStorage.getItem('criptolive_data');
            if (data) {
                const parsed = JSON.parse(data);
                state.currentUser = parsed.user;
                state.userBalance = parsed.balance || CONFIG.DEFAULT_BALANCE;
                state.userPortfolio = parsed.portfolio || {};
                state.transactions = parsed.transactions || [];
                return true;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.warning('Error al cargar datos guardados');
        }
        return false;
    },

    clear() {
        localStorage.removeItem('criptolive_data');
    }
};

// === API Integration ===
const api = {
    async fetchMarketData() {
        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}/global`
            );
            const data = await response.json();
            state.marketData = data.data;
            return data.data;
        } catch (error) {
            console.error('Error fetching market data:', error);
            toast.error('Error al obtener datos del mercado');
            return null;
        }
    },

    async fetchTopCryptos() {
        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}/coins/markets?vs_currency=${CONFIG.DEFAULT_CURRENCY}&order=market_cap_desc&per_page=${CONFIG.TOP_CRYPTOS_COUNT}&page=1&sparkline=false&price_change_percentage=24h`
            );
            const data = await response.json();

            // Update current prices and full data
            data.forEach(crypto => {
                state.currentPrices[crypto.id] = crypto.current_price;
                state.cryptoData[crypto.id] = crypto;
            });

            return data;
        } catch (error) {
            console.error('Error fetching top cryptos:', error);
            toast.error('Error al obtener criptomonedas');
            return [];
        }
    },

    async fetchCryptoHistory(cryptoId, days = 7) {
        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}/coins/${cryptoId}/market_chart?vs_currency=${CONFIG.DEFAULT_CURRENCY}&days=${days}`
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching crypto history:', error);
            toast.error('Error al obtener historial');
            return null;
        }
    }
};

// === Authentication ===
const auth = {
    init() {
        // Elements
        this.overlay = document.getElementById('auth-overlay');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.loginContainer = document.getElementById('login-form-container');
        this.registerContainer = document.getElementById('register-form-container');

        // Check compatibility
        if (!this.overlay) return;

        // Seed Admin User
        const adminEmail = 'martinccantor@gmail.com';
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem('criptolive_users') || '[]');
        } catch (e) {
            console.warn('Corrupted users data in localStorage, resetting users array.');
            users = [];
        }

        if (!users.find(u => u.email === adminEmail)) {
            const adminUser = {
                id: 'admin-001',
                name: 'Martin Cantor',
                email: adminEmail,
                password: 'mamaculos67',
                avatar: 'https://ui-avatars.com/api/?name=Martin+Cantor&background=FF6B35&color=fff',
                isAdmin: true
            };
            users.push(adminUser);
            localStorage.setItem('criptolive_users', JSON.stringify(users));
            console.log('👑 Admin user seeded');
        }



        // Check if user is already logged in
        storage.load(); // Ensure data is loaded
        console.log('🔍 Checking auth state:', state.currentUser);

        if (state.currentUser) {
            console.log('✅ User logged in:', state.currentUser.name);
            this.showUserProfile();
            this.overlay.classList.add('hidden'); // Hide overlay

            // Show mode selection screen instead of dashboard directly
            const modeScreen = document.getElementById('mode-selection-screen');
            if (modeScreen) {
                console.log('showing mode selection screen');
                modeScreen.classList.remove('hidden');
            } else {
                console.error('CRITICAL: mode-selection-screen not found!');
            }
        } else {
            console.log('🔒 User not logged in, forcing auth overlay visible');
            this.showUserProfile(); // Hide profile if null
            this.overlay.classList.remove('hidden'); // Ensure visible
            // Force display style in case of CSS issues
            this.overlay.style.display = 'flex';
            this.overlay.style.opacity = '1';
        }

        this.setupEventListeners();
        this.setupModeSelection();
        this.updateNavigationVisibility(); // Check and set nav items upon initialization
    },

    updateNavigationVisibility() {
        const newsBtn = document.getElementById('nav-news');
        const adminBtn = document.getElementById('nav-admin');

        // Reset visibility
        if (newsBtn) newsBtn.classList.add('hidden');
        if (adminBtn) adminBtn.classList.add('hidden');

        if (state.currentUser) {
            // Show News for logged-in users
            if (newsBtn) newsBtn.classList.remove('hidden');

            // Show Admin for 'martinccantor@gmail.com'
            if (state.currentUser.isAdmin && adminBtn) {
                adminBtn.classList.remove('hidden');
            }
        }
    },

    showModeSelectionIfNeeded() {
        const cryptoApp = document.getElementById('crypto-app-container');
        const stocksApp = document.getElementById('stocks-app-container');
        if (cryptoApp.classList.contains('hidden') && stocksApp.classList.contains('hidden')) {
            document.getElementById('mode-selection-screen').classList.remove('hidden');
        }
    },

    setupModeSelection() {
        // Mode Selection Buttons
        document.getElementById('select-crypto-mode')?.addEventListener('click', () => {
            document.getElementById('mode-selection-screen').classList.add('hidden');
            document.getElementById('crypto-app-container').classList.remove('hidden');
            document.getElementById('stocks-app-container').classList.add('hidden');
        });

        document.getElementById('select-stocks-mode')?.addEventListener('click', () => {
            console.log('🎯 User clicked Stocks Mode');
            document.getElementById('mode-selection-screen').classList.add('hidden');
            document.getElementById('crypto-app-container').classList.add('hidden');
            document.getElementById('stocks-app-container').classList.remove('hidden');

            // Initialize stocks module
            if (window.stocksCommodities) {
                console.log('🔄 Reinitializing stocks module...');
                window.stocksCommodities.init();
            }

            // Initialize stocks navigation
            if (typeof stocksNavigation !== 'undefined') {
                stocksNavigation.init();
            }
        });

        // Back Buttons
        document.getElementById('crypto-back-to-mode')?.addEventListener('click', () => {
            document.getElementById('crypto-app-container').classList.add('hidden');
            document.getElementById('mode-selection-screen').classList.remove('hidden');
        });

        document.getElementById('stocks-back-to-mode')?.addEventListener('click', () => {
            document.getElementById('stocks-app-container').classList.add('hidden');
            document.getElementById('mode-selection-screen').classList.remove('hidden');
        });

        // Keep the old IDs just in case they are used elsewhere (though shouldn't be based on HTML)
        document.getElementById('nav-back-to-mode')?.addEventListener('click', () => {
            document.getElementById('crypto-app-container').classList.add('hidden');
            document.getElementById('mode-selection-screen').classList.remove('hidden');
        });

        document.getElementById('back-to-mode-select')?.addEventListener('click', () => {
            document.getElementById('stocks-app-container').classList.add('hidden');
            document.getElementById('mode-selection-screen').classList.remove('hidden');
        });
    },

    setupEventListeners() {
        // Main Login Button
        const mainLoginBtn = document.getElementById('login-btn');
        if (mainLoginBtn) {
            mainLoginBtn.addEventListener('click', () => {
                this.overlay.classList.remove('hidden');
            });
        }

        const stocksLoginBtn = document.getElementById('stocks-login-btn');
        if (stocksLoginBtn) {
            stocksLoginBtn.addEventListener('click', () => {
                this.overlay.classList.remove('hidden');
            });
        }

        // Guest mode login
        const guestBtn = document.getElementById('guest-login-btn');
        if (guestBtn) {
            guestBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleGuestLogin();
            });
        }

        // Toggle forms
        document.getElementById('switch-to-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.loginContainer.classList.add('hidden');
            this.registerContainer.classList.remove('hidden');
        });

        document.getElementById('switch-to-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.registerContainer.classList.add('hidden');
            this.loginContainer.classList.remove('hidden');
        });

        // Login Submit
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register Submit
        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        const stocksLogoutBtn = document.getElementById('stocks-logout-btn');
        if (stocksLogoutBtn) {
            stocksLogoutBtn.addEventListener('click', () => this.logout());
        }
    },

    handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Simple validation
        if (!email || !password) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        // Get users from storage
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem('criptolive_users') || '[]');
        } catch (e) {
            users = [];
        }
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Login success
            state.currentUser = user;

            // Load user data if available specific to this user? 
            // For this prototype, we share portfolio data in 'criptolive_data' 
            // OR we could load user-specific data. 
            // Let's keep it simple: if 'criptolive_data' exists, use it. 
            // Better: update currentUser in state and save it.

            // Note: In a real app, we would load the specific user's portfolio.
            // Here we assume 'criptolive_data' holds the current session state.

            storage.save(); // Save current session
            this.showUserProfile();

            // FIX: Use .hidden to hide the overlay
            this.overlay.classList.add('hidden');

            // Show mode selection if starting fresh
            this.showModeSelectionIfNeeded();

            this.updateNavigationVisibility(); // Ensure Admin/News buttons appear if applicable

            toast.success(`¡Bienvenido de nuevo, ${user.name}!`);
        } else {
            // Check if user exists to give specific error (for prototype only)
            const emailExists = users.some(u => u.email === email);
            if (emailExists) {
                toast.error('❌ Contraseña incorrecta');
            } else {
                toast.error('❌ El usuario no existe');
            }
        }
    },

    handleRegister() {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        if (!name || !email || !password) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        // Check if user exists
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem('criptolive_users') || '[]');
        } catch (e) {
            users = [];
        }
        if (users.find(u => u.email === email)) {
            toast.error('El email ya está registrado');
            return;
        }

        // Create user
        const newUser = {
            id: utils.generateId(),
            name,
            email,
            password, // Stored in plain text for prototype only!
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        };

        // Save to users list
        users.push(newUser);
        localStorage.setItem('criptolive_users', JSON.stringify(users));

        // Auto login
        state.currentUser = newUser;
        state.userBalance = CONFIG.DEFAULT_BALANCE; // Reset balance for new user
        state.userPortfolio = {};
        state.transactions = [];

        storage.save(); // Save session
        this.showUserProfile();

        // FIX: Ensure overlay is hidden
        this.overlay.classList.add('hidden');
        this.showModeSelectionIfNeeded();

        this.updateNavigationVisibility();

        // Update UI
        dashboard.updateBalance();
        portfolio.render();

        toast.success(`¡Cuenta creada! Bienvenido, ${name}`);
    },

    showUserProfile() {
        const loginBtn = document.getElementById('login-btn');
        const stocksLoginBtn = document.getElementById('stocks-login-btn');
        const profile = document.getElementById('user-profile');
        const stocksProfile = document.getElementById('stocks-user-profile');

        if (!state.currentUser) {
            // Unauthenticated state: hide profile, show login buttons
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (stocksLoginBtn) stocksLoginBtn.classList.remove('hidden');
            if (profile) profile.classList.add('hidden');
            if (stocksProfile) stocksProfile.classList.add('hidden');
            return;
        }

        // Authenticated state: hide login buttons, show profile
        if (loginBtn) loginBtn.classList.add('hidden');
        if (stocksLoginBtn) stocksLoginBtn.classList.add('hidden');

        if (profile) {
            profile.classList.remove('hidden');
            document.getElementById('user-name').textContent = state.currentUser.name;
            const avatarImg = document.getElementById('user-avatar');
            if (avatarImg) avatarImg.src = state.currentUser.avatar;
        }

        if (stocksProfile) {
            stocksProfile.classList.remove('hidden');
            document.getElementById('stocks-user-name').textContent = state.currentUser.name;
            const stocksAvatarImg = document.getElementById('stocks-user-avatar');
            if (stocksAvatarImg) stocksAvatarImg.src = state.currentUser.avatar;
        }
    },

    logout() {
        state.currentUser = null;
        // Don't clear data, just session
        // storage.clear(); 

        // Save null user to clear session persistence
        localStorage.setItem('criptolive_data', JSON.stringify({
            user: null,
            balance: state.userBalance,
            portfolio: state.userPortfolio,
            transactions: state.transactions
        }));

        this.showUserProfile();

        this.overlay.classList.add('active');
        this.overlay.classList.remove('hidden');
        this.loginForm.reset();
        toast.warning('Sesión cerrada');
    },

    handleGuestLogin() {
        console.log('👀 Entrando como invitado...');

        // Null user, but ensure balance and basic states are initialized
        state.currentUser = null;
        state.userBalance = CONFIG.DEFAULT_BALANCE;
        state.userPortfolio = {};
        state.transactions = [];

        storage.save(); // Save session (as null)
        this.showUserProfile();

        // Hide overlay and show mode selection
        this.overlay.classList.add('hidden');
        this.showModeSelectionIfNeeded();

        this.updateNavigationVisibility(); // Hide News and Admin for guest

        dashboard.updateBalance();
        portfolio.render();

        toast.success(`Entraste modo Simulador. Regístrate luego para guardar tu progreso.`);
    }
};

// === Hero Section ===
const hero = {
    init() {
        // Setup hero CTA buttons
        document.getElementById('hero-start-btn')?.addEventListener('click', () => {
            navigation.navigateTo('exchange');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.getElementById('hero-learn-btn')?.addEventListener('click', () => {
            navigation.navigateTo('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Update ticker
        this.updateTicker();
    },

    async updateTicker() {
        const cryptos = await api.fetchTopCryptos();
        if (!cryptos || cryptos.length < 3) return;

        const tickerContent = document.getElementById('hero-ticker-content');
        if (!tickerContent) return;

        const btc = cryptos.find(c => c.id === 'bitcoin');
        const eth = cryptos.find(c => c.id === 'ethereum');
        const sol = cryptos.find(c => c.id === 'solana');

        const updateTickerItem = (crypto, index) => {
            if (!crypto) return '';
            const change = crypto.price_change_percentage_24h || 0;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const symbol = change >= 0 ? '↑' : '↓';

            return `
                <div class="ticker-item">
                    <span class="ticker-name">${crypto.symbol.toUpperCase()}</span>
                    <span class="ticker-price">${utils.formatCurrency(crypto.current_price)}</span>
                    <span class="ticker-change ${changeClass}">${symbol}${utils.formatNumber(Math.abs(change), 2)}%</span>
                </div>
            `;
        };

        tickerContent.innerHTML = [
            updateTickerItem(btc, 0),
            updateTickerItem(eth, 1),
            updateTickerItem(sol, 2)
        ].join('');
    }
};

// === Dashboard ===
const dashboard = {
    async init() {
        await this.loadMarketStats();
        await this.loadTopCryptos();
        this.setupChart();
        this.updateBalance();

        // Start auto-update
        state.updateInterval = setInterval(() => {
            this.loadMarketStats();
            this.loadTopCryptos();
        }, CONFIG.UPDATE_INTERVAL);
    },

    async loadMarketStats() {
        const marketData = await api.fetchMarketData();
        if (!marketData) return;

        const marketCap = marketData.total_market_cap?.[CONFIG.DEFAULT_CURRENCY] || 0;
        const volume = marketData.total_volume?.[CONFIG.DEFAULT_CURRENCY] || 0;
        const btcDominance = marketData.market_cap_percentage?.btc || 0;
        const activeCryptos = marketData.active_cryptocurrencies || 0;

        document.getElementById('total-market-cap').textContent = utils.formatCurrency(marketCap, 0);
        document.getElementById('total-volume').textContent = utils.formatCurrency(volume, 0);
        document.getElementById('btc-dominance').textContent = `${utils.formatNumber(btcDominance, 1)}%`;
        document.getElementById('active-cryptos').textContent = utils.formatNumber(activeCryptos, 0);
    },

    async loadTopCryptos() {
        const listElement = document.getElementById('crypto-list');

        const cryptos = await api.fetchTopCryptos();
        if (!cryptos || cryptos.length === 0) {
            listElement.innerHTML = '<p class="empty-state">No se pudieron cargar las criptomonedas</p>';
            return;
        }

        // Update current prices in state for portfolio calculations
        cryptos.forEach(crypto => {
            state.currentPrices[crypto.id] = crypto.current_price;
        });

        // Update portfolio with new prices
        portfolio.render();

        listElement.innerHTML = cryptos.map(crypto => `
            <div class="crypto-card" data-crypto-id="${crypto.id}">
                <div class="crypto-header">
                    <div class="crypto-info">
                        <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon">
                        <div class="crypto-name-section">
                            <div class="crypto-name">${crypto.name}</div>
                            <div class="crypto-symbol">${crypto.symbol}</div>
                        </div>
                    </div>
                    <div class="crypto-rank">#${crypto.market_cap_rank}</div>
                </div>
                <div class="crypto-price">${utils.formatCurrency(crypto.current_price)}</div>
                <div class="crypto-change ${utils.getChangeClass(crypto.price_change_percentage_24h)}">
                    ${crypto.price_change_percentage_24h >= 0 ? '↑' : '↓'} ${utils.formatNumber(Math.abs(crypto.price_change_percentage_24h))}%
                </div>
                <div class="crypto-stats">
                    <div class="crypto-stat">
                        <div class="crypto-stat-label">Market Cap</div>
                        <div class="crypto-stat-value">${utils.formatCurrency(crypto.market_cap, 0)}</div>
                    </div>
                    <div class="crypto-stat">
                        <div class="crypto-stat-label">Volumen 24h</div>
                        <div class="crypto-stat-value">${utils.formatCurrency(crypto.total_volume, 0)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    setupChart() {
        const ctx = document.getElementById('price-chart').getContext('2d');

        state.charts.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Precio (USD)',
                    data: [],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 750
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#cbd5e1' }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8', maxTicksLimit: 8 },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                }
            }
        });

        // Setup controls
        document.getElementById('chart-crypto-select').addEventListener('change', (e) => {
            this.updateChart(e.target.value, 7);
        });

        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                const cryptoId = document.getElementById('chart-crypto-select').value;
                const days = parseInt(e.target.dataset.days);
                this.updateChart(cryptoId, days);
            });
        });

        // Load initial data
        this.updateChart('bitcoin', 7);
    },

    async updateChart(cryptoId, days) {
        const data = await api.fetchCryptoHistory(cryptoId, days);
        if (!data || !data.prices) return;

        // Sample data for better performance on large datasets
        const prices = data.prices;
        const sampleSize = Math.min(prices.length, 50);
        const step = Math.floor(prices.length / sampleSize);
        const sampledPrices = prices.filter((_, index) => index % step === 0);

        const labels = sampledPrices.map(p => {
            const date = new Date(p[0]);
            return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        });

        const priceData = sampledPrices.map(p => p[1]);

        state.charts.priceChart.data.labels = labels;
        state.charts.priceChart.data.datasets[0].data = priceData;
        state.charts.priceChart.update('none'); // No animation for faster updates
    },

    updateBalance() {
        document.getElementById('user-balance').textContent = utils.formatCurrency(state.userBalance);
    }
};

// === Exchange ===
const exchange = {
    async init() {
        await this.populateSelects();
        this.loadTrending();
        this.loadRecommendations();
        this.setupQuickActions();
        this.setupEventListeners();
    },

    async populateSelects() {
        console.log('📊 Populating exchange selects...');
        const cryptos = await api.fetchTopCryptos();

        if (!cryptos) {
            console.error('❌ Failed to fetch cryptos');
            const buySelect = document.getElementById('buy-crypto-select');
            buySelect.innerHTML = '<option value="">Error al cargar criptomonedas</option>';
            return;
        }

        console.log(`✅ Loaded ${cryptos.length} cryptos`);
        const buySelect = document.getElementById('buy-crypto-select');
        const sellSelect = document.getElementById('sell-crypto-select');

        buySelect.innerHTML = cryptos.map(crypto =>
            `<option value="${crypto.id}" data-price="${crypto.current_price}" data-symbol="${crypto.symbol}">
                ${crypto.name} (${crypto.symbol.toUpperCase()}) - ${utils.formatCurrency(crypto.current_price)}
            </option>`
        ).join('');

        console.log(`✅ Buy select populated with ${buySelect.options.length} options`);

        this.updateSellSelect();

        // Trigger initial calculation for buy form
        this.updateBuyCalculation();
    },

    updateSellSelect() {
        const sellSelect = document.getElementById('sell-crypto-select');
        const holdings = Object.keys(state.userPortfolio);

        if (holdings.length === 0) {
            sellSelect.innerHTML = '<option value="">No tienes criptomonedas</option>';
            return;
        }

        sellSelect.innerHTML = holdings.map(cryptoId => {
            const amount = state.userPortfolio[cryptoId].amount;
            const price = state.currentPrices[cryptoId] || 0;
            return `<option value="${cryptoId}" data-amount="${amount}" data-price="${price}">
                ${cryptoId.toUpperCase()} - ${utils.formatNumber(amount, 8)} (${utils.formatCurrency(amount * price)})
            </option>`;
        }).join('');
    },

    setupEventListeners() {
        // Buy form
        const buySelect = document.getElementById('buy-crypto-select');
        const buyAmountInput = document.getElementById('buy-amount');
        const buyBtn = document.getElementById('buy-btn');

        buySelect.addEventListener('change', () => this.updateBuyCalculation());

        // Debounce input for better performance
        buyAmountInput.addEventListener('input', utils.debounce(() => {
            this.updateBuyCalculation();
        }, 300));

        buyBtn.addEventListener('click', () => this.executeBuy());

        // Sell form
        const sellSelect = document.getElementById('sell-crypto-select');
        const sellAmountInput = document.getElementById('sell-amount');
        const sellBtn = document.getElementById('sell-btn');

        sellSelect.addEventListener('change', () => this.updateSellCalculation());

        // Sell mode toggle
        const sellModeRadios = document.querySelectorAll('input[name="sell-mode"]');
        const partialAmountGroup = document.getElementById('partial-amount-group');

        sellModeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'partial') {
                    partialAmountGroup.style.display = 'block';
                    sellAmountInput.disabled = false;
                    sellAmountInput.value = '';
                } else {
                    partialAmountGroup.style.display = 'none';
                    sellAmountInput.disabled = true;
                    // Auto-set to max available
                    const option = sellSelect.options[sellSelect.selectedIndex];
                    if (option && option.value) {
                        sellAmountInput.value = option.dataset.amount;
                    }
                }
                this.updateSellCalculation();
            });
        });

        // Debounce input for better performance
        sellAmountInput.addEventListener('input', utils.debounce(() => {
            this.updateSellCalculation();
        }, 300));

        sellBtn.addEventListener('click', () => this.executeSell());

        // Note: Initial calculation is triggered after populateSelects completes
    },

    updateBuyCalculation() {
        const select = document.getElementById('buy-crypto-select');
        const amountInput = document.getElementById('buy-amount');
        const option = select.options[select.selectedIndex];

        if (!option) return;

        const price = parseFloat(option.dataset.price);
        const usdAmount = parseFloat(amountInput.value) || 0;
        const cryptoAmount = usdAmount / price;

        document.getElementById('buy-current-price').textContent = utils.formatCurrency(price);
        document.getElementById('buy-crypto-amount').textContent = utils.formatNumber(cryptoAmount, 8);
        document.getElementById('buy-crypto-symbol').textContent = option.dataset.symbol.toUpperCase();
    },

    updateSellCalculation() {
        const select = document.getElementById('sell-crypto-select');
        const amountInput = document.getElementById('sell-amount');
        const option = select.options[select.selectedIndex];
        const sellMode = document.querySelector('input[name="sell-mode"]:checked')?.value || 'all';

        if (!option || !option.value) return;

        const available = parseFloat(option.dataset.amount);
        const price = parseFloat(option.dataset.price);

        let sellAmount;
        if (sellMode === 'all') {
            sellAmount = available;
            amountInput.value = available;
        } else {
            sellAmount = parseFloat(amountInput.value) || 0;
        }

        const totalValue = sellAmount * price;

        document.getElementById('sell-available').textContent = utils.formatNumber(available, 8);
        document.getElementById('sell-total-value').textContent = utils.formatCurrency(totalValue);
    },

    executeBuy() {
        const select = document.getElementById('buy-crypto-select');
        const amountInput = document.getElementById('buy-amount');
        const option = select.options[select.selectedIndex];

        const cryptoId = select.value;
        const cryptoName = option.text.split('(')[0].trim();
        const price = parseFloat(option.dataset.price);
        const usdAmount = parseFloat(amountInput.value);

        if (!usdAmount || usdAmount <= 0) {
            toast.error('Ingresa una cantidad válida');
            return;
        }

        if (usdAmount > state.userBalance) {
            toast.error('Balance insuficiente');
            return;
        }

        const cryptoAmount = usdAmount / price;

        // Update balance
        state.userBalance -= usdAmount;

        // Update portfolio
        if (!state.userPortfolio[cryptoId]) {
            state.userPortfolio[cryptoId] = {
                name: cryptoName,
                amount: 0,
                invested: 0
            };
        }
        state.userPortfolio[cryptoId].amount += cryptoAmount;
        state.userPortfolio[cryptoId].invested += usdAmount;

        // Add transaction
        state.transactions.unshift({
            id: utils.generateId(),
            type: 'buy',
            cryptoId,
            cryptoName,
            amount: cryptoAmount,
            price,
            total: usdAmount,
            date: new Date().toISOString()
        });

        // Save and update UI
        storage.save();
        dashboard.updateBalance();
        this.updateSellSelect();
        this.renderTransactions();
        portfolio.render();

        // Reset form
        amountInput.value = '';
        this.updateBuyCalculation();

        toast.success(`¡Compraste ${utils.formatNumber(cryptoAmount, 8)} ${cryptoName}!`);
    },

    executeSell() {
        const select = document.getElementById('sell-crypto-select');
        const amountInput = document.getElementById('sell-amount');
        const option = select.options[select.selectedIndex];
        const sellMode = document.querySelector('input[name="sell-mode"]:checked').value;

        if (!option.value) {
            toast.error('No tienes criptomonedas para vender');
            return;
        }

        const cryptoId = select.value;
        const available = parseFloat(option.dataset.amount);
        const price = parseFloat(option.dataset.price);

        let sellAmount;
        if (sellMode === 'all') {
            sellAmount = available;
        } else {
            sellAmount = parseFloat(amountInput.value);

            if (!sellAmount || sellAmount <= 0) {
                toast.error('Ingresa una cantidad válida');
                return;
            }

            if (sellAmount > available) {
                toast.error('No tienes suficientes criptomonedas');
                return;
            }
        }

        const totalValue = sellAmount * price;

        // Update balance
        state.userBalance += totalValue;

        // Update portfolio
        state.userPortfolio[cryptoId].amount -= sellAmount;

        // Remove from portfolio if amount is zero
        if (state.userPortfolio[cryptoId].amount < 0.00000001) {
            delete state.userPortfolio[cryptoId];
        }

        // Add transaction
        state.transactions.unshift({
            id: utils.generateId(),
            type: 'sell',
            cryptoId,
            cryptoName: state.userPortfolio[cryptoId]?.name || cryptoId,
            amount: sellAmount,
            price,
            total: totalValue,
            date: new Date().toISOString()
        });

        // Save and update UI
        storage.save();
        dashboard.updateBalance();
        this.updateSellSelect();
        this.renderTransactions();
        portfolio.render();

        // Reset form
        amountInput.value = '';
        document.querySelector('input[name="sell-mode"][value="all"]').checked = true;
        document.getElementById('partial-amount-group').style.display = 'none';
        this.updateSellCalculation();

        const modeText = sellMode === 'all' ? 'todo tu' : utils.formatNumber(sellAmount, 8);
        toast.success(`¡Vendiste ${modeText} ${cryptoId.toUpperCase()}!`);
    },

    renderTransactions() {
        const listElement = document.getElementById('transaction-list');

        if (state.transactions.length === 0) {
            listElement.innerHTML = '<p class="empty-state">No hay transacciones aún</p>';
            return;
        }

        listElement.innerHTML = state.transactions.slice(0, 10).map(tx => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <span class="transaction-type ${tx.type}">${tx.type === 'buy' ? 'COMPRA' : 'VENTA'}</span>
                    <div class="transaction-details">
                        <div class="transaction-crypto">${tx.cryptoName}</div>
                        <div class="transaction-date">${utils.formatDate(tx.date)}</div>
                    </div>
                </div>
                <div class="transaction-amount ${tx.type === 'buy' ? 'negative' : 'positive'}">
                    ${tx.type === 'buy' ? '-' : '+'}${utils.formatCurrency(tx.total)}
                </div>
            </div>
        `).join('');
    },

    loadTrending() {
        const list = document.getElementById('trending-list');
        if (!list) return;

        // Get top 3 movers (absolute change)
        const allCryptos = Object.values(state.cryptoData);
        if (allCryptos.length === 0) return;

        const trending = allCryptos
            .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
            .slice(0, 3);

        list.innerHTML = trending.map(coin => `
            <div class="trending-item" onclick="document.getElementById('buy-crypto-select').value='${coin.id}'; exchange.updateBuyCalculation();">
                <div class="trending-icon"><img src="${coin.image}" style="width:24px;height:24px;border-radius:50%"></div>
                <div class="trending-info">
                    <div class="trending-name">${coin.name}</div>
                    <div class="trending-symbol">${coin.symbol.toUpperCase()}</div>
                </div>
                <div class="trending-change ${utils.getChangeClass(coin.price_change_percentage_24h)}">
                    ${coin.price_change_percentage_24h > 0 ? '+' : ''}${utils.formatNumber(coin.price_change_percentage_24h)}%
                </div>
            </div>
        `).join('');
    },

    loadRecommendations() {
        const list = document.getElementById('recommendations-list');
        if (!list) return;

        // Simple mock recommendations based on data
        const allCryptos = Object.values(state.cryptoData);
        if (allCryptos.length === 0) return;

        // Find a dip (buy opportunity)
        const dip = allCryptos.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)[0];

        // Find a pump (high volume?) or just random
        const highVol = allCryptos.sort((a, b) => b.total_volume - a.total_volume)[0];

        let html = '';

        if (dip && dip.price_change_percentage_24h < -2) {
            html += `
                <div class="recommendation-card" onclick="document.getElementById('buy-crypto-select').value='${dip.id}'; exchange.updateBuyCalculation();" style="cursor:pointer">
                    <div class="rec-icon">📉</div>
                    <div class="rec-content">
                        <p class="rec-title">Oportunidad de Compra: ${dip.symbol.toUpperCase()}</p>
                        <p class="rec-desc">Ha bajado un ${utils.formatNumber(Math.abs(dip.price_change_percentage_24h))}% hoy.</p>
                    </div>
                </div>
             `;
        }

        if (highVol) {
            html += `
                <div class="recommendation-card" onclick="document.getElementById('buy-crypto-select').value='${highVol.id}'; exchange.updateBuyCalculation();" style="cursor:pointer">
                    <div class="rec-icon">🔥</div>
                    <div class="rec-content">
                        <p class="rec-title">Alto Volumen: ${highVol.symbol.toUpperCase()}</p>
                        <p class="rec-desc">Mucha actividad en ${highVol.name} hoy.</p>
                    </div>
                </div>
             `;
        }

        // Default static tip
        html += `
            <div class="recommendation-card">
                <div class="rec-icon">💡</div>
                <div class="rec-content">
                    <p class="rec-title">Diversifica tu Portfolio</p>
                    <p class="rec-desc">No pongas todos los huevos en la misma canasta.</p>
                </div>
            </div>
        `;

        list.innerHTML = html;
    },

    setupQuickActions() {
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = btn.dataset.amount;
                const input = document.getElementById('buy-amount');

                if (amount === 'all') {
                    input.value = state.userBalance;
                } else {
                    input.value = amount;
                }

                // Trigger calculation
                this.updateBuyCalculation();

                // Scroll to buy form if needed on mobile
                const form = document.querySelector('.exchange-card');
                if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }
};

// === Portfolio ===
const portfolio = {
    init() {
        this.setupChart();
        this.render();
    },

    setupChart() {
        const ctx = document.getElementById('portfolio-chart').getContext('2d');

        state.charts.portfolioChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#6366f1', '#ec4899', '#14b8a6', '#f59e0b',
                        '#8b5cf6', '#10b981', '#f97316', '#06b6d4'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#cbd5e1' }
                    }
                }
            }
        });
    },

    render() {
        const holdings = Object.keys(state.userPortfolio);

        if (holdings.length === 0) {
            document.getElementById('portfolio-total-value').textContent = '$0.00';
            document.getElementById('portfolio-invested').textContent = '$0.00';
            document.getElementById('portfolio-profit').textContent = '$0.00';
            document.getElementById('portfolio-roi').textContent = '0%';

            document.getElementById('holdings-list').innerHTML =
                '<p class="empty-state">Tu portfolio está vacío. ¡Empieza a invertir!</p>';

            state.charts.portfolioChart.data.labels = [];
            state.charts.portfolioChart.data.datasets[0].data = [];
            state.charts.portfolioChart.update();
            return;
        }

        // Calculate totals
        let totalValue = 0;
        let totalInvested = 0;
        const chartLabels = [];
        const chartData = [];

        const holdingsHTML = holdings.map(cryptoId => {
            const holding = state.userPortfolio[cryptoId];
            const currentPrice = state.currentPrices[cryptoId] || 0;
            const currentValue = holding.amount * currentPrice;
            const profit = currentValue - holding.invested;
            const profitPercent = (profit / holding.invested) * 100;

            totalValue += currentValue;
            totalInvested += holding.invested;
            chartLabels.push(holding.name);
            chartData.push(currentValue);

            return `
                <div class="holding-item">
                    <div class="holding-info">
                        <div class="holding-details">
                            <div class="holding-name">${holding.name}</div>
                            <div class="holding-amount">${utils.formatNumber(holding.amount, 8)} ${cryptoId.toUpperCase()}</div>
                        </div>
                    </div>
                    <div class="holding-value">
                        <div class="holding-current-value">${utils.formatCurrency(currentValue)}</div>
                        <div class="holding-profit ${utils.getChangeClass(profit)}">
                            ${profit >= 0 ? '+' : ''}${utils.formatCurrency(profit)} (${utils.formatNumber(profitPercent, 2)}%)
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const totalProfit = totalValue - totalInvested;
        const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

        // Update stats with animation
        const totalValueElement = document.getElementById('portfolio-total-value');
        const oldValue = parseFloat(totalValueElement.textContent.replace(/[$,]/g, '')) || 0;
        totalValueElement.textContent = utils.formatCurrency(totalValue);

        // Add pulse animation if value changed significantly
        if (Math.abs(totalValue - oldValue) > 1) {
            totalValueElement.classList.add('value-updated');
            setTimeout(() => totalValueElement.classList.remove('value-updated'), 1000);
        }

        document.getElementById('portfolio-invested').textContent = utils.formatCurrency(totalInvested);

        const profitElement = document.getElementById('portfolio-profit');
        profitElement.textContent = utils.formatCurrency(totalProfit);
        profitElement.className = `portfolio-stat-value ${utils.getChangeClass(totalProfit)}`;

        const roiElement = document.getElementById('portfolio-roi');
        roiElement.textContent = `${roi >= 0 ? '+' : ''}${utils.formatNumber(roi, 2)}%`;
        roiElement.className = `portfolio-stat-value ${utils.getChangeClass(roi)}`;

        // Update holdings list
        document.getElementById('holdings-list').innerHTML = holdingsHTML;

        // === New Portfolio Metrics ===

        // 1. Portfolio Performance (Weighted Average 24h)
        let weightedChangeSum = 0;
        let totalCurrentValue = 0;

        holdings.forEach(id => {
            const holding = state.userPortfolio[id];
            const data = state.cryptoData[id];
            if (data && holding) {
                const value = holding.amount * data.current_price;
                weightedChangeSum += (data.price_change_percentage_24h || 0) * value;
                totalCurrentValue += value;
            }
        });

        const portfolioChange = totalCurrentValue > 0 ? (weightedChangeSum / totalCurrentValue) : 0;

        const portPerfEl = document.getElementById('portfolio-performance');
        if (portPerfEl) {
            portPerfEl.textContent = `${portfolioChange >= 0 ? '+' : ''}${utils.formatNumber(portfolioChange, 2)}%`;
            portPerfEl.className = `perf-value ${utils.getChangeClass(portfolioChange)}`;
        }

        // 2. Market Comparison
        // We need market 24h change. 
        // CoinGecko's global endpoint returns market_cap_change_percentage_24h_usd
        // Let's assume we saved it in state.marketData or fetch it.
        // state.marketData has total_market_cap, total_volume, market_cap_percentage
        // It DOES contain market_cap_change_percentage_24h_usd at root.
        // Let's check fetchMarketData. It returns data.data.
        // CoinGecko /global response structure: { data: { active_cryptocurrencies, ..., market_cap_change_percentage_24h_usd } }

        const marketChange = state.marketData?.market_cap_change_percentage_24h_usd || 0;
        const marketPerfEl = document.getElementById('market-performance');
        if (marketPerfEl) {
            marketPerfEl.textContent = `${marketChange >= 0 ? '+' : ''}${utils.formatNumber(marketChange, 2)}%`;
            marketPerfEl.className = `perf-value ${utils.getChangeClass(marketChange)}`;
        }

        // 3. Best & Worst Performers (from own portfolio or market?)
        // Providing specific Best/Worst from PORTFOLIO assets

        if (holdings.length > 0) {
            const holdingMetrics = holdings.map(id => {
                const data = state.cryptoData[id];
                return {
                    id,
                    name: state.userPortfolio[id].name,
                    change: data ? data.price_change_percentage_24h : 0,
                    image: data ? data.image : ''
                };
            }).sort((a, b) => b.change - a.change);

            const best = holdingMetrics[0];
            const worst = holdingMetrics[holdingMetrics.length - 1];

            const renderPerformer = (p) => `
                <div class="performer-item">
                    <span class="performer-name">${p.name}</span>
                    <span class="performer-change ${utils.getChangeClass(p.change)}">
                        ${p.change >= 0 ? '+' : ''}${utils.formatNumber(p.change, 2)}%
                    </span>
                </div>
            `;

            const bestContainer = document.getElementById('best-performers');
            const worstContainer = document.getElementById('worst-performers');

            if (bestContainer && best) bestContainer.innerHTML = renderPerformer(best);
            if (worstContainer && worst) worstContainer.innerHTML = renderPerformer(worst);

        } else {
            // Empty state
            ['best-performers', 'worst-performers'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '<p class="empty-state-small">Sin datos de inversiones</p>';
            });
        }

        // Update chart with smooth animation
        state.charts.portfolioChart.data.labels = chartLabels;
        state.charts.portfolioChart.data.datasets[0].data = chartData;
        state.charts.portfolioChart.update('active');
    }
};

// === Simulator ===
const simulator = {
    init() {
        document.getElementById('run-simulation-btn').addEventListener('click', () => {
            this.runSimulation();
        });
    },

    async runSimulation() {
        const cryptoId = document.getElementById('sim-crypto-select').value;
        const amount = parseFloat(document.getElementById('sim-amount').value);
        const timeframe = parseInt(document.getElementById('sim-timeframe').value);

        if (!amount || amount <= 0) {
            toast.error('Ingresa un monto válido');
            return;
        }

        toast.success('Ejecutando simulación...');

        const historyData = await api.fetchCryptoHistory(cryptoId, timeframe);
        if (!historyData || !historyData.prices) {
            toast.error('Error al obtener datos históricos');
            return;
        }

        const prices = historyData.prices;
        const oldPrice = prices[0][1];
        const currentPrice = prices[prices.length - 1][1];

        const initialCoins = amount / oldPrice;
        const currentValue = initialCoins * currentPrice;
        const profit = currentValue - amount;
        const roi = (profit / amount) * 100;

        // Update results
        document.getElementById('sim-initial').textContent = utils.formatCurrency(amount);
        document.getElementById('sim-current').textContent = utils.formatCurrency(currentValue);

        const profitElement = document.getElementById('sim-profit');
        profitElement.textContent = `${profit >= 0 ? '+' : ''}${utils.formatCurrency(profit)}`;
        profitElement.className = `result-value ${utils.getChangeClass(profit)}`;

        const roiElement = document.getElementById('sim-roi');
        roiElement.textContent = `${roi >= 0 ? '+' : ''}${utils.formatNumber(roi, 2)}%`;
        roiElement.className = `result-value ${utils.getChangeClass(roi)}`;

        // Show results
        document.getElementById('simulation-results').classList.remove('hidden');

        // Update chart
        this.updateSimulationChart(historyData, amount);

        // Show recommendation
        this.showRecommendation(roi, cryptoId);
    },

    updateSimulationChart(data, initialAmount) {
        const ctx = document.getElementById('simulation-chart');

        if (state.charts.simulationChart) {
            state.charts.simulationChart.destroy();
        }

        const prices = data.prices;
        const initialPrice = prices[0][1];
        const coins = initialAmount / initialPrice;

        const labels = prices.map(p => {
            const date = new Date(p[0]);
            return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        });

        const values = prices.map(p => coins * p[1]);

        state.charts.simulationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Valor de Inversión (USD)',
                    data: values,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#cbd5e1' }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                }
            }
        });
    },

    showRecommendation(roi, cryptoId) {
        const recBox = document.getElementById('sim-recommendation');

        let recommendation = '';
        if (roi > 50) {
            recommendation = `
                <h4>📈 Excelente Retorno</h4>
                <p>Si hubieras invertido en ${cryptoId.toUpperCase()} en este período, habrías obtenido un retorno excepcional del ${utils.formatNumber(roi, 2)}%. 
                Recuerda que el rendimiento pasado no garantiza resultados futuros.</p>
            `;
        } else if (roi > 0) {
            recommendation = `
                <h4>✅ Retorno Positivo</h4>
                <p>Tu inversión en ${cryptoId.toUpperCase()} habría generado un retorno positivo del ${utils.formatNumber(roi, 2)}%. 
                Las criptomonedas son volátiles, así que siempre invierte con precaución.</p>
            `;
        } else {
            recommendation = `
                <h4>⚠️ Pérdida</h4>
                <p>En este período, una inversión en ${cryptoId.toUpperCase()} habría resultado en una pérdida del ${utils.formatNumber(Math.abs(roi), 2)}%. 
                Esto demuestra la importancia de diversificar y tener una estrategia a largo plazo.</p>
            `;
        }

        recBox.innerHTML = recommendation;
    }
};

// === Navigation ===
const navigation = {
    init() {
        // Get all nav buttons from sidebar
        const navBtns = document.querySelectorAll('#sidebar-nav .nav-btn');

        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                this.navigateTo(section);
            });
        });
    },

    navigateTo(sectionId) {
        // Protected routes checks
        const checkAuth = (sectionId) => {
            if (sectionId === 'news') {
                if (!state.currentUser) {
                    toast.warning('Debes iniciar sesión para ver las noticias');
                    auth.overlay.classList.remove('hidden');
                    return false;
                }
            }
            if (sectionId === 'admin') {
                if (!state.currentUser || !state.currentUser.isAdmin) {
                    toast.error('Acceso denegado. No eres administrador.');
                    return false;
                }
            }
            return true;
        };

        // Update sidebar nav buttons
        document.querySelectorAll('#sidebar-nav .nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === sectionId) {
                btn.classList.add('active');
            }
        });

        if (!checkAuth(sectionId)) {
            // Revert active class back if auth fails (fallback to dashboard visually)
            document.querySelectorAll('#sidebar-nav .nav-btn').forEach(btn => {
                if (btn.dataset.section === 'dashboard') btn.classList.add('active');
            });
            return;
        }

        // Hide all sections
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

        // Show target section
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Hide hero on navigation
        const heroSection = document.getElementById('hero-section');
        if (heroSection) {
            heroSection.style.display = sectionId === 'dashboard' ? 'flex' : 'none';
        }

        // Init specific logic triggers
        if (sectionId === 'news') {
            news.init();
        }
        if (sectionId === 'admin') {
            adminMode.init();
        }
    }
};

// === Stocks Navigation (Mirror of crypto navigation) ===
const stocksNavigation = {
    init() {
        console.log('🎯 Initializing Stocks Navigation...');

        // Get stocks nav buttons
        const dashboardBtn = document.getElementById('stocks-nav-dashboard');
        const portfolioBtn = document.getElementById('stocks-nav-portfolio');

        console.log('   Dashboard button:', dashboardBtn);
        console.log('   Portfolio button:', portfolioBtn);

        if (!dashboardBtn || !portfolioBtn) {
            console.error('❌ Stocks nav buttons not found!');
            return;
        }

        // Add click listeners
        dashboardBtn.addEventListener('click', () => {
            console.log('📊 Stocks Dashboard clicked');
            this.navigateTo('stocks-dashboard');
        });

        portfolioBtn.addEventListener('click', () => {
            console.log('💼 Stocks Portfolio clicked');
            this.navigateTo('stocks-portfolio');
        });

        console.log('✅ Stocks Navigation initialized');
    },

    navigateTo(viewId) {
        console.log(`🔄 Navigating to: ${viewId}`);

        // Hide all stocks views
        document.querySelectorAll('#stocks-content .view').forEach(v => {
            v.classList.remove('active');
            v.classList.add('hidden');
        });

        // Show target view
        const targetView = document.getElementById(`${viewId}-view`);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.classList.add('active');
            console.log(`✅ Showing view: ${viewId}-view`);

            // Render dashboard data when switching to dashboard
            if (viewId === 'stocks-dashboard' && window.stocksCommodities) {
                window.stocksCommodities.renderDashboard();
                console.log('📊 Dashboard data rendered');
            }
        } else {
            console.error(`❌ View not found: ${viewId}-view`);
        }

        // Update active button
        document.querySelectorAll('#stocks-app-container .nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.getElementById(`${viewId === 'stocks-dashboard' ? 'stocks-nav-dashboard' : 'stocks-nav-portfolio'}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
};

// Export to window for onclick access
window.stocksNavigation = stocksNavigation;

// === News Feed Feature ===
const news = {
    initialized: false,

    async init() {
        if (this.initialized) return; // Prevent multiple fetches

        console.log('📰 Fetching market news...');
        const container = document.getElementById('news-container');
        if (!container) return;

        try {
            // Using a free mock endpoint for realistic appearance since CoinGecko free API doesn't have a reliable /news endpoint
            // We use standard placeholder news or try to fetch from a mock data structure
            this.renderNews(this.getMockNews());
            this.initialized = true;
        } catch (error) {
            console.error('Error fetching news:', error);
            container.innerHTML = '<p class="empty-state">Error al cargar las noticias. Intenta más tarde.</p>';
        }
    },

    getMockNews() {
        return [
            {
                title: "Bitcoin rompe nueva barrera de resistencia mientras los ETFs ganan tracción",
                source: "Crypto Journal",
                date: new Date().toISOString(),
                url: "#",
                image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&auto=format&fit=crop&q=60"
            },
            {
                title: "Ethereum implementará su próxima actualización importante el próximo mes",
                source: "Blockchain Insider",
                date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                url: "#",
                image: "https://images.unsplash.com/photo-1622630998477-20b41cd0e071?w=400&auto=format&fit=crop&q=60"
            },
            {
                title: "Solana reporta un récord en transacciones por segundo (TPS)",
                source: "Tech Finance",
                date: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
                url: "#",
                image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400&auto=format&fit=crop&q=60"
            },
            {
                title: "NVIDIA supera expectativas en el último trimestre impulsando el mercado de IA",
                source: "Wall Street Daily",
                date: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
                url: "#",
                image: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=400&auto=format&fit=crop&q=60"
            }
        ];
    },

    renderNews(newsItems) {
        const container = document.getElementById('news-container');

        if (!newsItems || newsItems.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay noticias disponibles en este momento.</p>';
            return;
        }

        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        container.style.gap = '1.5rem';

        container.innerHTML = newsItems.map(item => `
            <a href="${item.url}" class="news-card" style="display: flex; flex-direction: column; background: rgba(30, 41, 59, 0.5); border-radius: 12px; overflow: hidden; text-decoration: none; color: inherit; border: 1px solid rgba(255,255,255,0.05); transition: transform 0.2s;">
                <img src="${item.image}" alt="News thumbnail" style="width: 100%; height: 160px; object-fit: cover;">
                <div style="padding: 1.25rem;">
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
                        <span>${item.source}</span>
                        <span>${utils.formatDate(item.date)}</span>
                    </div>
                    <h3 style="font-size: 1.1rem; line-height: 1.4; margin-bottom: 0.75rem;">${item.title}</h3>
                    <span style="color: var(--primary); font-size: 0.9rem; font-weight: 500;">Leer más &rarr;</span>
                </div>
            </a>
        `).join('');

        // Add hover effects via JS since styles aren't in a stylesheet right now
        const cards = container.querySelectorAll('.news-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-4px)');
            card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
        });
    }
};

// === Admin Feature ===
const adminMode = {
    init() {
        console.log('👑 Admin panel initialized');
        this.renderUsersList();
        this.setupFundLogic();
    },

    renderUsersList() {
        const listContainer = document.getElementById('admin-users-list');
        const userSelect = document.getElementById('admin-fund-user');

        const users = JSON.parse(localStorage.getItem('criptolive_users') || '[]');

        if (users.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No hay usuarios registrados.</p>';
            userSelect.innerHTML = '<option value="">No hay usuarios</option>';
            return;
        }

        // Render List
        listContainer.innerHTML = users.map(user => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${user.avatar}" alt="Avatar" style="width: 40px; height: 40px; border-radius: 50%;">
                    <div>
                        <div style="font-weight: 600;">${user.name} ${user.isAdmin ? '<span style="color:var(--warning);font-size:0.8rem;">(Admin)</span>' : ''}</div>
                        <div style="font-size: 0.85rem; color: #94a3b8;">${user.email}</div>
                    </div>
                </div>
                <div style="font-size: 0.85rem; font-family: monospace;">
                    ID: ${user.id}
                </div>
            </div>
        `).join('');

        // Populate Select Dropdown
        userSelect.innerHTML = '<option value="">Selecciona un usuario...</option>' +
            users.map(user => `<option value="${user.id}">${user.name} (${user.email})</option>`).join('');
    },

    setupFundLogic() {
        const fundBtn = document.getElementById('admin-fund-btn');
        fundBtn.onclick = () => { // using onclick to easily overwrite
            const userId = document.getElementById('admin-fund-user').value;
            const amount = parseFloat(document.getElementById('admin-fund-amount').value);

            if (!userId) return toast.error('Selecciona un usuario.');
            if (isNaN(amount) || amount <= 0) return toast.error('Cantidad inválida.');

            // Since our system manages CurrentUser session balance locally, 
            // if we fund OURSELVES (Martin), we can modify state directly.
            if (state.currentUser && state.currentUser.id === userId) {
                state.userBalance += amount;
                storage.save();
                dashboard.updateBalance();
                if (window.stocksCommodities) window.stocksCommodities.availableBalance += amount;

                toast.success(`🤑 Te inyectaste $${amount.toLocaleString()} EXITOSAMENTE.`);
                document.getElementById('admin-fund-amount').value = '';
                return;
            }

            // Logic to fund OTHERS (Normally requires backend, here it's mockup)
            toast.success(`Simulación: Fondos asignados a usuario temporalmente. (Requiere un sistema de cuentas persistente en DB para reflejar en sus sesiones).`);
        };
    }
};

// === App Initialization ===
async function initApp() {
    console.log('🚀 Starting App Initialization...');
    try {
        // Initialize Auth first
        if (typeof auth !== 'undefined') {
            await auth.init();
        } else {
            console.error('CRITICAL: Auth module not found!');
        }

        // Load saved data (original step, re-added)
        storage.load();

        navigation.init();
        hero.init();
        portfolio.init();
        await dashboard.init();
        await exchange.init();

        if (typeof simulator !== 'undefined') simulator.init();

        // Render initial data (original step, re-added)
        exchange.renderTransactions();

        // Update hero ticker with dashboard data (original step, re-added)
        hero.updateTicker();

        console.log('✅ CriptoLive ready!');
        toast.success('¡Bienvenido a CriptoLive!'); // Original toast, moved inside try
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        alert('Error iniciando la aplicación: ' + error.message);
    }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Handle Google Sign-In callback (for future implementation)
function handleGoogleSignIn(response) {
    console.log('Google Sign-In response:', response);
    // Implement actual Google OAuth here
    toast.success('Autenticación con Google exitosa');
}
