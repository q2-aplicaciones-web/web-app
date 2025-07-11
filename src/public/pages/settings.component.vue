
<script setup>
import { ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { authenticationService } from '../../iam/services/authentication.service.js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const toast = useToast();
const showForm = ref(false);
const loading = ref(false);
const form = ref({
  name: '',
  address_Street: '',
  address_City: '',
  address_Country: '',
  address_State: '',
  address_Zip: ''
});

const userId = authenticationService.currentUserId.value;

async function registerManufacturer() {
  loading.value = true;
  try {
    const response = await fetch('/api/v1/manufacturers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        ...form.value
      })
    });
    if (!response.ok) throw new Error('Failed to register');
    toast.add({ severity: 'success', summary: 'Success', detail: 'Registered as manufacturer!', life: 3000 });
    showForm.value = false;
    form.value = { name: '', address_Street: '', address_City: '', address_Country: '', address_State: '', address_Zip: '' };
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not register as manufacturer', life: 3000 });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="settings-page">
    <Card>
      <template #content>
        <h2>{{ t('settings.title') }}</h2>
        <Button :label="t('settings.registerManufacturer')" @click="showForm = !showForm" class="mb-3" />
        <form v-if="showForm" @submit.prevent="registerManufacturer" class="manufacturer-form">
          <div class="form-group">
            <label>{{ t('settings.name') }}</label>
            <InputText v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>{{ t('settings.street') }}</label>
            <InputText v-model="form.address_Street" required />
          </div>
          <div class="form-group">
            <label>{{ t('settings.city') }}</label>
            <InputText v-model="form.address_City" required />
          </div>
          <div class="form-group">
            <label>{{ t('settings.country') }}</label>
            <InputText v-model="form.address_Country" required />
          </div>
          <div class="form-group">
            <label>{{ t('settings.state') }}</label>
            <InputText v-model="form.address_State" required />
          </div>
          <div class="form-group">
            <label>{{ t('settings.zip') }}</label>
            <InputText v-model="form.address_Zip" required />
          </div>
          <Button type="submit" :label="t('settings.submit')" :loading="loading" class="mt-2" />
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
}
.manufacturer-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
