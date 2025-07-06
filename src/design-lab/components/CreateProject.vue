<!-- ProjectCreateForm.vue - Create new design project -->
<template>
  <div class="create-project">
    <div class="create-project-container">
      <!-- Header -->
      <div class="header">
        <h1>Create New Project</h1>
        <p>Start designing your custom t-shirt</p>
      </div>

      <!-- Project Form -->
      <form @submit.prevent="handleSubmit" class="project-form">
        <!-- Project Title -->
        <div class="form-group">
          <label for="title">Project Name</label>
          <InputText
            id="title"
            v-model="formData.title"
            placeholder="Enter project name"
            :class="{ 'p-invalid': !formData.title }"
            required
          />
          <div class="form-help">Give your project a unique and descriptive name.</div>
        </div>

        <!-- Garment Color Selection -->
        <div class="form-group">
          <label for="color">Garment Color</label>
          <Select
            id="color"
            v-model="formData.garmentColor"
            :options="colorOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select color"
            class="w-full"
            required
          />
          <div class="form-help">Choose the t-shirt color for your design.</div>
        </div>

        <!-- Garment Size -->
        <div class="form-group">
          <label for="size">Size</label>
          <Select
            id="size"
            v-model="formData.garmentSize"
            :options="sizeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select size"
            class="w-full"
            required
          />
          <div class="form-help">Select the size for your t-shirt (e.g., S, M, L, XL).</div>
        </div>

        <!-- Gender -->
        <div class="form-group">
          <label for="gender">Gender</label>
          <Select
            id="gender"
            v-model="formData.garmentGender"
            :options="genderOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select gender"
            class="w-full"
            required
          />
          <div class="form-help">Choose the intended fit for the t-shirt.</div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            @click="goBack"
            outlined
          />
          <Button
            type="submit"
            :label="loading ? 'Creating...' : 'Create Project'"
            :loading="loading"
            :disabled="loading || !isFormValid"
            severity="primary"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjects } from '../composables/useProjects.js'
import { GARMENT_COLOR, getGarmentGenderOptions, getGarmentSizeOptions, getGarmentColorOptions } from '../../consts.js'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'

const router = useRouter()
const formData = ref({
  title: '',
  garmentColor: GARMENT_COLOR.WHITE,
  garmentSize: '',
  garmentGender: ''
})

const {
  loading,
  error,
  createProject
} = useProjects()

const genderOptions = getGarmentGenderOptions().map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt)
const sizeOptions = getGarmentSizeOptions().map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt)
const colorOptions = getGarmentColorOptions().map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt)

const isFormValid = computed(() => {
  return formData.value.title.trim() &&
         formData.value.garmentColor &&
         formData.value.garmentSize &&
         formData.value.garmentGender
})

const handleSubmit = async () => {
  if (!isFormValid.value) return
  try {
    const newProject = await createProject({
      title: formData.value.title.trim(),
      garmentColor: formData.value.garmentColor,
      garmentSize: formData.value.garmentSize,
      garmentGender: formData.value.garmentGender
    })
    if (newProject) {
      router.push(`/design-lab/${newProject.id}`)
    }
  } catch (err) {
    console.error('Failed to create project:', err)
  }
}

const goBack = () => {
  router.push('/design-lab')
}

onMounted(() => {
  const now = new Date()
  formData.value.title = `Design ${now.toLocaleDateString()}`
})
</script>

<style scoped>
/* Keep only layout and spacing styles, remove button/input custom styles */
.create-project { display: flex; align-items: center; justify-content: center; padding: 20px; }
.create-project-container { max-width: 600px; width: 100%; background: transparent; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 40px; }
.header { text-align: center; margin-bottom: 40px; }
.header h1 { margin: 0 0 10px 0; color: #ffffff; font-size: 2.5rem; }
.header p { margin: 0; color: #ffffff; font-size: 1.1rem; }
.project-form { display: flex; flex-direction: column; gap: 30px; }
.form-group { display: flex; flex-direction: column; }
.form-group label { font-weight: 600; margin-bottom: 10px; color: #ffffff; font-size: 1rem; }
.form-help { font-size: 0.9rem; color: #666; margin-top: 5px; }
.error-message { background: #f8d7da; color: #721c24; padding: 12px 16px; border-radius: 8px; border: 1px solid #f5c6cb; font-size: 0.9rem; }
.form-actions { display: flex; gap: 15px; justify-content: flex-end; margin-top: 20px; }
@media (max-width: 768px) {
  .create-project-container { padding: 20px; margin: 10px; }
  .header h1 { font-size: 2rem; }
  .form-actions { flex-direction: column; }
}
</style>
