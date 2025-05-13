<script setup>
import { ref, defineEmits } from "vue";
import FileUpload from "primevue/fileupload";
import Card from "primevue/card";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import Checkbox from "primevue/checkbox";

const emit = defineEmits(["add-layer"]);
const imageUrl = ref("");
const width = ref(200);
const height = ref(200);
const scale = ref(1);
const maintainAspectRatio = ref(true);

function onUpload(event) {
    const file = event.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageUrl.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function addImageLayer() {
    if (!imageUrl.value) return;
    emit("add-layer", {
        id: Date.now(),
        type: "image",
        imageUrl: imageUrl.value,
        width: width.value,
        height: height.value,
        scale: scale.value,
        maintainAspectRatio: maintainAspectRatio.value,
        x: 100,
        y: 100,
        dragging: false,
        offsetX: 0,
        offsetY: 0,
    });
    imageUrl.value = "";
}
</script>

<template>
    <Card class="options-panel">
        <template #title>Add Image</template>
        <template #content>
            <FileUpload mode="basic" accept="image/*" :auto="true" chooseLabel="Upload Image" @select="onUpload" />
            <div v-if="imageUrl" class="image-preview">
                <img :src="imageUrl" :style="{
                    maxWidth: '100%',
                    maxHeight: '120px',
                    margin: '1rem 0',
                }" />
            </div>
            <div class="form-group">
                <label>Width</label>
                <InputNumber v-model="width" :min="10" :max="600" />
            </div>
            <div class="form-group">
                <label>Height</label>
                <InputNumber v-model="height" :min="10" :max="600" />
            </div>
            <div class="form-group">
                <label>Scale</label>
                <InputNumber v-model="scale" :min="0.1" :max="3" :step="0.1" />
            </div>
            <div class="form-group">
                <Checkbox v-model="maintainAspectRatio" :binary="true" inputId="aspectRatio" />
                <label for="aspectRatio" style="margin-left: 0.5em">Maintain Aspect Ratio</label>
            </div>
            <Button label="Add Image Layer" @click="addImageLayer" :disabled="!imageUrl" />
        </template>
    </Card>
</template>

<style scoped>
.options-panel {
    padding: 1rem;
    border-radius: 8px;
    min-width: 220px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.image-preview {
    text-align: center;
}

.form-group {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>
