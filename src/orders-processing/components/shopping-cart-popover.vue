<template>
  <div class="cart-popover">
    <h3>Shopping Cart</h3>
    <template v-if="cart && cart.items.length > 0">
      <div class="cart-items">
        <div class="cart-item" v-for="item in cart.items" :key="item.project_id">
          <img :src="item.projectImage" alt="T-shirt" class="cart-item-img" />
          <div class="cart-item-info">
            <div class="cart-item-title">{{ item.projectName }}</div>
            <div class="cart-item-qty-row">
              <div class="cart-item-qty-btns">
                <Button icon="pi pi-minus" @click="decreaseQuantity(item)" text rounded />
                <span class="cart-item-qty-value">{{ item.quantity }}</span>
                <Button icon="pi pi-plus" @click="increaseQuantity(item)" text rounded />
              </div>
              <a href="#" @click.prevent="removeItem(item)" class="cart-item-remove">Remove</a>
            </div>
            <div class="cart-item-price-row">
              <span>{{ currency(item.unit_price) }}</span>
              <span class="cart-item-subtotal">Subtotal: {{ currency(item.subtotal) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="cart-summary">
        <div class="cart-summary-row">
          <span>Subtotal:</span>
          <span>{{ currency(cart.items.reduce((sum, i) => sum + i.subtotal, 0)) }}</span>
        </div>
        <div class="cart-summary-row cart-summary-total">
          <span>Total:</span>
          <span>{{ currency(cart.items.reduce((sum, i) => sum + i.subtotal, 0)) }}</span>
        </div>
      </div>
      <div class="cart-actions">
        <Button label="View Details" @click="goToCart" outlined />
      </div>
    </template>
    <template v-else>
      <div class="no-orders">You have no items in your cart.</div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Button from 'primevue/button';
import cartService from '../services/cart.service.js';
import { env } from '../../env.js';
import { authenticationService } from '../../iam/services/authentication.service.js';
import { CartItem } from '../models/cart.entity.js';

const cart = ref(null);
const currencyCode = env.currencyCode || 'USD';

function currency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(Number(val));
}

function processCartItems(cartData) {
  cartData.items = (cartData.items || []).map(item => {
    const cartItem = new CartItem();
    cartItem.project_id = item.project_id;
    cartItem.quantity = Number(item.quantity) || 1;
    cartItem.unit_price = Number(item.unit_price) || 0;
    cartItem.projectImage = item.projectImage || '';
    cartItem.projectName = item.projectName || '';
    cartItem.projectDescription = item.projectDescription || '';
    return cartItem;
  });
  return cartData;
}

async function loadCart(userId) {
  if (!userId) return;
  const carts = await cartService.getCartByUser(userId);
  if (carts && carts.length > 0) {
    cart.value = processCartItems(carts[0]);
  } else {
    cart.value = null;
  }
}

function increaseQuantity(item) {
  item.quantity++;
  updateCartOnServer();
}

function decreaseQuantity(item) {
  if (item.quantity > 1) {
    item.quantity--;
    updateCartOnServer();
  }
}

function removeItem(item) {
  cart.value.items = cart.value.items.filter(i => i !== item);
  updateCartOnServer();
  if (cart.value.items.length === 0) {
    cart.value = null;
  }
}

function updateCartOnServer() {
  cartService.updateCart(cart.value).then(updatedCart => {
    cart.value = processCartItems(updatedCart);
  });
}

function goToCart() {
  window.location.href = '/shopping-cart';
}

// Cargar carrito al montar y cuando cambie el usuario
onMounted(async () => {
  const userId = authenticationService.currentUserId.value || props.userId;
  if (userId) {
    await loadCart(userId);
  }
});

watch(
  () => authenticationService.currentUserId.value || props.userId,
  async (newUserId, oldUserId) => {
    if (newUserId && newUserId !== oldUserId) {
      await loadCart(newUserId);
    }
  }
);
</script>

<style scoped>
.cart-popover {
  min-width: 250px;
  max-width: 400px;
  overflow-x: hidden;
  display: inline-block;
  padding: 16px;
}
.cart-items {
  margin-bottom: 12px;
}
.cart-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}
.cart-item-img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  margin-right: 10px;
  object-fit: cover;
}
.cart-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cart-item-title {
  font-weight: 500;
  margin-bottom: 2px;
}
.cart-item-qty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}
.cart-item-qty-btns {
  display: flex;
  align-items: center;
  gap: 4px;
}
.cart-item-qty-value {
  min-width: 20px;
  text-align: center;
  display: inline-block;
}
.cart-item-remove {
  color: #1976d2;
  text-decoration: underline;
  margin-left: 12px;
  font-size: 0.95em;
  cursor: pointer;
}
.cart-item-price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.98em;
  color: #222;
}
.cart-item-subtotal {
  margin-left: 8px;
  color: #888;
}
.cart-summary {
  font-size: 15px;
  margin-bottom: 12px;
  margin-top: 8px;
}
.cart-summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}
.cart-summary-total {
  font-weight: bold;
  font-size: 1.08em;
}
.cart-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.no-orders {
  text-align: center;
  color: #888;
  padding: 16px 0 8px 0;
}
</style>
