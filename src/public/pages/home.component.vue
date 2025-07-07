
<script setup>
import Button from 'primevue/button';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="welcome-layout">
    <Card class="welcome-card">
      <template #title>
        <span>{{ t('home.welcome') }}</span>
      </template>
      <template #content>
        <p>{{ t('home.quick_access') }}</p>
        <div class="links-list">
          <Button :label="t('home.design_lab')" icon="pi pi-palette" class="p-button-text" to="/design-lab" />
          <Button :label="t('home.product_catalog')" icon="pi pi-list" class="p-button-text" to="/product-catalog" />
          <Button :label="t('home.orders_cart')" icon="pi pi-shopping-cart" class="p-button-text" to="/shopping-cart" />
          <Button :label="t('home.analytics')" icon="pi pi-chart-bar" class="p-button-text" to="/analytics" />
          <Button :label="t('home.profile')" icon="pi pi-user" class="p-button-text" to="/profile" />
        </div>
        <Divider />
        <small>{{ t('home.menu_hint') }}</small>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.welcome-layout {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.welcome-card {
  min-width: 350px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.links-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0 1rem 0;
}
</style>
