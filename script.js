const products = [
  {
    id: "character-tee",
    name: "Character Graphic Tee",
    category: "Graphic",
    price: 150,
    rating: 4.8,
    badge: "Playful",
    description: "Soft light tee with a fun character print for casual days.",
    image: "30c6baa5-720e-4624-bbe9-a6e60d4c3739.jpg"
  },
  {
    id: "sage-basic-shirt",
    name: "Sage Basic Shirt",
    category: "Basics",
    price: 120,
    rating: 4.6,
    badge: "Everyday",
    description: "Relaxed sage shirt that pairs easily with jeans or shorts.",
    image: "418acffa-1ebe-4a3a-a440-a90c7d61e96d.jpg"
  },
  {
    id: "ribbon-blouse",
    name: "Ribbon Trim Blouse",
    category: "Blouses",
    price: 200,
    rating: 4.9,
    badge: "Chic",
    description: "White blouse with red trim and a sweet ribbon detail.",
    image: "46464591-b154-489f-a1c1-a6836a577fc3.jpg"
  }
];

const state = {
  cart: JSON.parse(localStorage.getItem("eloisa-shop-cart")) || {},
  wishlist: JSON.parse(localStorage.getItem("eloisa-shop-wishlist")) || [],
  category: "All",
  query: "",
  sort: "featured",
  discountRate: 0,
  theme: localStorage.getItem("eloisa-shop-theme") || "light"
};

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const resultLabel = document.querySelector("#result-label");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const wishlistCount = document.querySelector("#wishlist-count");
const productCount = document.querySelector("#product-count");
const subtotalPrice = document.querySelector("#subtotal-price");
const discountPrice = document.querySelector("#discount-price");
const deliveryPrice = document.querySelector("#delivery-price");
const totalPrice = document.querySelector("#total-price");
const miniTotal = document.querySelector("#mini-total");
const couponInput = document.querySelector("#coupon-input");
const couponMessage = document.querySelector("#coupon-message");
const toast = document.querySelector("#toast-message");

function formatPrice(amount) {
  return `PHP ${Math.round(amount).toLocaleString("en-PH")}`;
}

function saveState() {
  localStorage.setItem("eloisa-shop-cart", JSON.stringify(state.cart));
  localStorage.setItem("eloisa-shop-wishlist", JSON.stringify(state.wishlist));
  localStorage.setItem("eloisa-shop-theme", state.theme);
}

function getCartLines() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => {
      const product = products.find((item) => item.id === id);
      return product ? { ...product, quantity } : null;
    })
    .filter(Boolean);
}

function getCartTotals() {
  const subtotal = getCartLines().reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round(subtotal * state.discountRate);
  const delivery = subtotal === 0 || subtotal >= 500 ? 0 : 45;
  return {
    subtotal,
    discount,
    delivery,
    total: Math.max(subtotal - discount + delivery, 0)
  };
}

function getVisibleProducts() {
  const query = state.query.trim().toLowerCase();

  return products
    .filter((product) => state.category === "All" || product.category === state.category)
    .filter((product) => {
      const text = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      return text.includes(query);
    })
    .sort((a, b) => {
      if (state.sort === "price-low") return a.price - b.price;
      if (state.sort === "price-high") return b.price - a.price;
      if (state.sort === "rating") return b.rating - a.rating;
      return products.indexOf(a) - products.indexOf(b);
    });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  productCount.textContent = products.length;
  resultLabel.textContent = `${visibleProducts.length} product${visibleProducts.length === 1 ? "" : "s"} shown`;

  if (!visibleProducts.length) {
    productGrid.innerHTML = `<div class="empty-cart">No products match your search.</div>`;
    return;
  }

  productGrid.innerHTML = visibleProducts.map((product) => {
    const wished = state.wishlist.includes(product.id);

    return `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-body">
          <div class="product-title">
            <div>
              <span class="tag">${product.badge}</span>
              <h3>${product.name}</h3>
            </div>
            <button class="wish-btn ${wished ? "active" : ""}" type="button" data-wish="${product.id}" aria-label="Save ${product.name}">
              <i class="bi ${wished ? "bi-heart-fill" : "bi-heart"}"></i>
            </button>
          </div>
          <p>${product.description}</p>
          <div class="product-meta">
            <span class="price">${formatPrice(product.price)}</span>
            <span class="rating"><i class="bi bi-star-fill"></i> ${product.rating}</span>
          </div>
          <button class="add-btn" type="button" data-add="${product.id}">
            <i class="bi bi-bag-plus"></i>
            Add to cart
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function renderCart() {
  const lines = getCartLines();
  const totals = getCartTotals();
  const itemCount = lines.reduce((sum, item) => sum + item.quantity, 0);

  cartCount.textContent = itemCount;
  wishlistCount.textContent = state.wishlist.length;
  subtotalPrice.textContent = formatPrice(totals.subtotal);
  discountPrice.textContent = `-${formatPrice(totals.discount)}`;
  deliveryPrice.textContent = totals.delivery === 0 ? "Free" : formatPrice(totals.delivery);
  totalPrice.textContent = formatPrice(totals.total);
  miniTotal.textContent = formatPrice(totals.total);

  if (!lines.length) {
    cartItems.innerHTML = `<div class="empty-cart">Your cart is waiting for something good.</div>`;
    return;
  }

  cartItems.innerHTML = lines.map((item) => `
    <div class="cart-line">
      <div>
        <strong>${item.name}</strong>
        <small>${formatPrice(item.price)} each</small>
      </div>
      <div class="line-controls">
        <button class="qty-btn" type="button" data-decrease="${item.id}" aria-label="Decrease ${item.name}">
          <i class="bi bi-dash"></i>
        </button>
        <strong>${item.quantity}</strong>
        <button class="qty-btn" type="button" data-increase="${item.id}" aria-label="Increase ${item.name}">
          <i class="bi bi-plus"></i>
        </button>
      </div>
    </div>
  `).join("");
}

function render() {
  document.body.classList.toggle("dark", state.theme === "dark");
  renderProducts();
  renderCart();
  saveState();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function addToCart(id, quantity = 1) {
  state.cart[id] = (state.cart[id] || 0) + quantity;
  const product = products.find((item) => item.id === id);
  render();
  showToast(`${product.name} added to your cart.`);
}

function toggleWishlist(id) {
  if (state.wishlist.includes(id)) {
    state.wishlist = state.wishlist.filter((item) => item !== id);
  } else {
    state.wishlist.push(id);
  }

  render();
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const wishButton = event.target.closest("[data-wish]");

  if (addButton) addToCart(addButton.dataset.add);
  if (wishButton) toggleWishlist(wishButton.dataset.wish);
});

cartItems.addEventListener("click", (event) => {
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");

  if (increaseButton) {
    state.cart[increaseButton.dataset.increase] += 1;
  }

  if (decreaseButton) {
    const id = decreaseButton.dataset.decrease;
    state.cart[id] -= 1;
    if (state.cart[id] <= 0) delete state.cart[id];
  }

  render();
});

document.querySelectorAll(".category-pill").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category-pill").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.category = button.dataset.category;
    render();
  });
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderProducts();
});

sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

document.querySelector("#clear-cart").addEventListener("click", () => {
  state.cart = {};
  state.discountRate = 0;
  couponInput.value = "";
  couponMessage.textContent = "";
  render();
  showToast("Cart cleared.");
});

document.querySelector("#apply-coupon").addEventListener("click", () => {
  const code = couponInput.value.trim().toUpperCase();

  if (code === "SAVE10") {
    state.discountRate = 0.1;
    couponMessage.textContent = "SAVE10 applied.";
  } else {
    state.discountRate = 0;
    couponMessage.textContent = "Code not valid.";
  }

  render();
});

document.querySelector("#place-order").addEventListener("click", () => {
  if (!getCartLines().length) {
    showToast("Your cart is empty.");
    return;
  }

  state.cart = {};
  state.discountRate = 0;
  couponInput.value = "";
  couponMessage.textContent = "";
  render();
  showToast("Order placed successfully.");
});

document.querySelector("#bundle-btn").addEventListener("click", () => {
  ["character-tee", "sage-basic-shirt", "ribbon-blouse"].forEach((id) => {
    state.cart[id] = (state.cart[id] || 0) + 1;
  });
  render();
  showToast("Style bundle added.");
});

document.querySelector("#theme-toggle").addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  render();
});

render();
