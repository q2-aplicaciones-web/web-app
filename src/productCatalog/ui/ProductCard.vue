<template>
  <Card class="product-card">
    <template #header>
      <div class="product-preview" :style="{ backgroundColor: product.projectColor || '#fff' }">
        <img v-if="product.projectPreviewUrl" :src="product.projectPreviewUrl" :alt="product.projectTitle" />
        <div v-else class="no-preview">
          <i class="pi pi-image"></i>
          <span>No preview</span>
        </div>
        <span class="badge" :class="product.status">{{ product.status }}</span>
      </div>
    </template>
    <template #title>
      <span class="product-title">{{ product.projectTitle || 'Sin nombre' }}</span>
    </template>
    <template #content>
      <div class="product-info">
        <div class="product-price">$ {{ product.priceAmount }}</div>
        <div class="product-meta">
          <Button icon="pi pi-heart" :class="['like-btn', { liked }]" @click="toggleLike" text/>
          <span>{{ likeCount }}</span>
          <i class="pi pi-eye"></i> <span>0</span>
          <i class="pi pi-user"></i> <span>{{ product.designer || 'Designer' }}</span>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="card-footer-btns">
        <Button label="View Details" icon="pi pi-eye" @click="$emit('view', product)" text/>
        <Button label="Add to Cart" icon="pi pi-shopping-cart" severity="primary" @click="$emit('add-to-cart', product)" />
      </div>
      <Button label="Buy Now" class="buy-now-btn" text />
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import productLikesService from '../application/productLikesService';

const props = defineProps({ product: Object, userId: String });
const likeCount = ref(props.product.likeCount || 0);
const liked = ref(false);

onMounted(async () => {
  likeCount.value = await productLikesService.getLikeCount(props.product.id);
  // liked.value = await productLikesService.isLikedByUser(props.product.id, props.userId); // Si implementas esta función
});

async function toggleLike() {
  try {
    if (!liked.value) {
      await productLikesService.likeProduct(props.product.id, props.userId);
      liked.value = true;
    } else {
      await productLikesService.unlikeProduct(props.product.id, props.userId);
      liked.value = false;
    }
    // Siempre consulta el contador real después de la acción
    likeCount.value = await productLikesService.getLikeCount(props.product.id);
  } catch (e) {
    // Puedes mostrar un toast o alert aquí si lo deseas
    console.error(e);
  }
}
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
  align-items: flex-end;
  justify-content: flex-end;
  position: relative;
  overflow: hidden;
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
.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #f4f4f4;
  color: #333;
  border-radius: 8px;
  padding: 0.2rem 0.7rem;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}
.badge.Available {
  background: #e0eefa;
  color: #1976d2;
}
.badge.Unavailable {
  background: #ffeaea;
  color: #d32f2f;
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
  min-height: 80px;
}
.product-price {
  color: #21a100;
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}
.product-meta {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: #666;
  font-size: 1rem;
}
.like-btn {
  color: #888;
  transition: color 0.2s;
}
.like-btn.liked {
  color: #e53935;
}
.card-footer-btns {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  border-radius: 0 0 16px 16px;
}
.buy-now-btn {
  width: 100%;
  margin-top: 0.5rem;
  background: #f4f8ff;
  color: #1976d2;
  font-weight: 600;
  border-radius: 8px;
}
</style>
