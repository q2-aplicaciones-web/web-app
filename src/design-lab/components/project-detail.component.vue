<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ProjectService } from "../services/project.service.js";
import Card from "primevue/card";
import Toolbar from "primevue/toolbar";
import Button from "primevue/button";
import OptionsPanelColor from "../../design-lab/components/options-panel-color.component.vue";
import OptionsPanelText from "../../design-lab/components/options-panel-text.component.vue";
import OptionsPanelImage from "../../design-lab/components/options-panel-image.component.vue";

const route = useRoute();
const router = useRouter();
const project = ref(null);
const loading = ref(true);
const error = ref(null);
const selectedOption = ref("color");
const layers = ref([]);
const hoveredLayerId = ref(null);
const selectedLayerId = ref(null);
const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    layerId: null,
    layerType: null
});

// Inject the page title functionality
const pageTitle = inject('pageTitle');

// Function to update project name in the backend
async function updateProjectName(newName) {
    try {
        if (project.value && project.value.id) {
            console.log('Current project data:', project.value);
            
            // Create updated project data with the proper JSON server format (snake_case)
            const updatedProject = {
                id: project.value.id,
                user_id: project.value.userId,
                created_at: project.value.createdAt,
                status: project.value.status,
                preview_image_url: project.value.previewImageUrl || "",
                name: newName, // Update the name
                garment_color: project.value.garmentColor,
                garment_size: project.value.garmentSize,
                last_modified: new Date().toISOString(), // Update timestamp
                gender: project.value.gender,
                layers: project.value.layers ? project.value.layers.map(layer => ({
                    id: layer.id,
                    project_id: project.value.id,
                    type: layer.type,
                    ...(layer.type === 'image' ? {
                        image_url: layer.imageUrl,
                        width: layer.width,
                        height: layer.height
                    } : {
                        text_content: layer.textContent,
                        font_size: layer.fontSize,
                        font_color: layer.fontColor,
                        font_family: layer.fontFamily,
                        bold: layer.bold,
                        italic: layer.italic,
                        underline: layer.underline
                    }),
                    visible: layer.visible,
                    opacity: layer.opacity,
                    z_index: layer.zIndex,
                    x: layer.x,
                    y: layer.y
                })) : []
            };
            
            console.log('Updating project with data:', updatedProject);
            
            // Call the service to update the project using fetch
            const response = await fetch(`http://localhost:3000/projects/${project.value.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProject)
            });
            
            if (response.ok) {
                const updatedData = await response.json();
                console.log('Update response:', updatedData);
                
                // Update local project data
                project.value.name = newName;
                project.value.lastModified = updatedProject.last_modified;
                
                console.log('Project name updated successfully to:', newName);
            } else {
                const errorText = await response.text();
                console.error('HTTP Error:', response.status, response.statusText, errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }
    } catch (error) {
        console.error('Error updating project name:', error);
        // You could show a toast notification here if needed
    }
}

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
        const response = await ProjectService.getProjectById(
            route.params.id
        );
        project.value = response.data;        // Update the page title using the injected function
        if (project.value && project.value.name && pageTitle) {
            pageTitle.setTitle(project.value.name);
            // Provide the update function to the parent
            pageTitle.setUpdateFunction(updateProjectName);
            // Update the document title
            document.title = `Q2 | ${project.value.name}`;
        }
        
        // If the project has layers, initialize them
        if (project.value && project.value.layers) {
            layers.value = project.value.layers.map(layer => {
                // Convert layer entity to the format expected by the UI
                if (layer.type === 'text') {
                    return {
                        id: layer.id,
                        type: 'text',
                        text: layer.textContent || layer.text_content || '',
                        x: layer.x || 100,
                        y: layer.y || 150,
                        fontFamily: layer.fontFamily || layer.font_family || 'Arial',
                        fontSize: layer.fontSize || layer.font_size || 24,
                        color: layer.fontColor || layer.font_color || '#000000',
                        bold: layer.bold || false,
                        italic: layer.italic || false,
                        underline: layer.underline || false,
                        dragging: false,
                        hovered: false,
                        offsetX: 0,
                        offsetY: 0
                    };
                } else if (layer.type === 'image') {
                    return {
                        id: layer.id,
                        type: 'image',
                        imageUrl: layer.imageUrl || layer.image_url || '',
                        width: layer.width || 200,
                        height: layer.height || 200,
                        x: layer.x || 100,
                        y: layer.y || 150,
                        dragging: false,
                        hovered: false,
                        offsetX: 0,
                        offsetY: 0
                    };
                }
                return null;
            }).filter(layer => layer !== null);
        }    } catch (err) {
        error.value = err;
    } finally {
        loading.value = false;
    }
    
    // Add global click listener to hide context menu
    window.addEventListener("click", hideContextMenu);
});

function addLayer(newLayer) {
    layers.value.push(newLayer);
}

function deleteLayer(id) {
    layers.value = layers.value.filter((l) => l.id !== id);
}

let currentDragLayer = null;
let currentResizeLayer = null;
let resizeDirection = '';

function startDrag(layer, event) {
    // If clicking on a resize handle, don't start drag
    if (event.target.classList.contains('resize-handle')) {
        return;
    }
    
    // Don't start drag if we're currently resizing
    if (currentResizeLayer) {
        return;
    }
    
    if (layer.type === 'image') {
        selectedLayerId.value = layer.id;
    }
    
    currentDragLayer = layer;
    layer.dragging = true;
    layer.offsetX = event.clientX - layer.x;
    layer.offsetY = event.clientY - layer.y;
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", stopDrag, { once: true });
}

function startResize(layer, direction, event) {
    event.stopPropagation();
    event.preventDefault();
    
    // Make sure we don't start dragging while resizing
    if (currentDragLayer) {
        stopDrag();
    }
    
    currentResizeLayer = layer;
    resizeDirection = direction;
    layer.resizing = true;
    selectedLayerId.value = layer.id; // Ensure the layer is selected when resizing
    
    // Store initial values
    layer.initialWidth = layer.width;
    layer.initialHeight = layer.height;
    layer.initialX = layer.x;
    layer.initialY = layer.y;
    layer.startMouseX = event.clientX;
    layer.startMouseY = event.clientY;
    
    window.addEventListener("mousemove", onResizeMove);
    window.addEventListener("mouseup", stopResize, { once: true });
}

function onResizeMove(event) {
    if (!currentResizeLayer || !currentResizeLayer.resizing) return;
    
    const layer = currentResizeLayer;
    const deltaX = event.clientX - layer.startMouseX;
    const deltaY = event.clientY - layer.startMouseY;
    
    switch (resizeDirection) {
        case 'se': // bottom-right
            layer.width = Math.max(20, layer.initialWidth + deltaX);
            layer.height = Math.max(20, layer.initialHeight + deltaY);
            break;
        case 'sw': // bottom-left
            const newWidth = Math.max(20, layer.initialWidth - deltaX);
            layer.width = newWidth;
            layer.height = Math.max(20, layer.initialHeight + deltaY);
            layer.x = layer.initialX + (layer.initialWidth - newWidth);
            break;
        case 'ne': // top-right
            layer.width = Math.max(20, layer.initialWidth + deltaX);
            const newHeight = Math.max(20, layer.initialHeight - deltaY);
            layer.height = newHeight;
            layer.y = layer.initialY + (layer.initialHeight - newHeight);
            break;
        case 'nw': // top-left
            const newW = Math.max(20, layer.initialWidth - deltaX);
            const newH = Math.max(20, layer.initialHeight - deltaY);
            layer.width = newW;
            layer.height = newH;
            layer.x = layer.initialX + (layer.initialWidth - newW);
            layer.y = layer.initialY + (layer.initialHeight - newH);
            break;
    }
}

function stopResize() {
    if (currentResizeLayer) {
        currentResizeLayer.resizing = false;
        // Clean up temporary properties
        delete currentResizeLayer.initialWidth;
        delete currentResizeLayer.initialHeight;
        delete currentResizeLayer.initialX;
        delete currentResizeLayer.initialY;
        delete currentResizeLayer.startMouseX;
        delete currentResizeLayer.startMouseY;
    }
    window.removeEventListener("mousemove", onResizeMove);
    currentResizeLayer = null;
    resizeDirection = '';
}
function onDragMove(event) {
    if (!currentDragLayer || !currentDragLayer.dragging || currentDragLayer.resizing) return;
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
    window.removeEventListener("mousemove", onResizeMove);
    window.removeEventListener("click", hideContextMenu);
});

function onGarmentColorChange(val) {
    if (project.value) project.value.garmentColor = val;
}

function onCanvasClick(event) {
    // Only deselect if we're clicking on the canvas background, not on a layer
    if (event.target.classList.contains('tshirt-image') || 
        event.target.classList.contains('garment-color-swatch')) {
        selectedLayerId.value = null;
    }
}

function onImageLayerClick(layer, event) {
    // Only handle selection if not clicking on resize handle
    if (!event.target.classList.contains('resize-handle')) {
        selectedLayerId.value = layer.id;
        event.stopPropagation(); // Prevent canvas click from deselecting
    }
}

function onTextRightClick(layer, event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Show context menu at mouse position
    contextMenu.value = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        layerId: layer.id,
        layerType: 'text'
    };
}

function onImageRightClick(layer, event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Show context menu at mouse position
    contextMenu.value = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        layerId: layer.id,
        layerType: 'image'
    };
    
    // Select the image when right-clicking
    selectedLayerId.value = layer.id;
}

function hideContextMenu() {
    contextMenu.value.visible = false;
}

function deleteLayerFromContext() {
    if (contextMenu.value.layerId) {
        deleteLayer(contextMenu.value.layerId);
        hideContextMenu();
    }
}
</script>

<template>    <section class="project-detail">
        <div v-if="loading">Loading...</div>
        <div v-else-if="error">Error: {{ error.message }}</div>
        <Card v-if="project" class="project-card">
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
                </Toolbar>                <div class="main-content-row">
                    <div class="main-image-panel">                        <div
                            v-if="project.garmentColor"
                            class="garment-color-swatch tshirt-image"
                            @click="onCanvasClick"
                            :style="{
                                backgroundImage: `url(${garmentColorImages})`,
                                backgroundPosition: getGarmentColorPosition(
                                    project.garmentColor
                                ),
                                width: '600px',
                                height: '600px',
                                backgroundSize: '2400px 2400px',
                                borderRadius: '16px',
                                border: '2px solid #eee',
                                margin: '0', /* Remove auto margin to keep it fixed */
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            }"
                        >
                            <div
                                v-for="layer in layers"
                                :key="layer.id"
                                class="draggable-text-layer"                                :class="{
                                    dragging: layer.dragging,
                                    'image-layer': layer.type === 'image',
                                    'selected': layer.type === 'image' && selectedLayerId === layer.id,
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
                                    zIndex: layer.type === 'image' && selectedLayerId === layer.id ? 50 : 10,                                    width:
                                        layer.type === 'image'
                                            ? layer.width + 'px'
                                            : undefined,
                                    height:
                                        layer.type === 'image'
                                            ? layer.height + 'px'
                                            : undefined,                                }"                                @mousedown="(e) => startDrag(layer, e)"
                                @click="layer.type === 'image' ? onImageLayerClick(layer, $event) : null"
                                @contextmenu="layer.type === 'image' ? onImageRightClick(layer, $event) : onTextRightClick(layer, $event)"
                                @mouseenter="hoveredLayerId = layer.id"
                                @mouseleave="hoveredLayerId = null"
                            ><template v-if="layer.type === 'image'">
                                    <img
                                        :src="layer.imageUrl"
                                        :style="{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'fill',
                                            borderRadius: '4px',
                                        }"
                                    />
                                </template>                                <template v-else>
                                    <span>{{ layer.text }}</span>
                                </template>
                                
                                <!-- Resize handles for selected images -->
                                <template v-if="layer.type === 'image' && selectedLayerId === layer.id">
                                    <div
                                        class="resize-handle resize-nw"
                                        @mousedown="(e) => startResize(layer, 'nw', e)"
                                    ></div>
                                    <div
                                        class="resize-handle resize-ne"
                                        @mousedown="(e) => startResize(layer, 'ne', e)"
                                    ></div>
                                    <div
                                        class="resize-handle resize-sw"
                                        @mousedown="(e) => startResize(layer, 'sw', e)"
                                    ></div>
                                    <div
                                        class="resize-handle resize-se"
                                        @mousedown="(e) => startResize(layer, 'se', e)"                                    ></div>
                                </template>
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
                    </div>                </div>
            </template>
            <p>Created: {{ new Date(project.createdAt).toLocaleString() }}</p>
            <p>Status: {{ project.status }}</p>
        </Card>
          <!-- Context Menu for Layers -->
        <div 
            v-if="contextMenu.visible"
            class="context-menu"
            :style="{
                left: contextMenu.x + 'px',
                top: contextMenu.y + 'px'
            }"
            @click.stop
        >
            <div class="context-menu-item" @click="deleteLayerFromContext">
                <i class="pi pi-trash"></i>
                <span>{{ contextMenu.layerType === 'image' ? 'Delete Image' : 'Delete Text' }}</span>
            </div>
        </div>
    </section>
</template>

<style scoped>
.project-detail {
    flex: 1;
    padding: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.project-card {
    width: 100%;
    max-width: 1100px;
    min-height: 500px;
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
    gap: 1rem;
    margin-top: 0.5rem;
    padding: 0.75rem;
    min-height: 400px;
}
.main-image-panel {
    width: 620px; /* Back to original size */
    min-width: 620px; /* Prevent shrinking */
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    margin-left: 0.5rem; /* Small margin to position close to left edge */
}
.main-options-panel {
    flex: 1; /* Take remaining space */
    min-width: 220px;
    max-width: 1200px;
    min-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
}

@media (max-width: 992px) {
    .main-content-row {
        flex-direction: column;
        align-items: flex-start; /* Align to start instead of center */
        min-height: auto;
        gap: 1rem;
    }
    .main-image-panel {
        width: 100%;
        min-width: auto;
        margin-left: 0;
        margin-bottom: 1rem;
        justify-content: center; /* Center on mobile */
    }
    .main-options-panel {
        width: 100%;
        max-width: 600px;
        min-height: 400px;
    }
    .project-card {
        min-height: auto;
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
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
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

.draggable-text-layer.image-layer {
    padding: 0; /* Remove padding for image layers */
    background: transparent; /* Ensure no background */
    border: none; /* Remove any border */
    box-shadow: none; /* Remove shadow for cleaner look */
}

.draggable-text-layer.image-layer.selected {
    border: 2px solid #007ad9; /* Blue border for selected images */
    box-shadow: 0 0 0 1px rgba(0, 122, 217, 0.3); /* Soft glow */
}
.draggable-text-layer.dragging {
    cursor: grabbing;
}
.draggable-text-layer:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    z-index: 20;
}

.draggable-text-layer.image-layer:hover {
    box-shadow: 0 4px 16px rgba(0, 122, 217, 0.3); /* Blue shadow for image hover */
    transform: scale(1.02); /* Slight scale on hover */
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
    background-color: #dc3545 !important;
    color: white !important;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.delete-layer-btn:hover {
    background-color: #c82333 !important;
    transform: scale(1.1);
}

.resize-handle {
    position: absolute;
    background-color: #007ad9;
    border: 2px solid white;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    z-index: 100;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    user-select: none;
    pointer-events: auto;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.resize-handle:hover {
    background-color: #0056b3;
    transform: scale(1.3);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
}

.resize-nw {
    top: -6px;
    left: -6px;
    cursor: nw-resize;
}

.resize-ne {
    top: -6px;
    right: -6px;
    cursor: ne-resize;
}

.resize-sw {
    bottom: -6px;
    left: -6px;
    cursor: sw-resize;
}

.resize-se {
    bottom: -6px;
    right: -6px;
    cursor: se-resize;
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

.context-menu {
    position: fixed;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 140px;
    padding: 4px 0;
}

.context-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 14px;
    color: #dc3545;
}

.context-menu-item:hover {
    background-color: #f5f5f5;
}

.context-menu-item i {
    font-size: 14px;
    width: 16px;
    display: flex;
    justify-content: center;
}
</style>
