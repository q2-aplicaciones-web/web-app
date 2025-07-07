<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <!-- Cart Summary -->
      <div class="checkout-section">
        <div class="section-header">
          <h2>{{ $t('checkout.orderSummary') }}</h2>
          <Button 
            v-if="cartProducts.length > 0"
            :label="$t('cart.clearCart')" 
            severity="secondary" 
            outlined 
            size="small"
            @click="clearCart"
            :disabled="loading"
            icon="pi pi-trash"
          />
        </div>
        <div v-if="loading" class="loading">
          <i class="pi pi-spin pi-spinner"></i>
          {{ $t('checkout.loading') }}
        </div>
        <div v-else-if="cartProducts.length === 0" class="empty-cart">
          <p>{{ $t('cart.empty') }}</p>
          <Button 
            :label="$t('cart.startShopping')" 
            @click="goToExplore" 
            icon="pi pi-shopping-bag"
            class="start-shopping-btn"
          />
        </div>
        <div v-else class="cart-summary">
          <div class="cart-items">
            <div v-for="product in cartProducts" :key="product.id" class="cart-item p-card">
              <div class="cart-item-content">
                <img 
                  :src="product.previewUrl || product.imageUrl || 'https://res.cloudinary.com/dnkmbpkmj/image/upload/v1735862401/tshirt-outline_lgb60q.svg'" 
                  :alt="product.name"
                  class="item-image"
                />
                <div class="item-details">
                  <h3 class="item-title">{{ product.displayName }}</h3>
                  
                  <!-- Product Description -->
                  <p v-if="product.displayDescription" class="item-description">{{ product.displayDescription }}</p>
                  
                  <!-- Product Attributes -->
                  <div class="item-attributes">
                    <Tag v-if="product.garmentColor" severity="secondary" :value="`${$t('product.color')}: ${translateColor(product.garmentColor)}`" />
                    <Tag v-if="product.garmentSize" severity="info" :value="`${$t('product.size')}: ${translateSize(product.garmentSize)}`" />
                    <Tag v-if="product.garmentGender" severity="success" :value="`${$t('product.gender')}: ${translateGender(product.garmentGender)}`" />
                    <Tag v-if="product.category" severity="warning" :value="`${$t('product.category')}: ${product.category}`" />
                    <Tag v-if="!product.isAvailable" severity="danger" :value="translateStatus(product.status || 'unavailable')" />
                  </div>
                  
                  <!-- Additional Product Info -->
                  <div v-if="product.productMetadata" class="item-metadata">
                    <div class="metadata-header">
                      <i class="pi pi-info-circle"></i>
                      <span class="metadata-title">{{ $t('product.details') }}</span>
                    </div>
                    <div class="metadata-content">
                      <div class="metadata-row">
                        <span class="metadata-label">{{ $t('product.id') }}:</span>
                        <span class="metadata-value">{{ product.productMetadata.id }}</span>
                      </div>
                      <div v-if="product.productMetadata.sku" class="metadata-row">
                        <span class="metadata-label">{{ $t('product.sku') }}:</span>
                        <span class="metadata-value">{{ product.productMetadata.sku }}</span>
                      </div>
                      <div v-if="product.productMetadata.designerName" class="metadata-row">
                        <span class="metadata-label">{{ $t('product.designer') }}:</span>
                        <span class="metadata-value">{{ product.productMetadata.designerName }}</span>
                      </div>
                      <div v-if="product.productMetadata.status" class="metadata-row">
                        <span class="metadata-label">{{ $t('product.status') }}:</span>
                        <span class="metadata-value">{{ translateStatus(product.productMetadata.status) }}</span>
                      </div>
                      <div v-if="product.productMetadata.views" class="metadata-row">
                        <span class="metadata-label">{{ $t('product.views') }}:</span>
                        <span class="metadata-value">{{ product.productMetadata.views }}</span>
                      </div>
                      <div v-if="product.productMetadata.likes" class="metadata-row">
                        <span class="metadata-label">{{ $t('product.likes') }}:</span>
                        <span class="metadata-value">{{ product.productMetadata.likes }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="item-price">
                    <span class="unit-price">{{ currency(product.priceAmount) }}</span>
                    <span class="quantity-info">× {{ product.cartQuantity }}</span>
                    <span v-if="product.currency && product.currency !== 'USD'" class="currency-info">({{ product.currency }})</span>
                  </div>
                  
                  <!-- Quantity Controls -->
                  <div class="quantity-controls">
                    <label class="quantity-label">{{ $t('catalog.quantity') }}:</label>
                    <div class="quantity-input-group">
                      <Button 
                        icon="pi pi-minus" 
                        @click="decreaseQuantity(product)" 
                        text 
                        rounded 
                        size="small"
                        :disabled="loading || product.cartQuantity <= 1"
                        severity="secondary"
                      />
                      <InputNumber
                        v-model="product.cartQuantity"
                        @blur="updateQuantity(product, product.cartQuantity)"
                        :min="1"
                        :max="99"
                        showButtons
                        buttonLayout="horizontal"
                        :disabled="loading"
                        class="quantity-input"
                        size="small"
                      />
                      <Button 
                        icon="pi pi-plus" 
                        @click="increaseQuantity(product)" 
                        text 
                        rounded 
                        size="small"
                        :disabled="loading"
                        severity="secondary"
                      />
                    </div>
                  </div>
                </div>
                <div class="item-total">
                  <span class="total-amount">{{ currency(product.subtotal) }}</span>
                  <small class="added-date">{{ $t('cart.added') }}: {{ formatDate(product.addedAt) }}</small>
                  
                  <!-- Remove Button -->
                  <Button 
                    icon="pi pi-trash" 
                    @click="removeItem(product)"
                    text 
                    rounded 
                    size="small"
                    severity="danger"
                    :disabled="loading"
                    v-tooltip="$t('cart.remove')"
                    class="remove-btn"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Divider />
          
          <div class="cart-totals">
            <div class="total-row">
              <span class="total-label">{{ $t('cart.subtotal') }}:</span>
              <span class="total-value">{{ currency(cartSummary.totalAmount) }}</span>
            </div>
            <div class="total-row total-final">
              <span class="total-label"><strong>{{ $t('cart.total') }}:</strong></span>
              <span class="total-value"><strong>{{ currency(cartSummary.totalAmount) }}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Manufacturer Selection -->
      <div v-if="cartProducts.length > 0" class="checkout-section">
        <h2>{{ $t('checkout.selectManufacturer') }}</h2>
        <div v-if="loadingManufacturers" class="loading">
          <i class="pi pi-spin pi-spinner"></i>
          {{ $t('checkout.loadingManufacturers') }}
        </div>
        <div v-else-if="manufacturers.length === 0" class="no-manufacturers">
          <p>{{ $t('cart.noManufacturers') }}</p>
        </div>
        <div v-else class="manufacturer-selection">
          <div class="form-group">
            <label for="manufacturer-dropdown">{{ $t('checkout.chooseManufacturer') }}</label>
            <Dropdown
              id="manufacturer-dropdown"
              v-model="selectedManufacturer"
              :options="manufacturers"
              optionLabel="name"
              :placeholder="$t('checkout.selectManufacturerPlaceholder')"
              class="manufacturer-dropdown"
              @change="onManufacturerChange"
            >
              <template #option="slotProps">
                <div class="manufacturer-option">
                  <div class="manufacturer-name">{{ slotProps.option.name }}</div>
                  <div class="manufacturer-details">
                    <small class="manufacturer-location">{{ getManufacturerLocation(slotProps.option) }}</small>
                    <small class="manufacturer-delivery">{{ $t('checkout.estimatedDelivery') }}: {{ slotProps.option.averageProductionTime || 7 }}-{{ (slotProps.option.averageProductionTime || 7) + 7 }} {{ $t('checkout.days') }}</small>
                  </div>
                </div>
              </template>
              <template #value="slotProps">
                <div v-if="slotProps.value" class="selected-manufacturer">
                  <div class="manufacturer-name">{{ slotProps.value.name }}</div>
                  <div class="manufacturer-location">{{ getManufacturerLocation(slotProps.value) }}</div>
                </div>
                <span v-else>{{ $t('checkout.selectManufacturerPlaceholder') }}</span>
              </template>
            </Dropdown>
          </div>
          
          <!-- Selected Manufacturer Info -->
          <div v-if="selectedManufacturer" class="selected-manufacturer-info">
            <div class="p-card info-card">
              <div class="p-card-header">
                <h4>{{ selectedManufacturer.name }}</h4>
              </div>
              <div class="p-card-content">
                <div class="info-details">
                  <div class="info-item">
                    <i class="pi pi-map-marker"></i>
                    <span>{{ getManufacturerLocation(selectedManufacturer) }}</span>
                  </div>
                  <div class="info-item">
                    <i class="pi pi-clock"></i>
                    <span>{{ $t('checkout.estimatedDelivery') }}: {{ selectedManufacturer.averageProductionTime || 7 }}-{{ (selectedManufacturer.averageProductionTime || 7) + 7 }} {{ $t('checkout.days') }}</span>
                  </div>
                  <div v-if="selectedManufacturer.qualityRating" class="info-item">
                    <i class="pi pi-star-fill"></i>
                    <span>{{ $t('checkout.rating') }}: {{ selectedManufacturer.qualityRating }}/5</span>
                  </div>
                  <div v-if="selectedManufacturer.specialties" class="info-item specialties">
                    <i class="pi pi-tags"></i>
                    <div class="specialties-list">
                      <Tag 
                        v-for="specialty in selectedManufacturer.specialties" 
                        :key="specialty" 
                        :value="specialty"
                        severity="info"
                        class="specialty-tag"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Shipping Information -->
      <div v-if="selectedManufacturer" class="checkout-section">
        <h2>{{ $t('checkout.shippingInformation') }}</h2>
        <div class="shipping-form">
          <div class="p-fluid">
            <div class="field">
              <label for="fullName">{{ $t('checkout.fullName') }} *</label>
              <InputText
                id="fullName"
                v-model="shippingInfo.fullName"
                :placeholder="$t('checkout.fullName')"
                required
                :class="{ 'p-invalid': !shippingInfo.fullName && formSubmitted }"
              />
            </div>
            
            <div class="field">
              <label for="address">{{ $t('checkout.address') }} *</label>
              <InputText
                id="address"
                v-model="shippingInfo.address"
                :placeholder="$t('checkout.address')"
                required
                :class="{ 'p-invalid': !shippingInfo.address && formSubmitted }"
              />
            </div>
            
            <div class="formgrid grid">
              <div class="field col-12 md:col-6">
                <label for="city">{{ $t('checkout.city') }} *</label>
                <InputText
                  id="city"
                  v-model="shippingInfo.city"
                  :placeholder="$t('checkout.city')"
                  required
                  :class="{ 'p-invalid': !shippingInfo.city && formSubmitted }"
                />
              </div>
              
              <div class="field col-12 md:col-6">
                <label for="state">{{ $t('checkout.state') }} *</label>
                <InputText
                  id="state"
                  v-model="shippingInfo.state"
                  :placeholder="$t('checkout.state')"
                  required
                  :class="{ 'p-invalid': !shippingInfo.state && formSubmitted }"
                />
              </div>
            </div>
            
            <div class="formgrid grid">
              <div class="field col-12 md:col-6">
                <label for="zip">{{ $t('checkout.zip') }} *</label>
                <InputText
                  id="zip"
                  v-model="shippingInfo.zip"
                  :placeholder="$t('checkout.zip')"
                  required
                  :class="{ 'p-invalid': !shippingInfo.zip && formSubmitted }"
                />
              </div>
              
              <div class="field col-12 md:col-6">
                <label for="country">{{ $t('checkout.country') }} *</label>
                <Dropdown
                  id="country"
                  v-model="shippingInfo.country"
                  :options="countries"
                  optionLabel="name"
                  optionValue="code"
                  :placeholder="$t('checkout.selectCountry')"
                  :class="{ 'p-invalid': !shippingInfo.country && formSubmitted }"
                  filter
                  showClear
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Checkout Actions -->
      <div v-if="cartProducts.length > 0 && selectedManufacturer" class="checkout-actions">
        <Button 
          :label="$t('checkout.backToCart')" 
          severity="secondary" 
          outlined 
          @click="goBack"
        />
        <Button 
          :label="`${$t('checkout.placeOrder')} - ${currency(cartSummary.totalAmount)}`" 
          severity="primary" 
          @click="processOrder"
          :loading="processingOrder"
          :disabled="!isFormValid"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import localCartService from '../../orders-processing/services/local-cart.service.js';
import manufacturerService from '../../orders-processing/services/manufacturer.service.js';
import orderService from '../../orders-processing/services/order.service.js';
import fulfillmentService from '../../orders-processing/services/fulfillment.service.js';
import { env } from '../../env.js';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();

// Reactive state
const loading = ref(false);
const loadingManufacturers = ref(false);
const processingOrder = ref(false);
const formSubmitted = ref(false);
const cartProducts = ref([]);
const cartSummary = ref({ totalAmount: 0, totalItems: 0 });
const manufacturers = ref([]);
const selectedManufacturer = ref(null);
const shippingInfo = ref({
  fullName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: ''
});

// Countries list for dropdown
const countries = ref([
  { name: 'United States', code: 'US' },
  { name: 'Canada', code: 'CA' },
  { name: 'Mexico', code: 'MX' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Spain', code: 'ES' },
  { name: 'Italy', code: 'IT' },
  { name: 'Australia', code: 'AU' },
  { name: 'Japan', code: 'JP' },
  { name: 'China', code: 'CN' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Argentina', code: 'AR' },
  { name: 'Chile', code: 'CL' },
  { name: 'Colombia', code: 'CO' }
]);

// Computed
const currencyFormatter = computed(() => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: env.currencyCode || 'USD' 
  });
});

const isFormValid = computed(() => {
  return shippingInfo.value.fullName && 
         shippingInfo.value.address && 
         shippingInfo.value.city && 
         shippingInfo.value.state && 
         shippingInfo.value.zip && 
         shippingInfo.value.country;
});

// Methods
function currency(value) {
  return currencyFormatter.value.format(Number(value) || 0);
}

function getManufacturerLocation(manufacturer) {
  const parts = [
    manufacturer.address_City,
    manufacturer.address_State,
    manufacturer.address_Country
  ].filter(Boolean);
  return parts.join(', ') || 'Location not specified';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper functions for translations
function translateColor(color) {
  if (!color) return '';
  const colorKey = color.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
  const translationKey = `product.colors.${colorKey}`;
  const translated = t(translationKey);
  // If translation key doesn't exist, return the original color with proper capitalization
  return translated === translationKey ? color.charAt(0).toUpperCase() + color.slice(1) : translated;
}

function translateSize(size) {
  if (!size) return '';
  const sizeKey = size.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
  const translationKey = `product.sizes.${sizeKey}`;
  const translated = t(translationKey);
  // If translation key doesn't exist, return the original size in uppercase
  return translated === translationKey ? size.toUpperCase() : translated;
}

function translateGender(gender) {
  if (!gender) return '';
  const genderKey = gender.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
  const translationKey = `product.genders.${genderKey}`;
  const translated = t(translationKey);
  // If translation key doesn't exist, return the original gender with proper capitalization
  return translated === translationKey ? gender.charAt(0).toUpperCase() + gender.slice(1) : translated;
}

function translateStatus(status) {
  if (!status) return t('product.statuses.unavailable');
  const statusKey = status.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
  const translationKey = `product.statuses.${statusKey}`;
  const translated = t(translationKey);
  // If translation key doesn't exist, return the original status with proper capitalization
  return translated === translationKey ? status.charAt(0).toUpperCase() + status.slice(1) : translated;
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

async function loadManufacturers() {
  try {
    loadingManufacturers.value = true;
    const allManufacturers = await manufacturerService.getAllManufacturers();
    manufacturers.value = allManufacturers;
  } catch (error) {
    console.error('Failed to load manufacturers:', error);
    toast.add({
      severity: 'error',
      summary: t('checkout.error'),
      detail: t('checkout.loadManufacturersError'),
      life: 3000
    });
  } finally {
    loadingManufacturers.value = false;
  }
}

async function increaseQuantity(product) {
  try {
    loading.value = true;
    await localCartService.updateQuantity(product.id, product.cartQuantity + 1);
    await loadCart(); // Refresh cart
    
    // Reset manufacturer selection if needed to trigger fulfillment recalculation
    if (selectedManufacturer.value) {
      await onManufacturerChange();
    }
    
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
    
    // Reset manufacturer selection if needed to trigger fulfillment recalculation
    if (selectedManufacturer.value) {
      await onManufacturerChange();
    }
    
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
    
    // Reset manufacturer selection if needed to trigger fulfillment recalculation
    if (selectedManufacturer.value) {
      await onManufacturerChange();
    }
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
  if (!confirm(t('cart.confirmRemove', { name: product.displayName || product.name }))) {
    return;
  }

  try {
    loading.value = true;
    await localCartService.removeFromCart(product.id);
    await loadCart(); // Refresh cart
    toast.add({
      severity: 'success',
      summary: t('cart.removed'),
      detail: t('cart.itemRemoved', { name: product.displayName || product.name }),
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
    selectedManufacturer.value = null; // Reset manufacturer selection
    toast.add({
      severity: 'success',
      summary: t('cart.cleared'),
      detail: t('cart.cartCleared'),
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

function goToExplore() {
  router.push('/explore');
}

function selectManufacturer(manufacturer) {
  selectedManufacturer.value = manufacturer;
  onManufacturerChange();
}

async function onManufacturerChange() {
  if (!selectedManufacturer.value) return;
  
  try {
    // Update fulfillment when manufacturer changes
    const fulfillmentData = {
      manufacturer_id: selectedManufacturer.value.id,
      items: cartProducts.value.map(product => ({
        product_id: product.id,
        quantity: product.cartQuantity
      })),
      shipping_address: shippingInfo.value
    };
    
    // Update fulfillment estimate
    const fulfillmentEstimate = await fulfillmentService.calculateFulfillment(fulfillmentData);
    
    toast.add({
      severity: 'info',
      summary: t('checkout.manufacturerSelected'),
      detail: t('checkout.fulfillmentUpdated', { 
        name: selectedManufacturer.value.name,
        days: fulfillmentEstimate.estimatedDays || selectedManufacturer.value.averageProductionTime || 7
      }),
      life: 4000
    });
  } catch (error) {
    console.error('Failed to update fulfillment:', error);
    // Don't show error to user as this is not critical
  }
}

async function processOrder() {
  formSubmitted.value = true;
  
  if (!isFormValid.value || !selectedManufacturer.value) {
    toast.add({
      severity: 'warn',
      summary: t('checkout.warning'),
      detail: t('checkout.fillAllFields'),
      life: 3000
    });
    return;
  }

  try {
    processingOrder.value = true;
    
    // Create order data
    const orderData = {
      items: cartProducts.value.map(product => ({
        product_id: product.id,
        quantity: product.cartQuantity,
        unit_price: product.priceAmount,
        projectName: product.name || product.projectTitle
      })),
      total_amount: cartSummary.value.totalAmount,
      manufacturer_id: selectedManufacturer.value.id,
      shipping_address: shippingInfo.value
    };

    // Create the order
    await orderService.createOrder(orderData);
    
    // Clear the cart
    await localCartService.clearCart();
    
    toast.add({
      severity: 'success',
      summary: t('checkout.success'),
      detail: t('checkout.orderPlaced'),
      life: 5000
    });

    // Redirect to orders page or dashboard
    router.push('/dashboard');
    
  } catch (error) {
    console.error('Failed to process order:', error);
    toast.add({
      severity: 'error',
      summary: t('checkout.error'),
      detail: t('checkout.orderError'),
      life: 3000
    });
  } finally {
    processingOrder.value = false;
  }
}

function goBack() {
  router.go(-1);
}

// Lifecycle
onMounted(async () => {
  await loadCart();
  if (cartProducts.value.length > 0) {
    await loadManufacturers();
  }
});
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: var(--surface-ground);
  padding: 2rem 1rem;
}

.checkout-container {
  max-width: 800px;
  margin: 0 auto;
}

.checkout-section {
  background: transparent;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid var(--surface-border);
}

.checkout-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.empty-cart {
  text-align: center;
  padding: 2rem;
}

.empty-cart p {
  margin-bottom: 1rem;
  color: var(--text-color-secondary);
  font-size: 1.1rem;
}

.start-shopping-btn {
  margin-top: 1rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.cart-item {
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  overflow: hidden;
}

.cart-item-content {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: transparent;
  flex-shrink: 0;
  border: 1px solid var(--surface-border);
}

.item-details {
  flex: 1;
}

.item-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color);
}

.item-description {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  line-height: 1.4;
}

.item-attributes {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.item-metadata {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-100);
  border-radius: 6px;
  font-size: 0.85rem;
  border: 1px solid var(--surface-200);
}

.metadata-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--text-color);
}

.metadata-header i {
  color: var(--primary-color);
  font-size: 0.9rem;
}

.metadata-title {
  font-size: 0.9rem;
}

.metadata-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metadata-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--surface-200);
}

.metadata-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.metadata-label {
  font-weight: 500;
  color: var(--text-color-secondary);
  flex-shrink: 0;
  min-width: 80px;
}

.metadata-value {
  color: var(--text-color);
  font-family: 'Segoe UI', system-ui, sans-serif;
  text-align: right;
  font-weight: 400;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unit-price {
  font-weight: 500;
  color: var(--text-color);
}

.quantity-info {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.currency-info {
  color: var(--text-color-secondary);
  font-size: 0.8rem;
  font-style: italic;
}

.quantity-controls {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-label {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.quantity-input-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.quantity-input {
  width: 80px;
}

.quantity-input :deep(.p-inputnumber-input) {
  text-align: center;
  padding: 0.25rem;
}

.item-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  text-align: right;
  gap: 0.5rem;
}

.total-amount {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-color);
}

.added-date {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  opacity: 0.8;
}

.remove-btn {
  align-self: flex-end;
}

.cart-totals {
  background: transparent;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--surface-border);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.total-row:last-child {
  margin-bottom: 0;
}

.total-final {
  font-size: 1.2rem;
  border-top: 1px solid var(--surface-border);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.total-label {
  color: var(--text-color);
}

.total-value {
  color: var(--text-color);
  font-weight: 500;
}

.manufacturer-selection {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.manufacturer-dropdown {
  width: 100%;
}

.manufacturer-option {
  padding: 0.5rem 0;
}

.manufacturer-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.manufacturer-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.manufacturer-location,
.manufacturer-delivery {
  color: var(--text-color-secondary);
  font-size: 0.85rem;
}

.selected-manufacturer {
  display: flex;
  flex-direction: column;
}

.selected-manufacturer .manufacturer-name {
  font-weight: 500;
}

.selected-manufacturer .manufacturer-location {
  color: var(--text-color-secondary);
  font-size: 0.85rem;
}

.selected-manufacturer-info {
  margin-top: 1rem;
}

.info-card {
  margin-top: 1rem;
}

.info-card .p-card-header h4 {
  margin: 0;
  color: var(--text-color);
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: var(--text-color-secondary);
}

.info-item i {
  margin-top: 0.125rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

.info-item.specialties {
  align-items: flex-start;
}

.specialties-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.specialty-tag {
  font-size: 0.8rem;
}

.shipping-form {
  max-width: 100%;
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.field label:after {
  content: " *";
  color: var(--red-500);
}

.p-inputtext,
.p-dropdown {
  width: 100%;
}

.p-invalid {
  border-color: var(--red-500);
}

.checkout-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.checkout-actions .p-button {
  flex: 1;
}

.no-manufacturers {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}
</style>
