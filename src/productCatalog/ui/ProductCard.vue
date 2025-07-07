<template>
  <Card class="product-card">
    <template #header>
      <div class="product-preview">
        <img v-if="product.projectPreviewUrl" :src="product.projectPreviewUrl" :alt="product.projectTitle" />
        <div v-else class="no-preview">
          <i class="pi pi-image"></i>
          <span>No preview</span>
        </div>
      </div>
    </template>
    <template #title>
      <span class="product-title">{{ product.projectTitle || 'Sin nombre' }}</span>
    </template>
    <template #content>
      <div class="product-info">
        <div class="product-price">$ {{ product.priceAmount }}</div>
        <div v-if="product.garmentColor || product.garmentSize || product.garmentGender" class="product-details">
          <span v-if="product.garmentColor" class="product-badge color-badge">{{ $t('product.color') }}: {{ product.garmentColor }}</span>
          <span v-if="product.garmentSize" class="product-badge size-badge">{{ $t('product.size') }}: {{ product.garmentSize }}</span>
          <span v-if="product.garmentGender" class="product-badge gender-badge">{{ $t('product.gender') }}: {{ product.garmentGender }}</span>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="card-footer-btns">
        <Button :label="$t('catalog.addToCart')" icon="pi pi-shopping-cart" severity="primary" @click="$emit('add-to-cart', product)" />
      </div>
    </template>
  </Card>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Button from 'primevue/button';

const { t } = useI18n();
const props = defineProps({ product: Object, userId: String });
</script>

<style scoped>
.product-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-width: 220px;
  max-width: 340px;
  width: 100%;
  flex: 1 1 30%;
}

.product-preview {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
}

.product-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 1.2rem;
}

.product-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0.5rem 0 0.25rem 0;
  color: #b4b1b1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: block;
  text-align: left;
}

.product-info {
  color: #777676;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 60px;
}

.product-price {
  color: #21a100;
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.product-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.product-badge {
  background: var(--surface-100);
  color: var(--text-color-secondary);
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
}

.color-badge {
  background: var(--blue-100);
  color: var(--blue-700);
}

.size-badge {
  background: var(--green-100);
  color: var(--green-700);
}

.gender-badge {
  background: var(--purple-100);
  color: var(--purple-700);
}

.card-footer-btns {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  border-radius: 0 0 16px 16px;
}
</style>
