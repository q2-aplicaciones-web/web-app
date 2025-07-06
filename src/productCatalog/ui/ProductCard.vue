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

.card-footer-btns {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  border-radius: 0 0 16px 16px;
}
</style>
