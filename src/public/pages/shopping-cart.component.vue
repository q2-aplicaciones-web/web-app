<template>
  <div class="shopping-cart-page">
    <div class="cart-container">
      <h1>{{ $t('cart.title') }}</h1>
      
      <div v-if="loading" class="loading-section">
        <i class="pi pi-spin pi-spinner"></i>
        {{ $t('cart.loading') }}
      </div>
      
      <div v-else-if="cartProducts.length === 0" class="empty-cart-section">
        <div class="empty-cart-content">
          <i class="pi pi-shopping-cart" style="font-size: 4rem; color: var(--text-color-secondary);"></i>
          <h2>{{ $t('cart.empty') }}</h2>
          <p>{{ $t('cart.emptyDescription') }}</p>
          <Button 
            :label="$t('cart.startShopping')" 
            severity="primary" 
            size="large"
            @click="goToExplore"
          />
        </div>
      </div>
      
      <div v-else class="cart-content">
        <!-- Cart Items -->
        <div class="cart-items-section">
          <div class="cart-items-header">
            <h2>{{ $t('cart.items') }} ({{ cartSummary.totalItems }})</h2>
            <Button 
              :label="$t('cart.clearCart')" 
              severity="secondary" 
              outlined 
              @click="clearCart"
              :disabled="loading"
            />
          </div>
          
          <div class="cart-items-list">
            <div v-for="product in cartProducts" :key="product.id" class="cart-item-card">
              <div class="item-image-container">
                <img 
                  :src="product.previewUrl || product.imageUrl || 'https://res.cloudinary.com/dnkmbpkmj/image/upload/v1735862401/tshirt-outline_lgb60q.svg'" 
                  :alt="product.name"
                  class="item-image"
                />
              </div>
              
              <div class="item-details">
                <h3 class="item-title">{{ product.name || product.projectTitle }}</h3>
                <p class="item-description">{{ product.description }}</p>
                
                <div class="item-attributes">
                  <span v-if="product.garmentColor" class="attribute-badge color-badge">
                    {{ $t('product.color') }}: {{ product.garmentColor }}
                  </span>
                  <span v-if="product.garmentSize" class="attribute-badge size-badge">
                    {{ $t('product.size') }}: {{ product.garmentSize }}
                  </span>
                  <span v-if="product.garmentGender" class="attribute-badge gender-badge">
                    {{ $t('product.gender') }}: {{ product.garmentGender }}
                  </span>
                </div>
                
                <div class="item-price">
                  {{ currency(product.priceAmount) }} {{ $t('cart.item') }}
                </div>
              </div>
              
              <div class="item-controls">
                <div class="quantity-controls">
                  <label>{{ $t('catalog.quantity') }}:</label>
                  <div class="quantity-input-group">
                    <Button 
                      icon="pi pi-minus" 
                      @click="decreaseQuantity(product)" 
                      text 
                      rounded 
                      :disabled="loading"
                      severity="secondary"
                    />
                    <InputNumber
                      v-model="product.cartQuantity" 
                      @update:modelValue="updateQuantity(product, $event)"
                      :min="1"
                      :max="99"
                      showButtons
                      buttonLayout="horizontal"
                      :disabled="loading"
                      class="quantity-input"
                    />
                    <Button 
                      icon="pi pi-plus" 
                      @click="increaseQuantity(product)" 
                      text 
                      rounded 
                      :disabled="loading"
                      severity="secondary"
                    />
                  </div>
                </div>
                
                <div class="item-subtotal">
                  <strong>{{ currency(product.subtotal) }}</strong>
                </div>
                
                <Button 
                  icon="pi pi-trash" 
                  @click="removeItem(product)"
                  text 
                  rounded 
                  severity="danger"
                  :disabled="loading"
                  v-tooltip="$t('cart.remove')"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Cart Summary -->
        <div class="cart-summary-section">
          <div class="summary-card">
            <h3>{{ $t('cart.summary') }}</h3>
            
            <div class="summary-rows">
              <div class="summary-row">
                <span>{{ $t('cart.subtotal') }}:</span>
                <span>{{ currency(cartSummary.totalAmount) }}</span>
              </div>
              
              <div class="summary-row summary-total">
                <span><strong>{{ $t('cart.total') }}:</strong></span>
                <span><strong>{{ currency(cartSummary.totalAmount) }}</strong></span>
              </div>
            </div>
            
            <div class="summary-actions">
              <Button 
                :label="$t('cart.checkout')" 
                severity="primary" 
                size="large"
                @click="goToCheckout"
                :disabled="loading || cartProducts.length === 0"
                class="checkout-button"
              />
              
              <p class="checkout-note">
                {{ $t('cart.checkoutNote') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import localCartService from '../../orders-processing/services/local-cart.service.js';
import { env } from '../../env.js';

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
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: env.currencyCode || 'USD' 
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

async function updateQuantity(product, newQuantity) {
  if (!newQuantity || newQuantity < 1) {
    newQuantity = 1;
    product.cartQuantity = 1;
  }

  try {
    loading.value = true;
    await localCartService.updateQuantity(product.id, newQuantity);
    await loadCart(); // Refresh cart
  } catch (error) {
    console.error('Failed to update quantity:', error);
    toast.add({
      severity: 'error',
      summary: t('cart.error'),
      detail: t('cart.updateError'),
      life: 3000
    });
    // Restore previous value
    await loadCart();
  } finally {
    loading.value = false;
  }
}

async function removeItem(product) {
  if (!confirm(t('cart.confirmRemove', { name: product.name || product.projectTitle }))) {
    return;
  }

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
}, 2000);

// Cleanup
onBeforeUnmount(() => {
  clearInterval(cartWatcher);
});
</script>

<style scoped>
.shopping-cart-page {
  min-height: 100vh;
  background: var(--surface-ground);
  padding: 2rem 1rem;
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
}

.cart-container h1 {
  margin-bottom: 2rem;
  color: var(--text-color);
}

.loading-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem;
  color: var(--text-color-secondary);
}

.empty-cart-section {
  display: flex;
  justify-content: center;
  padding: 4rem 2rem;
}

.empty-cart-content {
  text-align: center;
  max-width: 400px;
}

.empty-cart-content h2 {
  margin: 1rem 0;
  color: var(--text-color);
}

.empty-cart-content p {
  margin-bottom: 2rem;
  color: var(--text-color-secondary);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.cart-items-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.cart-items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.cart-items-header h2 {
  margin: 0;
  color: var(--text-color);
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item-card {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  transition: all 0.2s;
}

.cart-item-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.item-image-container {
  display: flex;
  align-items: center;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  background: var(--surface-ground);
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.item-description {
  margin: 0 0 1rem 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.item-attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.attribute-badge {
  background: var(--surface-100);
  color: var(--text-color-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.color-badge { background: var(--blue-100); color: var(--blue-700); }
.size-badge { background: var(--green-100); color: var(--green-700); }
.gender-badge { background: var(--purple-100); color: var(--purple-700); }

.item-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
}

.item-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
  min-width: 150px;
}

.quantity-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.quantity-controls label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
}

.quantity-input-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.quantity-input {
  width: 60px;
  text-align: center;
  padding: 0.5rem;
  border: 1px solid var(--surface-border);
  border-radius: 4px;
  font-size: 1rem;
}

.quantity-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.item-subtotal {
  font-size: 1.2rem;
  color: var(--text-color);
}

.cart-summary-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.summary-card {
  padding: 2rem;
}

.summary-card h3 {
  margin: 0 0 1.5rem 0;
  color: var(--text-color);
}

.summary-rows {
  margin-bottom: 2rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.summary-total {
  border-top: 1px solid var(--surface-border);
  padding-top: 0.75rem;
  margin-top: 1rem;
  font-size: 1.2rem;
}

.summary-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkout-button {
  width: 100%;
}

.checkout-note {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  text-align: center;
  margin: 0;
}
</style>
