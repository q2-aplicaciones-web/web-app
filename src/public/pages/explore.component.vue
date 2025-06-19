<template>
  <div class="explore-container">
    <div class="search-bar-container">
      <SearchBar />
    </div>
    <section class="catalog-container">
      <ProductCatalog />
    </section>
  </div>
</template>

<script setup>
import SearchBar from '../../product-catalog/components/search-bar.vue';
import ProductCatalog from '../../product-catalog/components/product-catalog.vue';
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