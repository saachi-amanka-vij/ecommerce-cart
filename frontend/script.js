const API = "http://127.0.0.1:3000";

class ECommerceApp {
    constructor() {
        this.products = [];
        this.cart = [];
        this.filteredProducts = [];
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadProducts();
        await this.loadCart();
        this.renderProducts();
    }

    bindEvents() {
        document.getElementById('cartToggle').addEventListener('click', () => this.toggleCart());
        document.getElementById('closeCart').addEventListener('click', () => this.closeCart());
        document.getElementById('overlay').addEventListener('click', () => this.closeCart());
        document.getElementById('clearCart').addEventListener('click', () => this.clearCart());

        document.getElementById('searchBtn').addEventListener('click', () => this.searchProducts());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchProducts();
        });
    }

    async loadProducts() {
        try {
            showLoading();

            const res = await fetch(`${API}/products`);
            if (!res.ok) throw new Error("Error");

            this.products = await res.json();
            this.filteredProducts = [...this.products];

            document.getElementById('error').classList.add('hidden');
        } catch (err) {
            showError();
        } finally {
            hideLoading();
        }
    }

    async loadCart() {
        try {
            const res = await fetch(`${API}/cart`);
            if (res.ok) this.cart = await res.json();
        } catch {
            this.cart = [];
        }
        this.updateCartUI();
    }

    async saveCart() {
        await fetch(`${API}/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.cart)
        });
    }

    renderProducts() {
        const grid = document.getElementById("productsGrid");

        grid.innerHTML = this.filteredProducts.map(p => `
            <div class="product-card">
                <img src="${p.image}" class="product-image">
                <div class="product-name">${p.name}</div>
                <div class="product-price">₹${p.price}</div>
                <button class="add-to-cart-btn" data-id="${p.id}">
                    ${this.isInCart(p.id) ? "Added ✓" : "Add to Cart"}
                </button>
            </div>
        `).join("");

        document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
            btn.onclick = (e) => this.addToCart(parseInt(e.target.dataset.id));
        });
    }

    searchProducts() {
        const query = document.getElementById("searchInput").value.toLowerCase();
        this.filteredProducts = this.products.filter(p =>
            p.name.toLowerCase().includes(query)
        );
        this.renderProducts();
    }

    isInCart(id) {
        return this.cart.some(i => i.id === id);
    }

    addToCart(id) {
        const item = this.cart.find(i => i.id === id);

        if (item) item.quantity++;
        else {
            const product = this.products.find(p => p.id === id);
            this.cart.push({ ...product, quantity: 1 });
        }

        this.saveCart();
        this.updateCartUI();
        this.renderProducts();
    }

    updateQuantity(id, change) {
        const item = this.cart.find(i => i.id === id);

        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            this.removeFromCart(id);
        } else {
            this.saveCart();
            this.updateCartUI();
        }
    }

    removeFromCart(id) {
        this.cart = this.cart.filter(i => i.id !== id);
        this.saveCart();
        this.updateCartUI();
        this.renderProducts();
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    }

    updateCartUI() {
        this.updateCartSummary();
        this.renderCartItems();
    }

    updateCartSummary() {
        const count = this.cart.reduce((sum, i) => sum + i.quantity, 0);
        document.getElementById("cartCount").textContent = count;
    }

    renderCartItems() {
        const list = document.getElementById("cartItems");
        const empty = document.getElementById("emptyCartMessage");
        const footer = document.getElementById("cartFooter");

        if (this.cart.length === 0) {
            empty.classList.remove("hidden");
            footer.classList.add("hidden");
            list.innerHTML = "";
            return;
        }

        empty.classList.add("hidden");
        footer.classList.remove("hidden");

        list.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" class="cart-item-image">
                <div>
                    <div>${item.name}</div>
                    <div>₹${item.price}</div>
                    <div>
                        <button onclick="app.updateQuantity(${item.id}, -1)">−</button>
                        ${item.quantity}
                        <button onclick="app.updateQuantity(${item.id}, 1)">+</button>
                        <button onclick="app.removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            </div>
        `).join("");

        const total = this.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
        document.getElementById("cartTotal").textContent = total;
    }

    toggleCart() {
        document.getElementById("cartSidebar").classList.toggle("open");
        document.getElementById("overlay").classList.toggle("active");
    }

    closeCart() {
        document.getElementById("cartSidebar").classList.remove("open");
        document.getElementById("overlay").classList.remove("active");
    }
}

/* UI STATES */
function showLoading() {
    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("error").classList.add("hidden");
    document.getElementById("productsSection").style.display = "none";
}

function hideLoading() {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("productsSection").style.display = "block";
}

function showError() {
    document.getElementById("error").classList.remove("hidden");
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("productsSection").style.display = "none";
}

/* INIT */
const app = new ECommerceApp();
