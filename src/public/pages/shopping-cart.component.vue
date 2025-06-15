<template>
  <div class="cart-page-grid">
    <div v-if="!userId" style="color: #fff; font-size: 1.5rem; margin: auto;">
      Usuario no válido
    </div>
    <template v-else>
      <div class="cart-orders">
        <h3>Shopping Cart</h3>
        <div v-if="loading">Loading...</div>
        <div v-else>
          <div v-if="orders.length === 0">No items in cart.</div>
          <div v-else>
            <div v-for="order in orders" :key="order.orderId" class="cart-item">
              <div class="cart-item-row">
                <img :src="order.projectImage" alt="preview" class="cart-img" />
                <div class="cart-item-info">
                  <div><strong>{{ order.projectName }}</strong></div>
                  <div>{{ order.description }}</div>
                  <div>Unit price: {{ currencySymbol }}{{ formatCurrency(order.price) }}</div>
                </div>
                <div class="cart-qty">
                  <button aria-label="Decrease quantity">−</button>
                  <span>{{ order.quantity }}</span>
                  <button aria-label="Increase quantity">+</button>
                </div>
                <div class="cart-item-summary">
                  <div>Order subtotal: <span>{{ currencySymbol }}{{ formatCurrency(order.subtotal) }}</span></div>
                  <div>- Discount: <span>{{ currencySymbol }}{{ formatCurrency(order.discountAmount) }} ({{ order.discountPercent }}%)</span></div>
                  <div><strong>Order total: <span>{{ currencySymbol }}{{ formatCurrency(order.total) }}</span></strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="cart-side-info">
        <div class="cart-address">
          <h4>Shipping Address</h4>
          <div v-if="address">
            <div>Address: <strong>{{ address.address }}</strong></div>
            <div>City: <strong>{{ address.city }}</strong></div>
            <div>Country: <strong>{{ address.country }}</strong></div>
            <div>State: <strong>{{ address.state }}</strong></div>
            <div>ZIP: <strong>{{ address.zip }}</strong></div>
            <span style="font-size: 1.2rem; cursor: pointer;">✎</span>
          </div>
          <div v-else>No address found.</div>
        </div>
        <div class="cart-summary">
          <h4>Summary</h4>
          <div>Subtotal: <span style="float:right">{{ currencySymbol }}{{ formatCurrency(summary.subtotal) }}</span></div>
          <div>Shipping: <span style="float:right">{{ currencySymbol }}{{ formatCurrency(summary.shipping) }}</span></div>
          <div>Discount: <span style="float:right">- {{ currencySymbol }}{{ formatCurrency(summary.discount) }}</span></div>
          <hr />
          <div><strong>Total: <span style="float:right">{{ currencySymbol }}{{ formatCurrency(summary.total) }}</span></strong></div>
          <button class="p-button p-component cart-order-btn">Make order</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getOrdersByUser } from '../../orders-processing/services/order.service.js';
import { getDiscountForUser } from '../../orders-processing/services/discount-policy.service.js';
import { useRoute } from 'vue-router';

const route = useRoute();
const userId = route.query.userId;
const currencyCode = route.query.currencyCode;

const currencySymbol = computed(() => {
  const symbols = { PEN: 'PEN', USD: '$', EUR: '€' };
  return symbols[currencyCode] || currencyCode;
});

const orders = ref([]);
const loading = ref(true);
const address = ref(null);
const summary = ref({ subtotal: 0, shipping: 0, discount: 0, total: 0 });

function formatCurrency(value) {
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/^\D+/g, '');
}

async function fetchAddress() {
  // Busca el perfil y la dirección del usuario
  const res = await fetch(`/server/db.json`);
  const db = await res.json();
  const profile = db.profiles.find(p => p.user_id === userId);
  address.value = profile && profile.addresses && profile.addresses[0] ? profile.addresses[0] : null;
}

async function fetchCart() {
  loading.value = true;
  const rawOrders = await getOrdersByUser(userId);
  let subtotal = 0;
  let discount = 0;
  const processed = await Promise.all(rawOrders.map(async (order) => {
    const discountObj = await getDiscountForUser(order.applied_discounts);
    const orderSubtotal = order.price * order.quantity;
    const orderDiscount = discountObj ? orderSubtotal * (discountObj.value / 100) : 0;
    const orderTotal = orderSubtotal - orderDiscount;
    subtotal += orderSubtotal;
    discount += orderDiscount;
    return {
      ...order,
      projectImage: order.projectImage || 'https://picsum.photos/120/80',
      subtotal: orderSubtotal,
      discountAmount: orderDiscount,
      discountPercent: discountObj ? discountObj.value : 0,
      total: orderTotal
    };
  }));
  orders.value = processed;
  // Shipping fijo de ejemplo
  const shipping = processed.length > 0 ? 15 : 0;
  summary.value = {
    subtotal,
    shipping,
    discount,
    total: subtotal + shipping - discount
  };
  loading.value = false;
}

if (!userId) {
  // No cargar nada si no hay usuario
} else {
  onMounted(() => {
    fetchCart();
    fetchAddress();
  });
}
</script>

<style scoped>
.cart-page-grid {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding: 2rem; 
}
.cart-orders {
  flex: 2;
  background: #111;
  color: #fff;
  border-radius: 0 0 0 0;
}
.cart-side-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.cart-item {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
}
.cart-item-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.cart-img {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}
.cart-item-info {
  min-width: 180px;
}
.cart-qty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}
.cart-item-summary {
  min-width: 220px;
  margin-left: 2rem;
  color: #fff;
}
.cart-address, .cart-summary {
  background: #181818;
  color: #fff;
  border-radius: 18px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
}
.cart-address h4, .cart-summary h4 {
  color: #fff;
}
.cart-order-btn {
  width: 100%;
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 18px;
  background: #2de3b6;
  color: #111;
  border: none;
}
</style>
