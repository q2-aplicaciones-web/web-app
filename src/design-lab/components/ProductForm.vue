<template>
  <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" modal :header="t('productForm.title')" :closable="true" :style="{ width: '500px' }">
    <form @submit.prevent="handleSubmit" class="product-form">
      <div class="form-group">
        <label for="priceAmount">{{ t('productForm.priceAmount') }} *</label>
        <InputNumber 
          id="priceAmount"
          v-model="formData.priceAmount"
          :min="0"
          :step="0.01"
          mode="currency"
          currency="USD"
          locale="en-US"
          class="form-input"
          :class="{ 'p-invalid': errors.priceAmount }"
          :placeholder="t('productForm.enterPriceAmount')"
        />
        <small v-if="errors.priceAmount" class="p-error">{{ errors.priceAmount }}</small>
      </div>

      <div class="form-group">
        <label for="priceCurrency">{{ t('productForm.priceLocale') }} *</label>
        <Select 
          id="priceCurrency"
          v-model="formData.priceCurrency"
          :options="currencyOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('productForm.selectLocale')"
          class="form-input"
          :class="{ 'p-invalid': errors.priceCurrency }"
        />
        <small v-if="errors.priceCurrency" class="p-error">{{ errors.priceCurrency }}</small>
      </div>

      <div class="form-group">
        <label for="status">{{ t('productForm.productStatus') }} *</label>
        <Select 
          id="status"
          v-model="formData.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('productForm.selectStatus')"
          class="form-input"
          :class="{ 'p-invalid': errors.status }"
        />
        <small v-if="errors.status" class="p-error">{{ errors.status }}</small>
      </div>

      <!-- Project Info (Read-only display) -->
      <div class="project-info-section">
        <h4>{{ t('productForm.projectInformation') }}</h4>
        <div class="project-display">
          <div class="project-field">
            <label>{{ t('productForm.projectTitle') }}:</label>
            <span>{{ project?.title || t('productForm.noTitle') }}</span>
          </div>
          <div class="project-field">
            <label>{{ t('productForm.projectId') }}:</label>
            <span>{{ project?.id || t('productForm.noId') }}</span>
          </div>
          <div class="project-field">
            <label>{{ t('productForm.garmentColor') }}:</label>
            <span>{{ project?.color || t('productForm.noColor') }}</span>
          </div>
          <div class="project-field">
            <label>{{ t('productForm.created') }}:</label>
            <span>{{ formatDate(project?.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <Button 
          type="button" 
          :label="t('common.cancel')" 
          severity="secondary" 
          @click="handleCancel"
          :disabled="loading"
        />
        <Button 
          type="submit" 
          :label="t('productForm.createProduct')" 
          severity="primary"
          :loading="loading"
          :disabled="loading || !isFormValid"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { authenticationService } from '../../iam/services/authentication.service.js'
import productCatalogService from '../../productCatalog/application/productCatalogService.js'
import designLabService from '../services/design-lab.service.js'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'

const props = defineProps({
  visible: Boolean,
  project: Object
})

const emit = defineEmits(['update:visible', 'product-created', 'error'])

// Add i18n support
const { t } = useI18n()

// Form data
const formData = ref({
  priceAmount: null,
  priceCurrency: 'en-US',
  status: 'Available'
})

// Form validation
const errors = ref({})
const loading = ref(false)

// Options for dropdowns
const currencyOptions = [
  { label: t('productForm.currencies.usd'), value: 'en-US' },
  { label: t('productForm.currencies.eur'), value: 'en-EU' },
  { label: t('productForm.currencies.gbp'), value: 'en-GB' },
  { label: t('productForm.currencies.cad'), value: 'en-CA' },
  { label: t('productForm.currencies.aud'), value: 'en-AU' }
]

const statusOptions = [
  { label: t('productForm.status.available'), value: 'Available' },
  { label: t('productForm.status.outOfStock'), value: 'OutOfStock' },
  { label: t('productForm.status.discontinued'), value: 'Discontinued' },
  { label: t('productForm.status.comingSoon'), value: 'ComingSoon' }
]

// Computed properties
const isFormValid = computed(() => {
  return formData.value.priceAmount > 0 && 
         formData.value.priceCurrency && 
         formData.value.status &&
         Object.keys(errors.value).length === 0
})

// Validation function
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.priceAmount || formData.value.priceAmount <= 0) {
    errors.value.priceAmount = 'Price amount is required and must be greater than 0'
  }
  
  if (!formData.value.priceCurrency) {
    errors.value.priceCurrency = 'Currency is required'
  }
  
  if (!formData.value.status) {
    errors.value.status = 'Status is required'
  }
  
  return Object.keys(errors.value).length === 0
}

// Methods
const handleSubmit = async () => {
  if (!validateForm()) return
  
  if (!props.project?.id) {
    emit('error', 'No project selected')
    return
  }

  // Check if project has already been published as a product
  if (props.project?.status === 'Garment') {
    emit('error', 'This project has already been published as a product and cannot be published again.')
    return
  }

  // Check if project has layers
  if (!props.project?.layers || props.project.layers.length === 0) {
    emit('error', 'Project must have at least one layer to create a product.')
    return
  }

  loading.value = true
  
  try {
    const productData = {
      projectId: props.project.id,
      userId: authenticationService.currentUserId.value,
      priceAmount: parseFloat(Number(formData.value.priceAmount).toFixed(2)),
      priceCurrency: formData.value.priceCurrency,
      status: formData.value.status
    }

    console.log('Product creation payload:', JSON.stringify(productData, null, 2));
    console.log('Form data:', JSON.stringify(formData.value, null, 2));
    console.log('Project:', JSON.stringify(props.project, null, 2));

    const createdProduct = await productCatalogService.createProduct(productData)
    
    // Update project status to 'Garment' to mark it as published
    try {
      await designLabService.updateProjectDetails(props.project.id, {
        status: 'Garment',
        previewUrl: props.project.previewUrl,
        color: props.project.color,
        size: props.project.size,
        gender: props.project.gender
      });
    } catch (statusUpdateError) {
      console.warn('Failed to update project status after product creation:', statusUpdateError);
      // Don't fail the entire operation if status update fails
    }
    
    emit('product-created', createdProduct)
    handleCancel() // Close form and reset
    
  } catch (error) {
    console.error('Error creating product:', error)
    const errorMessage = error?.response?.data?.detail || 
                        error?.response?.data?.message || 
                        error?.message || 
                        'Failed to create product'
    emit('error', errorMessage)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  // Reset form
  formData.value = {
    priceAmount: null,
    priceCurrency: 'en-US',
    status: 'Available'
  }
  errors.value = {}
  
  emit('update:visible', false)
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp).toLocaleDateString()
}

// Watch for visibility changes to reset form
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    // Reset form when dialog opens
    formData.value = {
      priceAmount: null,
      priceCurrency: 'en-US',
      status: 'Available'
    }
    errors.value = {}
  }
})
</script>

<style scoped>
.product-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
}

.project-info-section {
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.project-info-section h4 {
  margin: 0 0 0.75rem 0;
  color: #495057;
  font-size: 1rem;
}

.project-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.project-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-field label {
  font-weight: 500;
  color: #6c757d;
  font-size: 0.85rem;
}

.project-field span {
  color: #495057;
  font-size: 0.85rem;
  font-weight: 400;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.p-error {
  color: #e24c4c;
  font-size: 0.8rem;
}

.p-invalid {
  border-color: #e24c4c;
}
</style>
