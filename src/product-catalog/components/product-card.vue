<template>
  <Card class="product-card">
    <template #header>
      <div class="product-preview" :style="{ backgroundColor: product.projectDetails?.garmentColor }">
        <img v-if="product.gallery?.length" :src="product.gallery[0]" :alt="product.projectDetails?.name || product.name" />
        <div v-else class="no-preview">
          <i class="pi pi-image"></i>
          <span>No preview</span>
        </div>
      </div>
    </template>
    <template #title>
      <span class="product-title">
        {{ product.projectDetails?.name || product.name || product.projectDetails?.projectName || product.title || 'Sin nombre' }}
      </span>
    </template>
    <template #content>
      <div class="product-info">
        <div class="product-price">{{ env.currencyCode }} {{ product.price?.toFixed ? product.price.toFixed(2) : product.price }}</div>
        <div class="product-gender">{{ product.projectDetails?.gender || product.gender }}</div>
        <div class="product-meta">
          <i class="pi pi-star"></i> {{ product.rating }}
          <i class="pi pi-heart"></i> {{ product.likes }}
        </div>
      </div>
    </template>
    <template #footer>
      <div class="card-footer-btns">
        <Button label="View" icon="pi pi-eye" @click="$emit('view', product)" />
        <Button label="Add to Cart" icon="pi pi-shopping-cart" severity="success" @click="$emit('add-to-cart', product)" />
      </div>
    </template>
  </Card>
</template>

<script setup>
import { defineProps } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { env } from '../../env';

defineProps({
  product: Object
});
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  padding: 0;
}
.product-preview {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  overflow: hidden;
  position: relative;
}
.product-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
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
  min-height: 2.2em;
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: block;
  text-align: left;
}
.product-info {

  color: #f8f8f8;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 80px;
}
.product-price {
  color: #fff;
  font-weight: 600;
  font-size: 1.05rem;
}
.product-gender {
  color: #f0f0f0;
  font-size: 0.98rem;
}
.product-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f8f8f8;
}
.card-footer-btns {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  padding: 0.5rem 0.5rem 1rem 0.5rem;
  border-radius: 0 0 16px 16px;
}
.card-footer-btns .p-button {
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
  min-width: 0;
}
.p-card-footer .p-button {
  flex: 1 1 0;
  min-width: 0;
}
</style>