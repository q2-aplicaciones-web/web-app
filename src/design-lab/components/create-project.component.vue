<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import Card from "primevue/card";
import { ProjectService } from "../services/project.service.js";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const toast = useToast();

const name = ref("");
const genre = ref("men");
const garmentColor = ref("#161615");
const garmentSize = ref("M");
const loading = ref(false);

const genres = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
];
const garmentSizes = [
  { label: "Small (S)", value: "S" },
  { label: "Medium (M)", value: "M" },
  { label: "Large (L)", value: "L" },
  { label: "Extra Large (XL)", value: "XL" }
];
const garmentColors = [
  { label: "black", value: "#161615" },      // row 0, col 0
  { label: "gray", value: "#403D3B" },      // row 0, col 1
  { label: "light-gray", value: "#B3B1AF" },// row 0, col 2
  { label: "white", value: "#EDEDED" },     // row 0, col 3
  { label: "red", value: "#B51B14" },       // row 1, col 0
  { label: "pink", value: "#F459B0" },      // row 1, col 1
  { label: "light-purple", value: "#D890E4" },// row 1, col 2
  { label: "purple", value: "#693FA0" },    // row 1, col 3
  { label: "light-blue", value: "#00A5BC" },// row 2, col 0
  { label: "cyan", value: "#31B7C9" },      // row 2, col 1
  { label: "sky-blue", value: "#3F9BDC" },  // row 2, col 2
  { label: "blue", value: "#1B3D92" },      // row 2, col 3
  { label: "green", value: "#1B8937" },     // row 3, col 0
  { label: "light-green", value: "#5BBE65" },// row 3, col 1
  { label: "yellow", value: "#FECD08" },    // row 3, col 2
  { label: "dark-yellow", value: "#F2AB00" } // row 3, col 3
];

const garmentColorImages = "https://res.cloudinary.com/dkkfv72vo/image/upload/v1747000549/Frame_530_hfhrko.webp";
function getGarmentColorPosition(label) {
  const idx = garmentColors.findIndex(
    (c) => c.label === label || c.value === label
  );
  if (idx === -1) return "0px 0px";
  const col = idx % 4;
  const row = Math.floor(idx / 4);
  return `-${col * 300}px -${row * 300}px`;
}

async function createProject() {
  loading.value = true;
  try {
    // Generate unique IDs
    const projectId = crypto.randomUUID();
    const canvasId = crypto.randomUUID();
    
    const data = {
      id: projectId,
      userId: "user-001", // Replace with real user logic if needed
      name: name.value,
      genre: genre.value,
      garmentColor: garmentColor.value,
      garmentSize: garmentSize.value,
      status: "blueprint",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      previewImageUrl: "https://placeholder.com/tshirt", // Placeholder URL to satisfy schema
      canvas: {
        id: canvasId,
        projectId: projectId, // Set the correct project ID reference
        backgroundColor: garmentColor.value,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        layers: [], // Empty array satisfies the schema
      },
    };
    
    // Call the service to create the project
    const response = await new ProjectService().createProject(data);
    
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
      <template #title>New Project</template>
      <template #content>
        <div class="form-content">
          <div class="preview-panel">
            <div
              class="garment-preview"
              :style="{
                backgroundImage: `url(${garmentColorImages})`,
                backgroundPosition: getGarmentColorPosition(garmentColor),
                width: '300px',
                height: '300px',
                backgroundSize: '1200px 1200px',
                borderRadius: '16px',
                border: '2px solid #eee',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
              }"
            ></div>
          </div>
          <div class="form-panel">
            <form @submit.prevent="createProject">
              <div class="form-group">
                <label for="name">Project Name</label>
                <InputText id="name" v-model="name" required placeholder="Enter project name" />
              </div>
              <div class="form-group">
                <label for="genre">Genre</label>
                <Dropdown id="genre" v-model="genre" :options="genres" optionLabel="label" optionValue="value" placeholder="Select genre" required />
              </div>              <div class="form-group">
                <label for="color">Garment Color</label>
                <Dropdown 
                  id="color" 
                  v-model="garmentColor" 
                  :options="garmentColors" 
                  optionLabel="label" 
                  optionValue="value" 
                  placeholder="Select color" 
                  required
                  :class="{ 'p-dropdown-max-height': true }"
                >
                  <template #option="slotProps">
                    <div class="color-option-item">
                      <span class="color-swatch" :style="{ backgroundColor: slotProps.option.value }"></span>
                      <span class="color-label">{{ slotProps.option.label.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }}</span>
                    </div>
                  </template>
                  <template #value="slotProps">
                    <div class="color-option-item" v-if="slotProps.value">
                      <span class="color-swatch" :style="{ backgroundColor: slotProps.value }"></span>
                      <span class="color-label">
                        {{ garmentColors.find(c => c.value === slotProps.value)?.label.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }}
                      </span>
                    </div>
                    <span v-else>Select color</span>
                  </template>
                </Dropdown>
              </div>              <div class="form-group">
                <label for="size">Garment Size</label>
                <Dropdown id="size" v-model="garmentSize" :options="garmentSizes" optionLabel="label" optionValue="value" placeholder="Select size" required />
              </div>
              <Button type="submit" label="Create Project" :loading="loading" :disabled="loading" class="create-btn" />
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
  align-items: flex-start;
  padding: 2rem;
}
.create-project-card {
  min-width: 700px;
  max-width: 900px;
  width: 100%;
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
  min-width: 300px;
}
.form-panel {
  flex: 1;
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
:deep(.p-dropdown-max-height .p-dropdown-items) {
  max-height: 250px;
  overflow-y: auto;
}
</style>
