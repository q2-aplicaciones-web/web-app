<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Button from "primevue/button";
import Card from "primevue/card";
import { ProjectService } from "../services/project.service.js";
import { useToast } from "primevue/usetoast";
import { useCreateProjectForm } from "../composables/useCreateProjectForm.js";
import { useGarmentPreview } from "../composables/useGarmentPreview.js";

const router = useRouter();
const toast = useToast();

// Use composables
const {
  name,
  gender,
  garmentColor,
  garmentSize,
  loading,
  loadingData,
  genders,
  garmentSizes,
  garmentColors,
  isFormValid,
  selectedColorLabel,
  getFormData,
  resetForm
} = useCreateProjectForm();

const { previewStyle } = useGarmentPreview(garmentColors, garmentColor);

// Computed properties for UI
const isSubmitDisabled = computed(() => loading.value || loadingData.value || !isFormValid.value);

const formatColorLabel = (label) => {
  return label?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
};

async function createProject() {
  loading.value = true;
  try {
    // Generate unique project ID
    const projectId = crypto.randomUUID();
    
    // Get form data using composable
    const formData = getFormData();
    
    // Create project data with proper structure
    const projectData = {
      id: projectId,
      ...formData
    };
    
    // Call the service to create the project
    const response = await ProjectService.createProject(projectData);
    
    // Show success message
    toast.add({ 
      severity: "success", 
      summary: "Project Created", 
      detail: "Your project was created successfully!", 
      life: 3000 
    });
    
    // Navigate to the design lab
    router.push("/design-lab");
  } catch (err) {
    // Show error message
    toast.add({ 
      severity: "error", 
      summary: "Error Creating Project", 
      detail: err.message || "Failed to create project. Please try again.", 
      life: 5000 
    });
    console.error("Error creating project:", err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="create-project-page">
    <Card class="create-project-card">
      <template #content>
        <div class="form-content">
          <div class="preview-panel">
            <div
              class="garment-preview"
              :style="previewStyle"
            ></div>
          </div>
          <div class="form-panel">
            <form @submit.prevent="createProject">
              <div class="form-group">
                <label for="name">Project Name</label>
                <InputText 
                  id="name" 
                  v-model="name" 
                  required 
                  placeholder="Enter project name"
                  :disabled="loadingData"
                />
              </div>
              <div class="form-group">
                <label for="gender">Gender</label>
                <Select 
                  id="gender" 
                  v-model="gender" 
                  :options="genders" 
                  optionLabel="label" 
                  optionValue="value" 
                  placeholder="Select gender" 
                  required
                  :disabled="loadingData"
                />
              </div>              <div class="form-group">
                <label for="color">Garment Color</label>
                <Select 
                  id="color" 
                  v-model="garmentColor" 
                  :options="garmentColors" 
                  optionLabel="label" 
                  optionValue="value" 
                  placeholder="Select color" 
                  required
                  :disabled="loadingData"
                  :class="{ 'p-select-max-height': true }"
                >
                  <template #option="slotProps">
                    <div class="color-option-item">
                      <span class="color-swatch" :style="{ backgroundColor: slotProps.option.value }"></span>
                      <span class="color-label">{{ formatColorLabel(slotProps.option.label) }}</span>
                    </div>
                  </template>
                  <template #value="slotProps">
                    <div class="color-option-item" v-if="slotProps.value">
                      <span class="color-swatch" :style="{ backgroundColor: slotProps.value }"></span>
                      <span class="color-label">{{ formatColorLabel(selectedColorLabel) }}</span>
                    </div>
                    <span v-else>Select color</span>
                  </template>
                </Select>
              </div>
              <div class="form-group">
                <label for="size">Garment Size</label>
                <Select 
                  id="size" 
                  v-model="garmentSize" 
                  :options="garmentSizes" 
                  optionLabel="label" 
                  optionValue="value" 
                  placeholder="Select size" 
                  required
                  :disabled="loadingData"
                />
              </div>
              <Button 
                type="submit" 
                label="Create Project" 
                :loading="loading" 
                :disabled="isSubmitDisabled" 
                class="create-btn" 
              />
            </form>
          </div>
        </div>
      </template>
    </Card>
  </section>
</template>

<style scoped>
.create-project-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  padding: 2rem;
}
.create-project-card {
  min-width: 700px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .create-project-page {
    padding: 1rem;
  }
  .create-project-card {
    min-width: auto;
  }
}
.form-content {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}
.preview-panel {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-width: 400px;
}
.form-panel {
  flex: 1;
}

@media (max-width: 768px) {
  .form-content {
    flex-direction: column;
    align-items: center;
  }
  .preview-panel {
    order: -1; /* This makes the preview panel appear first */
    margin-bottom: 2rem;
  }
  .form-panel {
    width: 100%;
  }
}
.garment-preview {
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}
.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.create-btn {
  width: 100%;
}
.color-option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.color-swatch {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
:deep(.p-select-max-height .p-select-overlay .p-select-list) {
  max-height: 250px;
  overflow-y: auto;
}
</style>
