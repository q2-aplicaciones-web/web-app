<script setup>
import { ref, computed } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";

const props = defineProps({
    modelValue: String,
    garmentColors: Array,
});
const emit = defineEmits(["update:modelValue"]);

const selectedColor = ref(
    props.modelValue || props.garmentColors?.[0]?.value || ""
);

// Organize colors into a 4x4 grid
const colorGrid = computed(() => {
    const grid = [];
    for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
            const index = i * 4 + j;
            if (props.garmentColors && props.garmentColors[index]) {
                row.push(props.garmentColors[index]);
            }
        }
        grid.push(row);
    }
    return grid;
});

function onColorChange(color) {
    selectedColor.value = color.value;
    emit("update:modelValue", color.value);
}

function getColorName(label) {
    return label.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
</script>

<template>    <Card class="options-panel">
        <template #content>
            <div class="color-section">
                <div class="section-title">
                    <i class="pi pi-palette"></i>
                    <span>Predetermined colors</span>
                </div>
                <div class="color-grid">
                    <div 
                        v-for="(row, rowIndex) in colorGrid" 
                        :key="rowIndex" 
                        class="color-row"
                    >
                        <Button
                            v-for="color in row"
                            :key="color.value"
                            :class="[
                                'color-button',
                                { 'selected': selectedColor === color.value }
                            ]"
                            :style="{
                                backgroundColor: color.value,
                                border: selectedColor === color.value 
                                    ? '3px solid #007ad9' 
                                    : '2px solid #ddd',
                                boxShadow: selectedColor === color.value 
                                    ? '0 4px 16px rgba(0, 122, 217, 0.5)' 
                                    : '0 2px 8px rgba(0, 0, 0, 0.15)'
                            }"
                            :title="getColorName(color.label)"
                            @click="onColorChange(color)"
                            :aria-label="`Select ${getColorName(color.label)} color`"
                        />
                    </div>
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
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.color-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: flex-start;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 300;
    color: white;
}

.section-title i {
    font-size: 1.2rem;
    color: white;
}

.color-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    justify-content: flex-start;
    align-items: flex-start;
}

.color-row {
    display: flex;
    gap: 1.5rem;
    justify-content: flex-start;
    align-items: center;
}

.color-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    min-width: 60px;
}

.color-button:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25) !important;
}

.color-button.selected {
    transform: scale(1.1);
}

.color-button:active {
    transform: scale(1.05);
}

@media (max-width: 768px) {
    .color-button {
        width: 50px;
        height: 50px;
        min-width: 50px;
    }
      .color-row {
        gap: 1.2rem;
    }
    
    .color-grid {
        gap: 1.2rem;
    }
}
</style>
