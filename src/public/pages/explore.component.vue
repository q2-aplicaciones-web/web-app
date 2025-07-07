<template>
  <div class="explore-container">
    <section class="catalog-container">
      <ProductList />
    </section>
  </div>
</template>

<script setup>
import ProductList from '../../productCatalog/ui/ProductList.vue';
</script>

<style scoped>
.explore-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1rem;
}

.search-bar-container {
  display: flex;
  justify-content: center;
}

.catalog-container {
  margin: 0 auto;
  width: 90%;
}
</style>