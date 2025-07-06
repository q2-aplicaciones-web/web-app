<template>
  <div class="cart-page-grid">
    <div class="cart-list-panel">
      <DataTable :value="cart?.items || []" responsiveLayout="scroll" class="p-datatable-sm">
        <template #header>
          <div class="cart-table-header">
            <span>Item</span>
            <span>Subtotal</span>
            <span>Quantity</span>
          </div>
        </template>
        <Column field="projectName" header="Item">
          <template #body="{ data }">
            <div class="cart-item-row">
              <img :src="data.projectImage" alt="preview" class="cart-img" />
              <div class="cart-item-info">
                <div class="cart-item-title">{{ data.projectName }}</div>
                <div class="cart-item-desc">{{ data.projectDescription }}</div>
              </div>
            </div>
          </template>
        </Column>
        <Column field="subtotal" header="Subtotal">
          <template #body="{ data }">
            <span>{{ currency(data.subtotal) }}</span>
          </template>
        </Column>
        <Column field="quantity" header="Quantity">
          <template #body="{ data }">
            <div class="cart-qty-btns">
              <Button icon="pi pi-minus" @click="decreaseQuantity(data)" text rounded size="small" />
              <span class="cart-qty-value">{{ data.quantity }}</span>
              <Button icon="pi pi-plus" @click="increaseQuantity(data)" text rounded size="small" />
              <Button icon="pi pi-trash" @click="removeItem(data)" text rounded size="small" severity="danger" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <div class="cart-summary-panel">
      <Card class="cart-summary-card">
        <template #title>Summary</template>
        <template #content>
          <div class="cart-summary-row">
            <span>Subtotal:</span>
            <span>{{ currency(subtotal) }}</span>
          </div>
          <div class="cart-summary-row">
            <span>Discount:</span>
            <span>- {{ currency(0) }}</span>
          </div>
          <div class="cart-summary-row cart-summary-total">
            <span>Total:</span>
            <span>{{ currency(subtotal) }}</span>
          </div>
          <Button label="Make Order" class="make-order-btn" />
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import Button from 'primevue/button';
import cartService from '../../orders-processing/services/cart.service.js';
import { CartItem } from '../../orders-processing/models/cart.entity.js';
import { authenticationService } from '../../iam/services/authentication.service.js';

const cart = ref(null);
const userId = ref(null);

function currency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));
}

const subtotal = computed(() => {
  return cart.value?.items?.reduce((sum, i) => sum + i.subtotal, 0) || 0;
});

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

async function loadCart() {
  if (!userId.value) return;
  const carts = await cartService.getCartByUser(userId.value);
  if (carts && carts.length > 0) {
    cart.value = processCartItems(carts[0]);
  } else {
    cart.value = { items: [] };
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
    cart.value = { items: [] };
  }
}

function updateCartOnServer() {
  cartService.updateCart(cart.value).then(updatedCart => {
    cart.value = processCartItems(updatedCart);
  });
}

onMounted(async () => {
  userId.value = authenticationService.currentUserId.value;
  if (!userId.value) {
    throw new Error('User must be authenticated to access shopping cart');
  }
  await loadCart();
});
</script>

<style scoped>
.cart-page-grid {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding: 2rem;
}
.cart-list-panel {
  flex: 2;
}
.cart-summary-panel {
  flex: 1;
  min-width: 320px;
}
.cart-table-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  padding: 0.5rem 1rem;
}
.cart-item-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.cart-img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
}
.cart-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.cart-item-title {
  font-weight: 600;
  font-size: 1.05rem;
}
.cart-item-desc {
  color: #888;
  font-size: 0.95rem;
}
.cart-qty-btns {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.cart-qty-value {
  min-width: 24px;
  text-align: center;
  display: inline-block;
}
.cart-summary-card {
  margin-top: 1rem;
}
.cart-summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 1.05rem;
}
.cart-summary-total {
  font-weight: bold;
  font-size: 1.15rem;
  margin-top: 1rem;
}
</style>
