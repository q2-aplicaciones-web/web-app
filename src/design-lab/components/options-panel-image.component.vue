<script setup>
import { ref } from "vue";
import Card from "primevue/card";

const emit = defineEmits(["add-layer"]);
const imageUrl = ref("");
const naturalWidth = ref(0);
const naturalHeight = ref(0);

function onFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageUrl.value = e.target.result;
            
            // Create an image element to get natural dimensions
            const img = new Image();
            img.onload = () => {
                // Calculate small dimensions (max 100px for canvas placement)
                const maxSize = 100;
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                
                if (img.naturalWidth > img.naturalHeight) {
                    // Landscape
                    naturalWidth.value = maxSize;
                    naturalHeight.value = maxSize / aspectRatio;
                } else {
                    // Portrait or square
                    naturalHeight.value = maxSize;
                    naturalWidth.value = maxSize * aspectRatio;
                }
                
                // Automatically add the image layer to canvas
                addImageLayer();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function addImageLayer() {
    if (!imageUrl.value) return;
      // Calculate center position for the canvas
    // Assuming canvas dimensions (you might want to get these from props or context)
    const canvasWidth = 400; // Default canvas width
    const canvasHeight = 500; // Default canvas height
    
    const centerX = (canvasWidth - naturalWidth.value) / 2 + 80; // Move 80px more to the right
    const centerY = (canvasHeight - naturalHeight.value) / 2;
    
    emit("add-layer", {
        id: Date.now(),
        type: "image",
        imageUrl: imageUrl.value,
        width: naturalWidth.value,
        height: naturalHeight.value,
        x: centerX,
        y: centerY,
        dragging: false,
        resizing: false,
        offsetX: 0,
        offsetY: 0,
    });
    // Reset values after adding
    imageUrl.value = "";
    naturalWidth.value = 0;
    naturalHeight.value = 0;
}
</script>

<template>    <Card class="options-panel">
        <template #content>

            <div class="upload-container">
                <input 
                    ref="fileInput" 
                    type="file" 
                    accept="image/*" 
                    @change="onFileSelect" 
                    style="display: none;"
                />
                <button @click="$refs.fileInput.click()" class="custom-upload-button">
                    <i class="pi pi-upload"></i>
                    <span>Upload Image</span>
                </button>
            </div>
            <div v-if="imageUrl" class="image-preview">
                <img :src="imageUrl" :style="{
                    maxWidth: '100%',
                    maxHeight: '120px',
                    margin: '1rem 0',
                }" />
                <div class="image-info">
                    <small>Added to canvas: {{ Math.round(naturalWidth) }} × {{ Math.round(naturalHeight) }}px</small>
                </div>
            </div>
        </template>
    </Card>
</template>

<style scoped>
.options-panel {
    padding: 1.5rem;
    border-radius: 8px;
    min-width: 220px;
    min-height: 580px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    text-align: left;
}

.upload-container {
    width: 100%;
    margin: 1rem 0;
}

.custom-upload-button {
    width: 100%;
    padding: 0.5rem 2rem;
    font-size: 1rem;
    min-height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #34d399;
    color: rgb(34,24,27);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-sizing: border-box;
    span{
        margin-left: 0.5rem;
        font-weight: 400;
    }
}

.custom-upload-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: #10b981;
}

.image-preview {
    text-align: center;
}

.image-info {
    margin-top: 0.5rem;
    color: #666;
    font-size: 0.875rem;
}
</style>
