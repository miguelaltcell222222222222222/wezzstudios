const socket = io();
let currentUser = null;
let currentCategory = 'all';
let searchQuery = '';

async function initializeUser() {
    const checkResponse = await fetch('/api/check-user');
    const checkData = await checkResponse.json();

    if (checkData.userId) {
        currentUser = checkData.userId;
    } else {
        const assignResponse = await fetch('/api/assign-user', { method: 'POST' });
        const assignData = await assignResponse.json();
        currentUser = assignData.userId;
    }

    document.getElementById('usernameDisplay').textContent = currentUser;
}

async function loadProducts() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '<div class="loading">Laddar produkter...</div>';

    const params = new URLSearchParams();
    if (currentCategory !== 'all') {
        params.append('category', currentCategory);
    }
    if (searchQuery) {
        params.append('search', searchQuery);
    }

    try {
        const response = await fetch(`/api/products?${params}`);
        const products = await response.json();

        if (products.length === 0) {
            container.innerHTML = '<div class="loading">Inga produkter hittades</div>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card" onclick="showProductDetails('${product.id}')">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=Bild+saknas'">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-footer">
                        <span class="product-price">${product.price} SEK</span>
                        <span class="product-stock ${getStockClass(product.stock)}">${getStockText(product.stock)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<div class="loading">Fel vid laddning av produkter</div>';
    }
}

function getStockClass(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock < 5) return 'low-stock';
    return 'in-stock';
}

function getStockText(stock) {
    if (stock === 0) return 'Slut i lager';
    if (stock < 5) return `Få kvar (${stock})`;
    return `I lager (${stock})`;
}

async function showProductDetails(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();

        const modal = document.getElementById('productModal');
        const details = document.getElementById('productDetails');

        details.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-detail-image" onerror="this.src='https://via.placeholder.com/600x300?text=Bild+saknas'">
            <div class="product-detail-info">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">${product.price} SEK</span>
                    <span class="product-stock ${getStockClass(product.stock)}">${getStockText(product.stock)}</span>
                </div>
                <button onclick="startChat('${product.id}', '${product.name}')" class="btn-primary" style="width: 100%; margin-top: 1.5rem;">
                    💬 Kontakta Admin för Köp
                </button>
            </div>
        `;

        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

function startChat(productId, productName) {
    window.location.href = `/chat.html?product=${productId}&name=${encodeURIComponent(productName)}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeUser();
    await loadProducts();

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            loadProducts();
        });
    });

    document.getElementById('searchBtn').addEventListener('click', () => {
        searchQuery = document.getElementById('searchInput').value;
        loadProducts();
    });

    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchQuery = e.target.value;
            loadProducts();
        }
    });

    document.getElementById('chatBtn').addEventListener('click', () => {
        window.location.href = '/chat.html';
    });

    const modal = document.getElementById('productModal');
    const closeBtn = modal.querySelector('.close');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});