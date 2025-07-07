<template>
  <div class="cart-popover">
    <h3>{{ $t('cart.title') }}</h3>
    <template v-if="cartProducts && cartProducts.length > 0">
      <div class="cart-items">
        <div class="cart-item" v-for="product in cartProducts" :key="product.id">
          <img 
            :src="product.previewUrl || product.imageUrl || 'https://res.cloudinary.com/dnkmbpkmj/image/upload/v1735862401/tshirt-outline_lgb60q.svg'" 
            alt="Product" 
            class="cart-item-img" 
          />
          <div class="cart-item-info">
            <div class="cart-item-title">{{ product.name || product.projectTitle }}</div>
            <div class="cart-item-details">
              <span v-if="product.garmentColor" class="cart-badge cart-color">{{ $t('product.color') }}: {{ product.garmentColor }}</span>
              <span v-if="product.garmentSize" class="cart-badge cart-size">{{ $t('product.size') }}: {{ product.garmentSize }}</span>
              <span v-if="product.garmentGender" class="cart-badge cart-gender">{{ $t('product.gender') }}: {{ product.garmentGender }}</span>
            </div>
            <div class="cart-item-qty-row">
              <div class="cart-item-qty-btns">
                <Button icon="pi pi-minus" @click="decreaseQuantity(product)" text rounded :disabled="loading" />
                <span class="cart-item-qty-value">{{ product.cartQuantity }}</span>
                <Button icon="pi pi-plus" @click="increaseQuantity(product)" text rounded :disabled="loading" />
              </div>
              <a href="#" @click.prevent="removeItem(product)" class="cart-item-remove">{{ $t('cart.remove') }}</a>
            </div>
            <div class="cart-item-price-row">
              <span>{{ currency(product.priceAmount) }}</span>
              <span class="cart-item-subtotal">{{ $t('cart.subtotal') }}: {{ currency(product.subtotal) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="cart-summary">
        <div class="cart-summary-row">
          <span>{{ $t('cart.subtotal') }}:</span>
          <span>{{ currency(cartSummary.totalAmount) }}</span>
        </div>
        <div class="cart-summary-row cart-summary-total">
          <span><strong>{{ $t('cart.total') }}:</strong></span>
          <span><strong>{{ currency(cartSummary.totalAmount) }}</strong></span>
        </div>
        <div class="cart-actions">
          <Button 
            :label="$t('cart.clearCart')" 
            severity="secondary" 
            outlined 
            @click="clearCart" 
            :disabled="loading"
            class="mr-2"
          />
          <Button 
            :label="$t('cart.checkout')" 
            severity="primary" 
            @click="goToCheckout"
            :disabled="loading || cartProducts.length === 0"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="cart-empty">
        <div class="cart-empty-icon">
          <i class="pi pi-shopping-cart" style="font-size: 2rem; color: var(--text-color-secondary);"></i>
        </div>
        <p class="cart-empty-text">{{ $t('cart.empty') }}</p>
        <Button 
          :label="$t('cart.startShopping')" 
          severity="primary" 
          @click="goToExplore"
        />
      </div>
    </template>
    <div v-if="loading" class="cart-loading">
      <i class="pi pi-spin pi-spinner"></i>
      {{ $t('cart.loading') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import localCartService from '../services/local-cart.service.js';
import { env } from '../../env.js';

const props = defineProps({
  currencyCode: {
    type: String,
    default: 'USD'
  }
});

const router = useRouter();
const { t } = useI18n();
const toast = useToast();

// Reactive state
const cartProducts = ref([]);
const cartSummary = ref({
  totalItems: 0,
  totalAmount: 0,
  itemCount: 0
});
const loading = ref(false);

// Computed
const currencyFormatter = computed(() => {
  const currencyCode = props.currencyCode || env.currencyCode || 'USD';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currencyCode
  });
});

// Methods
function currency(value) {
  return currencyFormatter.value.format(Number(value) || 0);
}

async function loadCart() {
  try {
    loading.value = true;
    const summary = await localCartService.getCartSummary();
    cartProducts.value = summary.products;
    cartSummary.value = summary;
  } catch (error) {
    console.error('Failed to load cart:', error);
    toast.add({
      severity: 'error',
      summary: t('cart.error'),
      detail: t('cart.loadError'),
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

async function increaseQuantity(product) {
  try {
    loading.value = true;
    await localCartService.updateQuantity(product.id, product.cartQuantity + 1);
    await loadCart(); // Refresh cart
    toast.add({
      severity: 'success',
      summary: t('cart.updated'),
      detail: t('cart.quantityIncreased'),
      life: 2000
    });
  } catch (error) {
    console.error('Failed to increase quantity:', error);
    toast.add({
      severity: 'error',
      summary: t('cart.error'),
      detail: t('cart.updateError'),
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

async function decreaseQuantity(product) {
  if (product.cartQuantity <= 1) {
    await removeItem(product);
    return;
  }

  try {
    loading.value = true;
    await localCartService.updateQuantity(product.id, product.cartQuantity - 1);
    await loadCart(); // Refresh cart
    toast.add({
      severity: 'success',
      summary: t('cart.updated'),
      detail: t('cart.quantityDecreased'),
      life: 2000
    });
  } catch (error) {
    console.error('Failed to decrease quantity:', error);
    toast.add({
      severity: 'error',
      summary: t('cart.error'),
      detail: t('cart.updateError'),
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

async function removeItem(product) {
  try {
    loading.value = true;
    await localCartService.removeFromCart(product.id);
    await loadCart(); // Refresh cart
    toast.add({
      severity: 'success',
      summary: t('cart.removed'),
      detail: t('cart.itemRemoved', { name: product.name || product.projectTitle }),
      life: 3000
    });
  } catch (error) {
    console.error('Failed to remove item:', error);
    toast.add({
      severity: 'error',
      summary: t('cart.error'),
      detail: t('cart.removeError'),
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

async function clearCart() {
  if (!confirm(t('cart.confirmClear'))) {
    return;
  }

  try {
    loading.value = true;
    await localCartService.clearCart();
    await loadCart(); // Refresh cart
    toast.add({
      severity: 'success',
      summary: t('cart.cleared'),
      detail: t('cart.allItemsRemoved'),
      life: 3000
    });
  } catch (error) {
    console.error('Failed to clear cart:', error);
    toast.add({
      severity: 'error',
      summary: t('cart.error'),
      detail: t('cart.clearError'),
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

function goToCheckout() {
  router.push('/checkout');
}

function goToExplore() {
  router.push('/explore');
}

// Lifecycle
onMounted(() => {
  loadCart();
});

// Watch for changes in localStorage (when items are added from other parts of the app)
const cartWatcher = setInterval(() => {
  const currentCount = localCartService.getCartItemCount();
  if (currentCount !== cartSummary.value.totalItems) {
    loadCart();
  }
}, 1000);

// Cleanup
onBeforeUnmount(() => {
  clearInterval(cartWatcher);
});
</script>

<style scoped>
.cart-popover {
  width: 350px;
  max-height: 500px;
  overflow-y: auto;
  padding: 1rem;
}

.cart-items {
  margin-bottom: 1rem;
}

.cart-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--surface-border);
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  background: var(--surface-ground);
}

.cart-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cart-item-title {
  font-weight: 500;
  font-size: 0.9rem;
  line-height: 1.2;
}

.cart-item-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 0.25rem 0;
}

.cart-badge {
  background: var(--surface-100);
  color: var(--text-color-secondary);
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.cart-color { background: var(--blue-100); color: var(--blue-700); }
.cart-size { background: var(--green-100); color: var(--green-700); }
.cart-gender { background: var(--purple-100); color: var(--purple-700); }

.cart-item-qty-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
}

.cart-item-qty-btns {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-item-qty-value {
  font-weight: 500;
  min-width: 1.5rem;
  text-align: center;
}

.cart-item-remove {
  color: var(--red-500);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
}

.cart-item-remove:hover {
  color: var(--red-700);
  text-decoration: underline;
}

.cart-item-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.cart-item-subtotal {
  font-weight: 500;
}

.cart-summary {
  border-top: 1px solid var(--surface-border);
  padding-top: 1rem;
}

.cart-summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.cart-summary-total {
  border-top: 1px solid var(--surface-border);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  font-size: 1.1rem;
}

.cart-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.cart-actions .p-button {
  flex: 1;
}

.cart-empty {
  text-align: center;
  padding: 2rem 1rem;
}

.cart-empty-icon {
  margin-bottom: 1rem;
}

.cart-empty-text {
  color: var(--text-color-secondary);
  margin-bottom: 1.5rem;
}

.cart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: var(--text-color-secondary);
}

.mr-2 {
  margin-right: 0.5rem;
}
</style>
