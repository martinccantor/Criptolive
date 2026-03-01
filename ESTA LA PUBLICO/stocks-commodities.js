// Stocks & Commodities Module
console.log('🚀🚀🚀 STOCKS-COMMODITIES.JS LOADED v9 🚀🚀🚀');

const stocksCommodities = {
    data: [
        { id: 'gold', name: 'Oro (XAU)', symbol: 'GOLD', type: 'commodity', price: 2045.50, change: 0.85, icon: '🧈' },
        { id: 'silver', name: 'Plata (XAG)', symbol: 'SILV', type: 'commodity', price: 24.10, change: 1.2, icon: '⚪' },
        { id: 'oil', name: 'Petróleo WTI', symbol: 'OIL', type: 'commodity', price: 78.20, change: -1.2, icon: '🛢️' },
        { id: 'ngas', name: 'Gas Natural', symbol: 'NGAS', type: 'commodity', price: 1.85, change: -0.5, icon: '🔥' },
        { id: 'copper', name: 'Cobre', symbol: 'HG', type: 'commodity', price: 3.85, change: 2.1, icon: '🥉' },
        { id: 'corn', name: 'Maíz', symbol: 'CORN', type: 'commodity', price: 420.50, change: 0.3, icon: '🌽' },
        { id: 'aapl', name: 'Apple Inc.', symbol: 'AAPL', type: 'stock', price: 182.50, change: 1.45, icon: '🍎' },
        { id: 'tsla', name: 'Tesla Inc.', symbol: 'TSLA', type: 'stock', price: 198.80, change: -2.1, icon: '🚗' },
        { id: 'msft', name: 'Microsoft', symbol: 'MSFT', type: 'stock', price: 415.20, change: 0.55, icon: '💻' },
        { id: 'nvda', name: 'NVIDIA', symbol: 'NVDA', type: 'stock', price: 785.40, change: 3.2, icon: '🎮' },
        { id: 'amzn', name: 'Amazon', symbol: 'AMZN', type: 'stock', price: 174.99, change: 0.8, icon: '📦' },
        { id: 'meta', name: 'Meta Platforms', symbol: 'META', type: 'stock', price: 484.03, change: 1.1, icon: '♾️' }
    ],

    // Simulated portfolio holdings for demonstration
    holdings: [
        { id: 'aapl', amount: 15, avgBuyPrice: 175.20 },
        { id: 'gold', amount: 2.5, avgBuyPrice: 2010.00 },
        { id: 'nvda', amount: 5, avgBuyPrice: 700.50 }
    ],

    // Transaction history
    transactions: [
        { id: 'tx-1', type: 'buy', assetId: 'aapl', amount: 10, price: 170.00, total: 1700.00, date: new Date(Date.now() - 86400000 * 5) },
        { id: 'tx-2', type: 'buy', assetId: 'gold', amount: 2.5, price: 2010.00, total: 5025.00, date: new Date(Date.now() - 86400000 * 3) },
        { id: 'tx-3', type: 'buy', assetId: 'nvda', amount: 5, price: 700.50, total: 3502.50, date: new Date(Date.now() - 86400000 * 2) },
        { id: 'tx-4', type: 'buy', assetId: 'aapl', amount: 5, price: 185.60, total: 928.00, date: new Date(Date.now() - 86400000 * 1) }
    ],

    // Simulated user balance (liquidity)
    availableBalance: 4500.00,

    init() {
        console.log('📈 Initializing Stocks/Commodities module...');
        this.renderDashboard();
        this.renderPortfolio();
        this.setupNavigation();
        this.setupExchangeLogic();
        this.renderTransactionHistory();
    },

    setupNavigation() {
        // Get navigation buttons
        const dashboardBtn = document.getElementById('stocks-nav-dashboard');
        const exchangeBtn = document.getElementById('stocks-nav-exchange');
        const portfolioBtn = document.getElementById('stocks-nav-portfolio');

        console.log('🔍 Dashboard button:', dashboardBtn);
        console.log('🔍 Exchange button:', exchangeBtn);
        console.log('🔍 Portfolio button:', portfolioBtn);

        if (!dashboardBtn || !portfolioBtn || !exchangeBtn) {
            console.error('❌ Stocks navigation buttons not found');
            return;
        }

        // Dashboard button
        dashboardBtn.addEventListener('click', () => {
            console.log('🖱️ DASHBOARD BUTTON CLICKED!');
            this.switchView('stocks-dashboard-view');
            this.setActiveButton(dashboardBtn);
        });

        // Exchange button
        exchangeBtn.addEventListener('click', () => {
            console.log('🖱️ EXCHANGE BUTTON CLICKED!');
            this.switchView('stocks-exchange-view');
            this.setActiveButton(exchangeBtn);
            this.updateExchangeSelects(); // Update dropdowns when opening exchange
        });

        // Portfolio button
        portfolioBtn.addEventListener('click', () => {
            console.log('🖱️ PORTFOLIO BUTTON CLICKED!');
            this.switchView('stocks-portfolio-view');
            this.setActiveButton(portfolioBtn);
            this.renderPortfolioChart(); // Render chart when switching to portfolio
        });

        console.log('✅ Stocks navigation setup complete');
    },

    switchView(viewId) {
        console.log(`🔄 Attempting to switch to view: ${viewId}`);

        // Hide all views
        const allViews = document.querySelectorAll('#stocks-content .view');
        console.log(`   Found ${allViews.length} views in stocks-content`);

        allViews.forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });

        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.classList.add('active');
            console.log(`✅ Successfully switched to view: ${viewId}`);
        } else {
            console.error(`❌ View not found: ${viewId}`);
        }
    },

    setActiveButton(activeBtn) {
        // Remove active class from all nav buttons in stocks sidebar
        document.querySelectorAll('#stocks-app-container .nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        activeBtn.classList.add('active');
    },

    renderDashboard() {
        console.log('🎨 renderDashboard called');
        const list = document.getElementById('stocks-list');
        console.log('   stocks-list element:', list);

        if (!list) {
            console.error('❌ stocks-list not found!');
            return;
        }

        // Separate commodities and stocks
        const commodities = this.data.filter(a => a.type === 'commodity');
        const stocks = this.data.filter(a => a.type === 'stock');

        const renderCard = (asset) => `
            <div class="crypto-card" style="border-left: 4px solid ${asset.change >= 0 ? 'var(--success)' : 'var(--error)'}">
                <div class="crypto-header">
                    <div class="crypto-info">
                        <span style="font-size: 2rem;">${asset.icon}</span>
                        <div class="crypto-name-section">
                            <div class="crypto-name">${asset.name}</div>
                            <div class="crypto-symbol">${asset.symbol || asset.type.toUpperCase()}</div>
                        </div>
                    </div>
                </div>
                <div class="crypto-price">$${asset.price.toFixed(2)}</div>
                <div class="crypto-change ${asset.change >= 0 ? 'positive' : 'negative'}">
                    ${asset.change >= 0 ? '↑' : '↓'} ${Math.abs(asset.change)}%
                </div>
            </div>
        `;

        const renderSection = (title, icon, items) => `
            <div class="market-section" style="margin-bottom: 2.5rem; width: 100%;">
                <h2 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; padding-left: 1rem; border-left: 4px solid var(--primary-light);">
                    <span style="font-size: 1.5rem;">${icon}</span> ${title}
                </h2>
                <div class="assets-grid">
                    ${items.map(renderCard).join('')}
                </div>
            </div>
        `;

        list.innerHTML = renderSection('Materias Primas', '🛢️', commodities) + renderSection('Acciones Globales', '🏢', stocks);
        console.log(`✅ Rendered ${this.data.length} assets divided into sections`);
    },

    renderPortfolio() {
        console.log('💼 renderPortfolio called');

        // 1. Calculate Statistics
        let investedTotal = 0;
        let currentValueTotal = 0;

        const holdingsListHtml = this.holdings.map(holding => {
            const asset = this.data.find(a => a.id === holding.id);
            if (!asset) return '';

            const invested = holding.amount * holding.avgBuyPrice;
            const current = holding.amount * asset.price;
            const profitLoss = current - invested;
            const profitPercent = (profitLoss / invested) * 100;

            investedTotal += invested;
            currentValueTotal += current;

            return `
                <div class="transaction-item" style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span style="font-size: 1.5rem;">${asset.icon}</span>
                        <div>
                            <div style="font-weight: 600;">${asset.name}</div>
                            <div style="font-size: 0.85rem; color: #94a3b8;">${holding.amount} ${asset.symbol} @ $${holding.avgBuyPrice.toFixed(2)}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600;">$${current.toFixed(2)}</div>
                        <div class="${profitPercent >= 0 ? 'positive' : 'negative'}" style="font-size: 0.85rem;">
                            ${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(2)}% ($${profitLoss.toFixed(2)})
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const totalProfitLoss = currentValueTotal - investedTotal;
        const totalProfitPercent = investedTotal > 0 ? (totalProfitLoss / investedTotal) * 100 : 0;
        const totalBalance = this.availableBalance + currentValueTotal;

        // 2. Update DOM Elements
        const elTotalBalance = document.getElementById('stocks-total-balance');
        const elInvestedTotal = document.getElementById('stocks-invested-total');
        const elProfitLoss = document.getElementById('stocks-profit-loss');
        const elProfitPercent = document.getElementById('stocks-profit-percent');
        const elAvailableBalance = document.getElementById('stocks-available-balance');
        const elHoldingsList = document.getElementById('stocks-holdings-list');

        if (elTotalBalance) elTotalBalance.textContent = `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        if (elInvestedTotal) {
            elInvestedTotal.textContent = `$${investedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            // Update the sibling change element with the count
            const countSibling = elInvestedTotal.nextElementSibling;
            if (countSibling) countSibling.textContent = `${this.holdings.length} activos`;
        }

        if (elProfitLoss) elProfitLoss.textContent = `${totalProfitLoss >= 0 ? '+' : ''}$${totalProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        if (elProfitPercent) {
            elProfitPercent.textContent = `${totalProfitPercent >= 0 ? '↑' : '↓'} ${Math.abs(totalProfitPercent).toFixed(2)}%`;
            elProfitPercent.className = `stat-change ${totalProfitPercent >= 0 ? 'positive' : 'negative'}`;
        }

        if (elAvailableBalance) elAvailableBalance.textContent = `$${this.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        if (elHoldingsList) {
            elHoldingsList.innerHTML = this.holdings.length > 0 ? holdingsListHtml : '<p class="empty-state">No tienes inversiones en acciones o materias primas</p>';
        }

        console.log('✅ Portfolio statistics updated');
    },

    setupExchangeLogic() {
        console.log('⚙️ Setting up exchange logic...');

        // Buy Select Change Event
        const buySelect = document.getElementById('stocks-buy-select');
        const buyAmountInput = document.getElementById('stocks-buy-amount');
        const buyBtn = document.getElementById('stocks-buy-btn');

        if (buySelect) {
            buySelect.addEventListener('change', (e) => {
                const assetId = e.target.value;
                const asset = this.data.find(a => a.id === assetId);

                if (asset) {
                    document.getElementById('stocks-buy-current-price').textContent = `$${asset.price.toFixed(2)}`;
                    document.getElementById('stocks-buy-asset-symbol').textContent = asset.symbol;
                    this.updateBuyPreview();
                } else {
                    document.getElementById('stocks-buy-current-price').textContent = '$0.00';
                    document.getElementById('stocks-buy-asset-symbol').textContent = '';
                }
            });
        }

        if (buyAmountInput) {
            buyAmountInput.addEventListener('input', () => this.updateBuyPreview());
        }

        if (buyBtn) {
            buyBtn.addEventListener('click', () => this.handleBuy());
        }

        // Sell Select Change Event
        const sellSelect = document.getElementById('stocks-sell-select');
        const sellAmountInput = document.getElementById('stocks-sell-amount');
        const sellBtn = document.getElementById('stocks-sell-btn');
        const sellModeRadios = document.querySelectorAll('input[name="stocks-sell-mode"]');

        if (sellSelect) {
            sellSelect.addEventListener('change', (e) => {
                const assetId = e.target.value;
                const holding = this.holdings.find(h => h.id === assetId);
                const asset = this.data.find(a => a.id === assetId);

                if (holding && asset) {
                    document.getElementById('stocks-sell-available').textContent = `${holding.amount} ${asset.symbol}`;
                    this.updateSellPreview();
                } else {
                    document.getElementById('stocks-sell-available').textContent = '0';
                }
            });
        }

        if (sellAmountInput) {
            sellAmountInput.addEventListener('input', () => this.updateSellPreview());
        }

        if (sellModeRadios) {
            sellModeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    const partialGroup = document.getElementById('stocks-partial-amount-group');
                    if (e.target.value === 'partial') {
                        partialGroup.style.display = 'block';
                    } else {
                        partialGroup.style.display = 'none';
                    }
                    this.updateSellPreview();
                });
            });
        }

        if (sellBtn) {
            sellBtn.addEventListener('click', () => this.handleSell());
        }
    },

    updateExchangeSelects() {
        const buySelect = document.getElementById('stocks-buy-select');
        const sellSelect = document.getElementById('stocks-sell-select');

        if (buySelect) {
            buySelect.innerHTML = '<option value="">Selecciona un activo...</option>' +
                this.data.map(asset => `<option value="${asset.id}">${asset.icon} ${asset.name} (${asset.symbol}) - $${asset.price.toFixed(2)}</option>`).join('');
        }

        if (sellSelect) {
            if (this.holdings.length === 0) {
                sellSelect.innerHTML = '<option value="">No tienes activos para vender</option>';
            } else {
                sellSelect.innerHTML = '<option value="">Selecciona un activo...</option>' +
                    this.holdings.map(holding => {
                        const asset = this.data.find(a => a.id === holding.id);
                        return `<option value="${asset.id}">${asset.icon} ${asset.name} (${holding.amount} disponibles)</option>`;
                    }).join('');
            }
        }

        document.getElementById('stocks-buy-available-balance').textContent = `$${this.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    },

    updateBuyPreview() {
        const select = document.getElementById('stocks-buy-select');
        const input = document.getElementById('stocks-buy-amount');
        const preview = document.getElementById('stocks-buy-asset-amount');

        if (!select.value || !input.value) {
            preview.textContent = '0';
            return;
        }

        const asset = this.data.find(a => a.id === select.value);
        const amountUSD = parseFloat(input.value);

        if (asset && !isNaN(amountUSD)) {
            const assetAmount = amountUSD / asset.price;
            preview.textContent = assetAmount.toFixed(6);
        }
    },

    updateSellPreview() {
        const select = document.getElementById('stocks-sell-select');
        const input = document.getElementById('stocks-sell-amount');
        const totalPreview = document.getElementById('stocks-sell-total-value');
        const mode = document.querySelector('input[name="stocks-sell-mode"]:checked').value;

        if (!select.value) {
            totalPreview.textContent = '$0.00';
            return;
        }

        const asset = this.data.find(a => a.id === select.value);
        const holding = this.holdings.find(h => h.id === select.value);

        if (!asset || !holding) return;

        let amountToSell = 0;
        if (mode === 'all') {
            amountToSell = holding.amount;
        } else {
            amountToSell = parseFloat(input.value) || 0;
            // Cap at max available
            if (amountToSell > holding.amount) amountToSell = holding.amount;
        }

        const valueUSD = amountToSell * asset.price;
        totalPreview.textContent = `$${valueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    handleBuy() {
        const select = document.getElementById('stocks-buy-select');
        const input = document.getElementById('stocks-buy-amount');
        const assetId = select.value;
        const amountUSD = parseFloat(input.value);

        if (!assetId || isNaN(amountUSD) || amountUSD <= 0) {
            alert('Por favor selecciona un activo y una cantidad válida.');
            return;
        }

        if (amountUSD > this.availableBalance) {
            alert('Fondos insuficientes.');
            return;
        }

        const asset = this.data.find(a => a.id === assetId);
        const assetAmount = amountUSD / asset.price;

        // Deduct balance
        this.availableBalance -= amountUSD;

        // Update holdings
        const existingHolding = this.holdings.find(h => h.id === assetId);
        if (existingHolding) {
            const totalInvested = (existingHolding.amount * existingHolding.avgBuyPrice) + amountUSD;
            existingHolding.amount += assetAmount;
            existingHolding.avgBuyPrice = totalInvested / existingHolding.amount;
        } else {
            this.holdings.push({
                id: assetId,
                amount: assetAmount,
                avgBuyPrice: asset.price
            });
        }

        // Add to transactions
        this.transactions.unshift({
            id: `tx-${Date.now()}`,
            type: 'buy',
            assetId: assetId,
            amount: assetAmount,
            price: asset.price,
            total: amountUSD,
            date: new Date()
        });

        // Reset UI
        input.value = '';
        this.updateBuyPreview();
        this.updateExchangeSelects();
        this.renderPortfolio();
        this.renderTransactionHistory();

        // Show success notification (using simple alert if toast system is unavailable in current context)
        alert(`¡Compraste exitosamente ${asset.name}!`);
    },

    handleSell() {
        const select = document.getElementById('stocks-sell-select');
        const input = document.getElementById('stocks-sell-amount');
        const mode = document.querySelector('input[name="stocks-sell-mode"]:checked').value;
        const assetId = select.value;

        if (!assetId) {
            alert('Por favor selecciona un activo para vender.');
            return;
        }

        const holding = this.holdings.find(h => h.id === assetId);
        const asset = this.data.find(a => a.id === assetId);

        if (!holding || !asset) return;

        let amountToSell = 0;
        if (mode === 'all') {
            amountToSell = holding.amount;
        } else {
            amountToSell = parseFloat(input.value);
            if (isNaN(amountToSell) || amountToSell <= 0 || amountToSell > holding.amount) {
                alert('Cantidad inválida.');
                return;
            }
        }

        const valueUSD = amountToSell * asset.price;

        // Add balance
        this.availableBalance += valueUSD;

        // Update holdings
        holding.amount -= amountToSell;
        if (holding.amount <= 0.000001) { // Floating point precision check
            this.holdings = this.holdings.filter(h => h.id !== assetId);
        }

        // Add to transactions
        this.transactions.unshift({
            id: `tx-${Date.now()}`,
            type: 'sell',
            assetId: assetId,
            amount: amountToSell,
            price: asset.price,
            total: valueUSD,
            date: new Date()
        });

        // Reset UI
        if (mode === 'partial') input.value = '';
        this.updateSellPreview();
        this.updateExchangeSelects();
        this.renderPortfolio();
        this.renderTransactionHistory();

        alert(`¡Vendiste exitosamente ${amountToSell.toFixed(4)} ${asset.symbol}!`);
    },

    renderTransactionHistory() {
        const container = document.getElementById('stocks-transaction-list');
        if (!container) return;

        if (this.transactions.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay transacciones aún</p>';
            return;
        }

        container.innerHTML = this.transactions.map(tx => {
            const asset = this.data.find(a => a.id === tx.assetId);
            const isBuy = tx.type === 'buy';
            const dateStr = tx.date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            return `
                <div class="transaction-item" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding: 1rem 0; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${isBuy ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 82, 82, 0.1)'}; color: ${isBuy ? 'var(--success)' : 'var(--error)'}; font-size: 1.2rem;">
                            ${isBuy ? '↓' : '↑'}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${isBuy ? 'Compra' : 'Venta'} ${asset ? asset.symbol : 'Activo'}</div>
                            <div style="font-size: 0.85rem; color: #94a3b8;">${dateStr}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600; color: ${isBuy ? 'var(--success)' : 'var(--error)'};">
                            ${isBuy ? '-' : '+'}$${tx.total.toFixed(2)}
                        </div>
                        <div style="font-size: 0.85rem; color: #94a3b8;">
                            ${tx.amount.toFixed(4)} @ $${tx.price.toFixed(2)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderPortfolioChart() {
        const canvas = document.getElementById('stocks-portfolio-chart');
        if (!canvas) return;

        // If chart already exists, destroy it
        if (this.portfolioChart) {
            this.portfolioChart.destroy();
        }

        if (this.holdings.length === 0) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const labels = [];
        const data = [];
        const backgroundColors = [
            '#FF6B35', '#00D4FF', '#FF1493', '#00E676', '#9C27B0', '#FFD600', '#00BCD4'
        ];

        this.holdings.forEach((holding, index) => {
            const asset = this.data.find(a => a.id === holding.id);
            if (asset) {
                labels.push(asset.name);
                data.push(holding.amount * asset.price);
            }
        });

        // Include available balance as part of portfolio
        labels.push('Liquidez (USD)');
        data.push(this.availableBalance);

        const ctx = canvas.getContext('2d');
        this.portfolioChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#cbd5e1',
                            font: {
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
};

// Export to window so app.js can access it
window.stocksCommodities = stocksCommodities;
console.log('✅ stocksCommodities exported to window');

// Global helper functions for direct onclick usage
window.showStocksDashboard = function () {
    console.log('🎯 showStocksDashboard called');
    const dashboard = document.getElementById('stocks-dashboard-view');
    const portfolio = document.getElementById('stocks-portfolio-view');

    if (dashboard && portfolio) {
        dashboard.classList.remove('hidden');
        dashboard.classList.add('active');
        portfolio.classList.add('hidden');
        portfolio.classList.remove('active');
        console.log('✅ Switched to dashboard view');
    }
};

window.showStocksPortfolio = function () {
    console.log('🎯 showStocksPortfolio called');
    const dashboard = document.getElementById('stocks-dashboard-view');
    const portfolio = document.getElementById('stocks-portfolio-view');

    if (dashboard && portfolio) {
        portfolio.classList.remove('hidden');
        portfolio.classList.add('active');
        dashboard.classList.add('hidden');
        dashboard.classList.remove('active');
        console.log('✅ Switched to portfolio view');
    }
};
