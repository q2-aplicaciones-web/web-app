<template>
  <div class="design-canvas prime-adapted center-content">
    <div class="canvas-area" :style="canvasSpriteStyle" @click.self="selectedLayerId = null">
      <div
        v-for="layer in layers"
        :key="layer.id"
        class="layer"
        :style="layer.type === 'Image' ? { left: layer.x + 'px', top: layer.y + 'px', width: layer.details.width + 'px', height: layer.details.height + 'px', zIndex: layer.z || 1 } : textStyle(layer)"
        @mousedown="startDrag($event, layer)"
        @click.stop="selectedLayerId = layer.id"
        @contextmenu.prevent="showLayerMenu($event, layer)"
      >
        <div v-if="selectedLayerId === layer.id" class="selection-border"></div>
        <img v-if="layer.type === 'Image'" :src="layer.details.imageUrl" draggable="false" style="width: 100%; height: 100%; display: block;" />
        <template v-if="layer.type === 'Image' && selectedLayerId === layer.id">
          <div v-for="pos in ['tl','tr','bl','br']" :key="pos" :class="['corner-handle', pos]" @mousedown.stop="startResize($event, layer, pos)"></div>
        </template>
        <div v-else-if="layer.type === 'Text'"
          :style="{ width: layer.details.width ? layer.details.width + 'px' : 'auto', height: layer.details.height ? layer.details.height + 'px' : 'auto', resize: 'both', overflow: 'auto', minWidth: '40px', minHeight: '24px', display: 'inline-block' }"
          @mousedown.stop="startDrag($event, layer)">{{ layer.details.text }}</div>
      </div>
    </div>

    <!-- Upload Button Section -->
    <div class="upload-section-sep">
      <div class="prime-row minimal-row">
        <FileUpload mode="basic" name="file" accept="image/*" :auto="true" chooseIcon="pi pi-upload" chooseLabel="Upload Image" class="minimal-btn fileupload-full-width" :disabled="uploading" @select="onPrimeFileUpload" :customUpload="true" @uploader="onPrimeFileUpload" />
        <span v-if="uploading" class="upload-loader"><i class="pi pi-spin pi-spinner"></i></span>
        <span v-if="uploadSuccess" class="upload-success"><i class="pi pi-check"></i></span>
        <span v-if="uploadError" class="upload-error"><i class="pi pi-exclamation-triangle"></i></span>
      </div>
    </div>

    <!-- Text Options Section -->
    <div class="text-options-sep">
      <div class="prime-row minimal-row">
        <InputText v-model="textInput" placeholder="Texto" class="minimal-input" style="flex: 1;" />
      </div>
      <div class="prime-row minimal-row" >
        <Select v-model="fontFamily" :options="fontOptions" class="minimal-input" optionLabel="label" optionValue="value" />
        <InputNumber v-model="fontSize" :min="10" :max="100" class="minimal-input" style="width:auto; margin-right: 8px;" />
        <Select v-model="fontColor" :options="colorOptions" class="minimal-input" optionLabel="label" optionValue="value" />
        <Button icon="pi pi-plus" class="prime-btn minimal-btn" @click="addTextLayer" />
      </div>
    </div>

    <!-- Add PrimeVue ContextMenu component -->
    <ContextMenu ref="layerMenu" :model="layerMenuItems" />
  </div>
</template>

<script>
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import ContextMenu from 'primevue/contextmenu';
import designLabService from '../services/design-lab.service.js'
import cloudinaryService from '../services/cloudinary.service.js';
export default {
  name: 'DesignCanvas',
  components: { Button, FileUpload, InputText, Select, InputNumber, ContextMenu },
  props: {
    projectId: { type: String, required: true },
    layers: { type: Array, required: true },
    projectColor: { type: String, required: true }
  },
  data() {
    return {
      textInput: '',
      fontColor: '#000000',
      fontFamily: 'Arial',
      fontSize: 24,
      uploading: false,
      uploadSuccess: false,
      uploadError: '',
      // Drag & resize state
      dragging: false,
      dragLayer: null,
      dragOffset: { x: 0, y: 0 },
      resizing: false,
      resizeLayer: null,
      resizeStart: { x: 0, y: 0, width: 0, height: 0 },
      selectedLayerId: null,
      contextLayer: null,
      layerMenuItems: [
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          command: () => {
            if (this.contextLayer) this.deleteLayer(this.contextLayer.id);
          }
        }
      ],
      fontOptions: [
        { label: 'Arial', value: 'Arial' },
        { label: 'Verdana', value: 'Verdana' },
        { label: 'Times New Roman', value: 'Times New Roman' }
      ],
      colorOptions: [
        { label: 'Black', value: '#000000' },
        { label: 'White', value: '#FFFFFF' },
        { label: 'Red', value: '#FF0000' },
        { label: 'Green', value: '#008000' },
        { label: 'Blue', value: '#0000FF' },
        { label: 'Yellow', value: '#FFFF00' },
        { label: 'Orange', value: '#FFA500' },
        { label: 'Purple', value: '#800080' },
        { label: 'Pink', value: '#FFC0CB' },
        { label: 'Brown', value: '#A52A2A' },
        { label: 'Gray', value: '#808080' },
        { label: 'Light Gray', value: '#D3D3D3' },
        { label: 'Dark Gray', value: '#404040' },
        { label: 'Navy', value: '#000080' },
        { label: 'Teal', value: '#008080' },
        { label: 'Lime', value: '#00FF00' },
        { label: 'Cyan', value: '#00FFFF' },
        { label: 'Magenta', value: '#FF00FF' },
        { label: 'Maroon', value: '#800000' },
        { label: 'Olive', value: '#808000' }
      ],
    };
  },
  mounted() {
    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.stopDrag);
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDrag);
  },
  computed: {
    currentColor() {
      return this.projectColor;
    },
    selectedColorHex() {
      const color = cloudinaryService.getGarmentColorByLabel(this.currentColor);
      return color ? color.hex : '#EDEDED';
    },
    canvasSpriteStyle() {
      const spriteUrl = import.meta.env.VITE_GARMENT_COLOR_IMAGE_URL || 'https://res.cloudinary.com/dkkfv72vo/image/upload/f_webp,q_auto/v1748292478/FIJITA_xe3j7z';
      const segmentWidth = 600;
      const segmentHeight = 600;
      const gridCols = 4;
      const colorOrder = [
        'Black', 'Gray', 'LightGray', 'White',
        'Red', 'Pink', 'LightPurple', 'Purple',
        'LightBlue', 'Cyan', 'SkyBlue', 'Blue',
        'Green', 'LightGreen', 'Yellow', 'DarkYellow'
      ];
      const idx = colorOrder.indexOf(this.currentColor);
      const row = Math.floor(idx / gridCols);
      const col = idx % gridCols;
      const x = -(col * segmentWidth);
      const y = -(row * segmentHeight);
      return {
        width: segmentWidth + 'px',
        height: segmentHeight + 'px',
        backgroundImage: `url('${spriteUrl}')`,
        backgroundPosition: `${x}px ${y}px`,
        backgroundSize: `${segmentWidth * gridCols}px ${segmentHeight * 4}px`,
        position: 'relative',
        marginBottom: '24px',
        border: '1px solid #ccc',
        overflow: 'hidden',
        borderRadius: '18px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)'
      };
    }
  },
  methods: {
    imageStyle(layer) {
      return {
        maxWidth: '200px',
        maxHeight: '200px',
        position: 'absolute',
        left: layer.x + 'px',
        top: layer.y + 'px',
        zIndex: layer.z || 1
      };
    },
    textStyle(layer) {
      return {
        color: layer.details.fontColor || '#000',
        fontFamily: layer.details.fontFamily || 'Arial',
        fontSize: (layer.details.fontSize || 24) + 'px',
        fontWeight: layer.details.isBold ? 'bold' : 'normal',
        fontStyle: layer.details.isItalic ? 'italic' : 'normal',
        textDecoration: layer.details.isUnderlined ? 'underline' : 'none',
        position: 'absolute',
        left: layer.x + 'px',
        top: layer.y + 'px',
        zIndex: layer.z || 1
      };
    },
    startDrag(e, layer) {
      if (e.button !== 0) return;
      this.dragging = true;
      this.dragLayer = layer;
      const canvas = this.$el.querySelector('.canvas-area');
      const rect = canvas.getBoundingClientRect();
      this.dragOffset = {
        x: e.clientX - rect.left - (layer.x || 0),
        y: e.clientY - rect.top - (layer.y || 0)
      };
      e.preventDefault();
    },
    startResize(e, layer, pos) {
      this.resizing = true;
      this.resizeLayer = layer;
      this.resizeStart = {
        x: e.clientX,
        y: e.clientY,
        width: layer.details.width || 200,
        height: layer.details.height || 200,
        pos: pos, // 'tl', 'tr', 'bl', 'br'
        x0: layer.x,
        y0: layer.y
      };
      e.preventDefault();
    },
    onDrag(e) {
      if (this.resizing && this.resizeLayer) {
        const canvas = this.$el.querySelector('.canvas-area');
        const rect = canvas.getBoundingClientRect();
        const dx = e.clientX - this.resizeStart.x;
        const dy = e.clientY - this.resizeStart.y;
        let newWidth = this.resizeStart.width;
        let newHeight = this.resizeStart.height;
        let newX = this.resizeStart.x0;
        let newY = this.resizeStart.y0;
        switch (this.resizeStart.pos) {
          case 'tl':
            newWidth = Math.max(40, this.resizeStart.width - dx);
            newHeight = Math.max(24, this.resizeStart.height - dy);
            newX = this.resizeStart.x0 + dx;
            newY = this.resizeStart.y0 + dy;
            break;
          case 'tr':
            newWidth = Math.max(40, this.resizeStart.width + dx);
            newHeight = Math.max(24, this.resizeStart.height - dy);
            newX = this.resizeStart.x0;
            newY = this.resizeStart.y0 + dy;
            break;
          case 'bl':
            newWidth = Math.max(40, this.resizeStart.width - dx);
            newHeight = Math.max(24, this.resizeStart.height + dy);
            newX = this.resizeStart.x0 + dx;
            newY = this.resizeStart.y0;
            break;
          case 'br':
            newWidth = Math.max(40, this.resizeStart.width + dx);
            newHeight = Math.max(24, this.resizeStart.height + dy);
            newX = this.resizeStart.x0;
            newY = this.resizeStart.y0;
            break;
        }
        // Clamp to canvas bounds
        // For left/top handles, clamp newX/newY >= 0
        if (newX < 0) {
          newWidth += newX; // shrink width if out of bounds
          newX = 0;
        }
        if (newY < 0) {
          newHeight += newY;
          newY = 0;
        }
        // For right/bottom, clamp width/height so right/bottom edge stays in canvas
        if (newX + newWidth > rect.width) {
          newWidth = rect.width - newX;
        }
        if (newY + newHeight > rect.height) {
          newHeight = rect.height - newY;
        }
        newWidth = Math.max(40, newWidth);
        newHeight = Math.max(24, newHeight);
        this.resizeLayer.details.width = newWidth;
        this.resizeLayer.details.height = newHeight;
        this.resizeLayer.x = newX;
        this.resizeLayer.y = newY;
        return;
      }
      if (!this.dragging || !this.dragLayer) return;
      const canvas = this.$el.querySelector('.canvas-area');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      let newX = e.clientX - rect.left - this.dragOffset.x;
      let newY = e.clientY - rect.top - this.dragOffset.y;
      newX = Math.max(0, Math.min(newX, rect.width - 40));
      newY = Math.max(0, Math.min(newY, rect.height - 40));
      this.dragLayer.x = newX;
      this.dragLayer.y = newY;
    },
    stopDrag() {
      if (this.resizing && this.resizeLayer) {
        this.$emit('layer-resized', this.resizeLayer.id, {
          x: this.resizeLayer.x,
          y: this.resizeLayer.y,
          width: this.resizeLayer.details.width,
          height: this.resizeLayer.details.height
        });
      }
      this.resizing = false;
      this.resizeLayer = null;
      if (this.dragging && this.dragLayer) {
        this.$emit('layer-moved', this.dragLayer.id, { x: this.dragLayer.x, y: this.dragLayer.y });
      }
      this.dragging = false;
      this.dragLayer = null;
    },
    async onImageUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.uploading = true;
      this.uploadError = '';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'teelab');
      formData.append('folder', 'design-lab');
      const cloudName = 'dkkfv72vo';
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      let imageUrl = '';
      try {
        const response = await fetch(url, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (!data.secure_url) throw new Error('No se pudo obtener la URL de la imagen');
        imageUrl = data.secure_url;
      } catch (err) {
        this.uploadError = 'Error subiendo imagen a Cloudinary';
        this.uploading = false;
        return;
      }
      try {
        // Center the image in the canvas
        const canvas = this.$el.querySelector('.canvas-area');
        const rect = canvas.getBoundingClientRect();
        const width = 200;
        const height = 200;
        const x = Math.max(0, Math.round((rect.width - width) / 2));
        const y = Math.max(0, Math.round((rect.height - height) / 2));
        await fetch(`/api/v1/projects/${this.projectId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl, width: String(width), height: String(height), x, y })
        });
        this.uploadSuccess = true;
        setTimeout(() => { this.uploadSuccess = false; }, 1500);
        this.$emit('refreshLayers');
      } catch (err) {
        this.uploadError = 'Error guardando la imagen en el proyecto';
      } finally {
        this.uploading = false;
      }
    },
    async addTextLayer() {
      if (!this.textInput.trim()) {
        this.uploadError = 'El texto no puede estar vacío';
        return;
      }
      
      // Ensure fontColor is a valid hex color
      let validFontColor = this.fontColor;
      if (!validFontColor || typeof validFontColor !== 'string' || !validFontColor.startsWith('#')) {
        validFontColor = '#000000'; // Default to black
      }
      
      // Center the text in the canvas
      const canvas = this.$el.querySelector('.canvas-area');
      const rect = canvas.getBoundingClientRect();
      const width = 200;
      const height = 40;
      const x = Math.max(0, Math.round((rect.width - width) / 2));
      const y = Math.max(0, Math.round((rect.height - height) / 2));
      const body = {
        text: String(this.textInput),
        fontColor: String(validFontColor),
        fontFamily: String(this.fontFamily),
        fontSize: Number(this.fontSize),
        isBold: false,
        isItalic: false,
        isUnderlined: false,
        width,
        height,
        x,
        y
      };
      if (isNaN(body.fontSize) || body.fontSize < 10 || body.fontSize > 100) {
        this.uploadError = 'El tamaño de fuente debe ser un número entre 10 y 100';
        return;
      }
      this.uploadError = '';
      try {
        await designLabService.createTextLayer(this.projectId, body);
        this.textInput = '';
        this.fontColor = '#000000';
        this.fontFamily = 'Arial';
        this.fontSize = 24;
        this.$emit('refreshLayers');
      } catch (e) {
        this.uploadError = e?.message || 'Error al crear la capa de texto';
      }
    },
    async deleteLayer(layerId) {
      await fetch(`/api/v1/projects/${this.projectId}/layers/${layerId}`, { method: 'DELETE' });
      this.$emit('refreshLayers');
    },
    onPrimeFileUpload(event) {
      const file = event.files ? event.files[0] : (event.target && event.target.files ? event.target.files[0] : null);
      if (!file) return;
      this.onImageUpload({ target: { files: [file] } });
    },
    showLayerMenu(event, layer) {
      this.contextLayer = layer;
      this.$refs.layerMenu.show(event);
    },
  }
}
</script>

<style scoped>
/* Mejoras visuales para UI de layers */
.resize-handle {
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 18px;
  height: 18px;
  background: #fff;
  border: 2px solid #00b894;
  border-radius: 50%;
  cursor: se-resize;
  z-index: 10;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.resize-handle::after {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  border-right: 2px solid #00b894;
  border-bottom: 2px solid #00b894;
  border-radius: 2px;
  margin: 2px;
}

.layer {
  position: absolute;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  border: 2px solid transparent;
  transition: border 0.2s;
}

.delete-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #fff;
  color: #e74c3c;
  border: 2px solid #e74c3c;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  cursor: pointer;
  font-size: 15px;
  font-weight: bold;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.85;
  transition: background 0.2s, color 0.2s;
}
.delete-btn:hover {
  background: #e74c3c;
  color: #fff;
}

.canvas-area {
  position: relative;
  width: 600px;
  height: 600px;
  margin-bottom: 24px;
  background: #fff;
  border: 1px solid #ccc;
}
.prime-row.minimal-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 0;
}
.prime-row.minimal-row .p-fileupload {
  flex: 1 1 0;
  min-width: 120px;
}
.prime-row.minimal-row .p-fileupload .p-button {
  flex: 1 1 0;
  min-width: 120px;
  width: 100%;
  box-sizing: border-box;
}

.design-canvas {
  min-height: 500px;
  background: #181818;
  color: #fff;
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.10);
  max-width: 900px;
  margin: 0 auto;
}

/* Loader y feedback para subida de imagen */
.upload-loader {
  color: #00b894;
  margin-left: 10px;
}
.upload-success {
  color: #00b894;
  margin-left: 10px;
  font-weight: 500;
}
.upload-error {
  color: #e74c3c;
  margin-left: 10px;
  font-weight: 500;
}

/* Estilos mejorados para el canvas y controles */
.design-canvas {
  min-height: 500px;
  background: #181818;
  color: #fff;
  padding: 24px;
}
.canvas-area {
  position: relative;
  width: 600px;
  height: 600px;
  margin-bottom: 24px;
  background: #fff;
  border: 1px solid #ccc;
}
.layer {
  position: absolute;
}
.delete-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
}
.selection-border {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 2px solid #2196f3;
  border-radius: 6px;
  pointer-events: none;
  z-index: 21;
}

.corner-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  background: #fff;
  border: 2.5px solid #2196f3;
  border-radius: 50%;
  z-index: 22;
  box-shadow: 0 1px 4px rgba(33,150,243,0.12);
  cursor: pointer;
  font-size: 14px;
}
.corner-handle.tl { top: -8px; left: -8px; cursor: nwse-resize; }
.corner-handle.tr { top: -8px; right: -8px; cursor: nesw-resize; }
.corner-handle.bl { bottom: -8px; left: -8px; cursor: nesw-resize; }
.corner-handle.br { bottom: -8px; right: -8px; cursor: nwse-resize; }

/* Loader y feedback para subida de imagen */
.upload-loader {
  color: #ffd600;
  margin-left: 10px;
}
.upload-success {
  color: #00e676;
  margin-left: 10px;
}
.upload-error {
  color: #ff5252;
  margin-left: 10px;
}
.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.fileupload-full-width {
  flex: 1 1 0 !important;
  width: 100% !important;
  min-width: 0 !important;
}
.fileupload-full-width .p-button {
  width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box;
}

.upload-section-sep,
.text-options-sep {
  background: #232323;
  border-radius: 12px;
  padding: 18px 18px 14px 18px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 14px; /* Add vertical separation between the two inner divs */
}
.text-options-sep {
  padding-bottom: 10px;
}
</style>
