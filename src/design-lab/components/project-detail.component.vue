<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { ProjectService } from "../services/project.service.js";
import Card from "primevue/card";
import Toolbar from "primevue/toolbar";
import Button from "primevue/button";
import OptionsPanelColor from "../../design-lab/components/options-panel-color.component.vue";
import OptionsPanelText from "../../design-lab/components/options-panel-text.component.vue";
import OptionsPanelImage from "../../design-lab/components/options-panel-image.component.vue";

const route = useRoute();
const project = ref(null);
const loading = ref(true);
const error = ref(null);
const selectedOption = ref("color");
const layers = ref([]);

const garmentColorImages = import.meta.env.VITE_GARMENT_COLOR_IMAGE_URL;
const garmentColors = [
    { label: "black", value: "#161615" },      // row 0, col 0
    { label: "grey", value: "#403D3B" },      // row 0, col 1
    { label: "light-grey", value: "#B3B1AF" },// row 0, col 2
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
    { label: "lime", value: "#5BBE65" },// row 3, col 1
    { label: "yellow", value: "#FECD08" },    // row 3, col 2
    { label: "mustard", value: "#F2AB00" } // row 3, col 3
];

function getGarmentColorPosition(label) {
    const idx = garmentColors.findIndex(
        (c) => c.label === label || c.value === label
    );
    if (idx === -1) return "0px 0px";
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    return `-${col * 600}px -${row * 600}px`;
}

onMounted(async () => {
    try {
        const response = await new ProjectService().getProjectById(
            route.params.id
        );
        project.value = response.data;
        
        // If the project has a canvas with layers, initialize them
        if (project.value && project.value.canvas && project.value.canvas.layers) {
            layers.value = project.value.canvas.layers.map(layer => {
                // Convert layer data to the format expected by the UI
                if (layer.type === 'text' && layer.content) {
                    return {
                        id: layer.id,
                        type: 'text',
                        text: layer.content.text,
                        x: layer.content.x || 100,
                        y: layer.content.y || 150,
                        fontFamily: layer.content.fontFamily || 'Arial',
                        fontSize: layer.content.fontSize || 24,
                        color: layer.content.color || '#000000',
                        bold: layer.content.bold || false,
                        italic: layer.content.italic || false,
                        underline: layer.content.underline || false,
                        dragging: false,
                        hovered: false,
                        offsetX: 0,
                        offsetY: 0
                    };
                } else if (layer.type === 'image' && layer.content) {
                    return {
                        id: layer.id,
                        type: 'image',
                        imageUrl: layer.content.imageUrl,
                        width: layer.content.width || 200,
                        height: layer.content.height || 200,
                        scale: layer.content.scale || 1,
                        maintainAspectRatio: layer.content.maintainAspectRatio || true,
                        x: layer.content.x || 100,
                        y: layer.content.y || 150,
                        dragging: false,
                        hovered: false,
                        offsetX: 0,
                        offsetY: 0
                    };
                }
                return null;
            }).filter(layer => layer !== null);
        }
    } catch (err) {
        error.value = err;
    } finally {
        loading.value = false;
    }
});

function addLayer(newLayer) {
    layers.value.push(newLayer);
}

function deleteLayer(id) {
    layers.value = layers.value.filter((l) => l.id !== id);
}

let currentDragLayer = null;
function startDrag(layer, event) {
    currentDragLayer = layer;
    layer.dragging = true;
    layer.offsetX = event.clientX - layer.x;
    layer.offsetY = event.clientY - layer.y;
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", stopDrag, { once: true });
}
function onDragMove(event) {
    if (!currentDragLayer || !currentDragLayer.dragging) return;
    currentDragLayer.x = event.clientX - currentDragLayer.offsetX;
    currentDragLayer.y = event.clientY - currentDragLayer.offsetY;
}
function stopDrag() {
    if (currentDragLayer) currentDragLayer.dragging = false;
    window.removeEventListener("mousemove", onDragMove);
    currentDragLayer = null;
}
onBeforeUnmount(() => {
    window.removeEventListener("mousemove", onDragMove);
});

function onGarmentColorChange(val) {
    if (project.value) project.value.garmentColor = val;
}
</script>

<template>
    <section class="project-detail">
        <div v-if="loading">Loading...</div>
        <div v-else-if="error">Error: {{ error.message }}</div>
        <Card v-if="project">
            <template #header>
                <Toolbar>
                    <template #start>
                        <Button
                            label="Color"
                            icon="pi pi-palette"
                            class="mr-2 toolbar-btn"
                            :outlined="selectedOption !== 'color'"
                            @click="selectedOption = 'color'"
                        />
                        <Button
                            label="Add Text"
                            icon="pi pi-font"
                            class="mr-2 toolbar-btn"
                            :outlined="selectedOption !== 'text'"
                            @click="selectedOption = 'text'"
                        />
                        <Button
                            label="Add Image"
                            icon="pi pi-image"
                            class="toolbar-btn"
                            :outlined="selectedOption !== 'image'"
                            @click="selectedOption = 'image'"
                        />
                    </template>
                </Toolbar>
                <div class="main-content-row">
                    <div class="main-image-panel">
                        <div
                            v-if="project.garmentColor"
                            class="garment-color-swatch tshirt-image"
                            :style="{
                                backgroundImage: `url(${garmentColorImages})`,                                backgroundPosition: getGarmentColorPosition(
                                    project.garmentColor
                                ),
                                width: '600px',
                                height: '600px',
                                backgroundSize: '2400px 2400px',
                                borderRadius: '16px',
                                border: '2px solid #eee',
                                margin: '1rem auto 0',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            }"
                        >
                            <div
                                v-for="layer in layers"
                                :key="layer.id"
                                class="draggable-text-layer"
                                :class="{
                                    dragging: layer.dragging,
                                    'image-layer': layer.type === 'image',
                                }"
                                :style="{
                                    left: layer.x + 'px',
                                    top: layer.y + 'px',
                                    fontFamily: layer.fontFamily,
                                    fontSize: layer.fontSize
                                        ? layer.fontSize + 'px'
                                        : undefined,
                                    color: layer.color,
                                    fontWeight: layer.bold ? 'bold' : 'normal',
                                    fontStyle: layer.italic
                                        ? 'italic'
                                        : 'normal',
                                    textDecoration: layer.underline
                                        ? 'underline'
                                        : 'none',
                                    position: 'absolute',
                                    zIndex: 10,
                                    width:
                                        layer.type === 'image'
                                            ? layer.width * (layer.scale || 1) +
                                              'px'
                                            : undefined,
                                    height:
                                        layer.type === 'image'
                                            ? layer.height *
                                                  (layer.scale || 1) +
                                              'px'
                                            : undefined,
                                }"
                                @mousedown="(e) => startDrag(layer, e)"
                                @mouseenter="layer.hovered = true"
                                @mouseleave="layer.hovered = false"
                            >
                                <template v-if="layer.type === 'image'">
                                    <img
                                        :src="layer.imageUrl"
                                        :style="{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                            borderRadius: '4px',
                                        }"
                                    />
                                </template>
                                <template v-else>
                                    <span>{{ layer.text }}</span>
                                </template>
                                <Button
                                    v-if="layer.hovered"
                                    icon="pi pi-times"
                                    class="delete-layer-btn"
                                    @click.stop="deleteLayer(layer.id)"
                                    rounded
                                    text
                                    severity="danger"
                                    aria-label="Delete Layer"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="main-options-panel">
                        <OptionsPanelColor
                            v-if="selectedOption === 'color'"
                            :modelValue="project.garmentColor"
                            :garmentColors="garmentColors"
                            @update:modelValue="onGarmentColorChange"
                        />
                        <OptionsPanelText
                            v-else-if="selectedOption === 'text'"
                            @add-layer="addLayer"
                        />
                        <OptionsPanelImage
                            v-else-if="selectedOption === 'image'"
                            @add-layer="addLayer"
                        />
                    </div>
                </div>
            </template>
            <template #title>
                {{ project.name }}
            </template>
            <template #subtitle>
                {{ project.genre }}
            </template>
            <p>Created: {{ new Date(project.createdAt).toLocaleString() }}</p>
            <p>Status: {{ project.status }}</p>
        </Card>
    </section>
</template>

<style scoped>
.project-detail {
    flex: 1;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}
.project-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 4px 4px 0 0;
    background: #f4f4f4;
}
.garment-color-swatch {
    background-repeat: no-repeat;
    position: relative;
    overflow: hidden;
    display: block;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.main-content-row {
    display: flex;
    flex-direction: row;
    gap: 2rem;
    margin-top: 1rem;
    padding: 1rem;
}
.main-image-panel {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow-x: auto; /* Allow horizontal scrolling if needed */
}
.main-options-panel {
    min-width: 220px;
    max-width: 320px;
}

@media (max-width: 992px) {
    .main-content-row {
        flex-direction: column;
        align-items: center;
    }
    .main-image-panel {
        margin-bottom: 2rem;
        width: 100%;
        overflow-x: auto;
    }
    .main-options-panel {
        width: 100%;
        max-width: 600px;
    }
}

@media (max-width: 768px) {
    .garment-color-swatch.tshirt-image {
        width: 450px !important;
        height: 450px !important;
        background-size: 1800px 1800px !important;
    }
}

@media (max-width: 480px) {
    .garment-color-swatch.tshirt-image {
        width: 320px !important;
        height: 320px !important;
        background-size: 1280px 1280px !important;
    }
}
.tshirt-image {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    height: auto;
}
.tshirt-outline {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
    opacity: 0.7;
}
.draggable-text-layer {
    cursor: grab;
    user-select: none;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.2s;
    min-width: 40px;
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    position: absolute;
}
.draggable-text-layer.dragging {
    cursor: grabbing;
}
.draggable-text-layer:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    z-index: 20;
}
.delete-layer-btn {
    position: absolute;
    top: -12px;
    right: -12px;
    z-index: 30;
    font-size: 1.1rem;
    padding: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.image-layer img {
    pointer-events: none;
}
.toolbar-btn {
    min-width: 140px;
    width: 140px;
    justify-content: center;
    margin-right: 0.5rem;
}
</style>
