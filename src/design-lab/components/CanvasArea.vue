<!-- DesignCanvas.vue - Main design canvas with layer rendering and interaction -->
<template>
  <div class="canvas-area">
    <!-- Canvas Container -->
    <div class="canvas-container" ref="canvasContainer">
      <!-- Garment Background -->
      <div 
        class="garment-background"
        :style="garmentStyle"
        @click="handleCanvasClick"
      >
        <!-- Layer Rendering -->
        <div
          v-for="layer in visibleLayers"
          :key="layer.id"
          class="canvas-layer"
          :class="{ 
            'selected': isLayerSelected(layer),
            'dragging': draggingLayer?.id === layer.id
          }"
          :style="getLayerStyle(layer)"
          @click.stop="selectLayer(layer)"
          @mousedown="startDrag(layer, $event)"
        >
          <!-- Text Layer -->
          <div
            v-if="layer.type === 'text'"
            class="text-layer"
            :style="getTextStyle(layer)"
          >
            {{ layer.text || 'Text Layer' }}
          </div>

          <!-- Image Layer -->
          <div
            v-else-if="layer.type === 'image'"
            class="image-layer"
          >
            <img
              v-if="layer.imageUrl"
              :src="layer.imageUrl"
              :alt="layer.name || 'Image layer'"
              :style="getImageStyle(layer)"
              draggable="false"
            />
            <div v-else class="image-placeholder">
              🖼 No Image
            </div>
          </div>

          <!-- Selection Handles -->
          <div v-if="isLayerSelected(layer)" class="selection-handles">
            <div class="handle handle-nw" @mousedown.stop="startResize(layer, 'nw', $event)"></div>
            <div class="handle handle-ne" @mousedown.stop="startResize(layer, 'ne', $event)"></div>
            <div class="handle handle-sw" @mousedown.stop="startResize(layer, 'sw', $event)"></div>
            <div class="handle handle-se" @mousedown.stop="startResize(layer, 'se', $event)"></div>
          </div>
        </div>

        <!-- Canvas Info Overlay -->
        <div v-if="layers.length === 0" class="canvas-empty">
          <div class="empty-message">
            <h4>Design Canvas</h4>
            <p>Add text or image layers to start designing</p>
            <div class="garment-info">
              <span>Garment Color: {{ getCurrentColorName() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Canvas Controls -->
      <div class="canvas-controls">
        <div class="zoom-controls">
          <button @click="zoomOut" class="btn btn-icon" title="Zoom Out">-</button>
          <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
          <button @click="zoomIn" class="btn btn-icon" title="Zoom In">+</button>
          <button @click="resetZoom" class="btn btn-small" title="Reset Zoom">Reset</button>
        </div>
        
        <div class="canvas-info">
          <span>{{ layers.length }} layer{{ layers.length !== 1 ? 's' : '' }}</span>
          <span v-if="selectedLayer">• Selected: {{ getLayerDisplayName(selectedLayer) }}</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button @click="centerAllLayers" class="btn btn-small">Center All</button>
      <button @click="clearSelection" class="btn btn-small">Clear Selection</button>
      <button @click="exportCanvas" class="btn btn-small btn-primary">Export</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useGarmentColors } from '../composables/useGarmentColors.js'

// Props
defineProps({
  project: {
    type: Object,
    required: true
  },
  layers: {
    type: Array,
    default: () => []
  },
  selectedLayer: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'layer-selected',
  'layer-moved',
  'layer-resized',
  'layer-updated'
])

// Refs
const canvasContainer = ref(null)
const zoom = ref(1)
const draggingLayer = ref(null)
const resizingLayer = ref(null)
const dragStart = ref({ x: 0, y: 0 })
const layerStart = ref({ x: 0, y: 0 })
const resizeHandle = ref('')

// Garment colors composable
const { getColorByValue, getColorStyle } = useGarmentColors()

// Computed properties
const visibleLayers = computed(() => {
  return props.layers
    .filter(layer => layer.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
})

const garmentStyle = computed(() => {
  const color = props.project?.garmentColor || '#EDEDED'
  const baseStyle = getColorStyle(color, 400)
  
  return {
    ...baseStyle,
    transform: `scale(${zoom.value})`,
    transformOrigin: 'center center',
    position: 'relative',
    margin: '50px auto',
    cursor: 'crosshair'
  }
})

// Methods
const isLayerSelected = (layer) => {
  return props.selectedLayer?.id === layer.id
}

const selectLayer = (layer) => {
  emit('layer-selected', layer)
}

const handleCanvasClick = () => {
  if (!draggingLayer.value && !resizingLayer.value) {
    emit('layer-selected', null)
  }
}

const getLayerStyle = (layer) => {
  const style = {
    position: 'absolute',
    left: `${layer.x || 0}px`,
    top: `${layer.y || 0}px`,
    cursor: 'move',
    userSelect: 'none'
  }

  if (layer.type === 'image') {
    style.width = `${layer.width || 100}px`
    style.height = `${layer.height || 100}px`
  }

  return style
}

const getTextStyle = (layer) => {
  return {
    fontSize: `${layer.fontSize || 16}px`,
    color: layer.color || '#000000',
    fontFamily: layer.fontFamily || 'Arial, sans-serif',
    fontWeight: layer.fontWeight || 'normal',
    fontStyle: layer.fontStyle || 'normal',
    textAlign: layer.textAlign || 'left',
    lineHeight: '1.2',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
}

const getImageStyle = (layer) => {
  return {
    width: '100%',
    height: '100%',
    objectFit: layer.objectFit || 'contain',
    opacity: layer.opacity || 1
  }
}

const getLayerDisplayName = (layer) => {
  if (layer.name) return layer.name
  return layer.type === 'text' ? 'Text Layer' : 'Image Layer'
}

const getCurrentColorName = () => {
  const color = getColorByValue(props.project?.garmentColor)
  return color ? color.label.replace('-', ' ') : 'Unknown'
}

// Drag functionality
const startDrag = (layer, event) => {
  if (event.button !== 0) return // Only left mouse button
  
  draggingLayer.value = layer
  dragStart.value = {
    x: event.clientX,
    y: event.clientY
  }
  layerStart.value = {
    x: layer.x || 0,
    y: layer.y || 0
  }

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', endDrag)
  event.preventDefault()
}

const handleDrag = (event) => {
  if (!draggingLayer.value) return

  const deltaX = (event.clientX - dragStart.value.x) / zoom.value
  const deltaY = (event.clientY - dragStart.value.y) / zoom.value

  const newX = layerStart.value.x + deltaX
  const newY = layerStart.value.y + deltaY

  emit('layer-moved', draggingLayer.value.id, { x: newX, y: newY })
}

const endDrag = () => {
  if (draggingLayer.value) {
    // Emit final position
    const layer = draggingLayer.value
    emit('layer-updated', layer.id, {
      x: layer.x,
      y: layer.y
    })
  }

  draggingLayer.value = null
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
}

// Resize functionality
const startResize = (layer, handle, event) => {
  if (event.button !== 0) return
  
  resizingLayer.value = layer
  resizeHandle.value = handle
  dragStart.value = {
    x: event.clientX,
    y: event.clientY
  }
  layerStart.value = {
    x: layer.x || 0,
    y: layer.y || 0,
    width: layer.width || 100,
    height: layer.height || 100
  }

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', endResize)
  event.preventDefault()
}

const handleResize = (event) => {
  if (!resizingLayer.value || resizingLayer.value.type !== 'image') return

  const deltaX = (event.clientX - dragStart.value.x) / zoom.value
  const deltaY = (event.clientY - dragStart.value.y) / zoom.value

  let newX = layerStart.value.x
  let newY = layerStart.value.y
  let newWidth = layerStart.value.width
  let newHeight = layerStart.value.height

  switch (resizeHandle.value) {
    case 'nw':
      newX = layerStart.value.x + deltaX
      newY = layerStart.value.y + deltaY
      newWidth = layerStart.value.width - deltaX
      newHeight = layerStart.value.height - deltaY
      break
    case 'ne':
      newY = layerStart.value.y + deltaY
      newWidth = layerStart.value.width + deltaX
      newHeight = layerStart.value.height - deltaY
      break
    case 'sw':
      newX = layerStart.value.x + deltaX
      newWidth = layerStart.value.width - deltaX
      newHeight = layerStart.value.height + deltaY
      break
    case 'se':
      newWidth = layerStart.value.width + deltaX
      newHeight = layerStart.value.height + deltaY
      break
  }

  // Minimum size constraints
  newWidth = Math.max(20, newWidth)
  newHeight = Math.max(20, newHeight)

  emit('layer-resized', resizingLayer.value.id, {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight
  })
}

const endResize = () => {
  if (resizingLayer.value) {
    const layer = resizingLayer.value
    emit('layer-updated', layer.id, {
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height
    })
  }

  resizingLayer.value = null
  resizeHandle.value = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', endResize)
}

// Zoom controls
const zoomIn = () => {
  zoom.value = Math.min(zoom.value * 1.2, 3)
}

const zoomOut = () => {
  zoom.value = Math.max(zoom.value / 1.2, 0.2)
}

const resetZoom = () => {
  zoom.value = 1
}

// Utility functions
const centerAllLayers = () => {
  const canvasCenter = { x: 200, y: 200 } // Approximate center of 400px garment
  
  props.layers.forEach(layer => {
    const layerCenter = {
      x: canvasCenter.x - (layer.width || 50) / 2,
      y: canvasCenter.y - (layer.height || 25) / 2
    }
    
    emit('layer-updated', layer.id, layerCenter)
  })
}

const clearSelection = () => {
  emit('layer-selected', null)
}

const exportCanvas = () => {
  // Simple export functionality - could be enhanced
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 400
  canvas.height = 400
  
  // This is a basic implementation
  // In a real app, you'd render all layers properly
  alert('Export functionality would be implemented here')
}

// Cleanup
onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', endResize)
})
</script>

<style scoped>
.canvas-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: auto;
  background-image: 
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.garment-background {
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: visible;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.canvas-layer {
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.canvas-layer:hover {
  border-color: #007bff;
}

.canvas-layer.selected {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3);
}

.canvas-layer.dragging {
  opacity: 0.8;
  z-index: 1000;
}

.text-layer {
  padding: 4px;
  background: transparent;
  border-radius: 2px;
  min-width: 20px;
  min-height: 20px;
}

.image-layer {
  border-radius: 4px;
  overflow: hidden;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 2px dashed #ddd;
  color: #666;
  font-size: 0.8rem;
  text-align: center;
}

.selection-handles {
  position: absolute;
  inset: -4px;
  pointer-events: none;
}

.handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #007bff;
  border: 1px solid white;
  border-radius: 50%;
  pointer-events: auto;
  cursor: pointer;
}

.handle-nw {
  top: 0;
  left: 0;
  cursor: nw-resize;
}

.handle-ne {
  top: 0;
  right: 0;
  cursor: ne-resize;
}

.handle-sw {
  bottom: 0;
  left: 0;
  cursor: sw-resize;
}

.handle-se {
  bottom: 0;
  right: 0;
  cursor: se-resize;
}

.canvas-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
}

.empty-message {
  text-align: center;
  color: #666;
}

.empty-message h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.empty-message p {
  margin: 0 0 15px 0;
  font-size: 0.9rem;
}

.garment-info {
  font-size: 0.8rem;
  color: #888;
}

.canvas-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-level {
  font-size: 0.8rem;
  color: #666;
  min-width: 40px;
  text-align: center;
}

.canvas-info {
  font-size: 0.8rem;
  color: #666;
}

.quick-actions {
  display: flex;
  gap: 8px;
  padding: 10px 15px;
  background: #fff;
  border-top: 1px solid #e9ecef;
}
</style>
