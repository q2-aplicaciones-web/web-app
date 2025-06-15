<template>
  <div>
    <h3>Shopping Cart</h3>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-if="orders.length === 0">No items in cart.</div>
      <div v-else>
        <div v-for="order in orders" :key="order.orderId" class="cart-item" style="margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img :src="order.projectImage" alt="preview" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;" />
            <div>
              <div><strong>{{ order.projectName }}</strong></div>
              <div>Amount: <strong>{{ order.quantity }}</strong></div>
              <div>{{ currencySymbol }}{{ formatCurrency(order.price) }}</div>
            </div>
          </div>
          <div style="margin-top: 0.5rem;">
            <div>Subtotal: <span style="float:right">{{ currencySymbol }}{{ formatCurrency(order.subtotal) }}</span></div>
            <div>Discount: <span style="float:right">- {{ currencySymbol }}{{ formatCurrency(order.discountAmount) }}</span></div>
            <div><strong>Total: <span style='float:right'>{{ currencySymbol }}{{ formatCurrency(order.total) }}</span></strong></div>
          </div>
        </div>
        <button class="p-button p-component" style="width: 100%; margin-top: 0.5rem;" @click="$router.push({ name: 'shopping-cart', query: { userId: userId, currencyCode: currencyCode } })">View Details</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { getOrdersByUser } from '../services/order.service.js';
import { getDiscountForUser } from '../services/discount-policy.service.js';

const props = defineProps({
  userId: { type: [Number, String], required: true },
  currencyCode: { type: String, default: 'PEN' }
});

const currencySymbol = computed(() => {
  
  const symbols = { PEN: 'PEN', USD: '$', EUR: '€' };
  return symbols[props.currencyCode] || props.currencyCode;
});

const orders = ref([]);
const loading = ref(true);

function formatCurrency(value) {
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: props.currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/^\D+/g, '');
}

async function fetchCart() {
  loading.value = true;
  const rawOrders = await getOrdersByUser(props.userId);
  
  const processed = await Promise.all(rawOrders.map(async (order) => {
    const discount = await getDiscountForUser(order.applied_discounts);
    const subtotal = order.price * order.quantity;
    const discountAmount = discount ? subtotal * (discount.value / 100) : 0;
    const total = subtotal - discountAmount;
    return {
      ...order,
      projectImage: order.projectImage,
      subtotal,
      discountAmount,
      total
    };
  }));
  orders.value = processed;
  loading.value = false;
}

onMounted(fetchCart);
watch(() => props.userId, fetchCart);
</script>

<style scoped>
.cart-item strong {
  font-weight: bold;
}
</style>
