<script>
export default {
  name: 'DesignCanvas',
  props: {
    projectId: { type: String, required: true },
    layers: { type: Array, required: true }
  },
  data() {
    return {
      garmentColors: [
        { name: 'Black', hex: '#161615' },
        { name: 'Gray', hex: '#403D3B' },
        { name: 'LightGray', hex: '#B3B1AF' },
        { name: 'White', hex: '#EDEDED' },
        { name: 'Red', hex: '#B51B14' },
        { name: 'Pink', hex: '#F459B0' },
        { name: 'LightPurple', hex: '#D890E4' },
        { name: 'Purple', hex: '#693FA0' },
        { name: 'LightBlue', hex: '#00A5BC' },
        { name: 'Cyan', hex: '#31B7C9' },
        { name: 'SkyBlue', hex: '#3F9BDC' },
        { name: 'Blue', hex: '#1B3D92' },
        { name: 'Green', hex: '#1B8937' },
        { name: 'LightGreen', hex: '#5BBE65' },
        { name: 'Yellow', hex: '#FECD08' },
        { name: 'DarkYellow', hex: '#F2AB00' }
      ],
      selectedColor: 'White',
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
      resizeStart: { x: 0, y: 0, width: 0, height: 0 }
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
    selectedColorHex() {
      const color = this.garmentColors.find(c => c.name === this.selectedColor);
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
      const idx = colorOrder.indexOf(this.selectedColor);
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
        marginLeft: '24px',
        overflow: 'hidden',
      };
    }
  },
  methods: {
    selectColor(color) {
      this.selectedColor = color;
    },
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
      this.dragOffset = {
        x: e.clientX - (layer.x || 0),
        y: e.clientY - (layer.y || 0)
      };
      e.preventDefault();
    },
    startResize(e, layer) {
      this.resizing = true;
      this.resizeLayer = layer;
      this.resizeStart = {
        x: e.clientX,
        y: e.clientY,
        width: layer.details.width || 200,
        height: layer.details.height || 40
      };
      e.preventDefault();
    },
    onDrag(e) {
      if (this.resizing && this.resizeLayer) {
        const dx = e.clientX - this.resizeStart.x;
        const dy = e.clientY - this.resizeStart.y;
        let newWidth = Math.max(40, this.resizeStart.width + dx);
        let newHeight = Math.max(24, this.resizeStart.height + dy);
        this.resizeLayer.details.width = newWidth;
        this.resizeLayer.details.height = newHeight;
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
        await fetch(`/api/v1/projects/${this.projectId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl, width: '200', height: '200' })
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
      const body = {
        text: String(this.textInput),
        fontColor: String(this.fontColor),
        fontFamily: String(this.fontFamily),
        fontSize: Number(this.fontSize),
        isBold: false,
        isItalic: false,
        isUnderlined: false
      };
      if (isNaN(body.fontSize) || body.fontSize < 10 || body.fontSize > 100) {
        this.uploadError = 'El tamaño de fuente debe ser un número entre 10 y 100';
        return;
      }
      this.uploadError = '';
      try {
        const res = await fetch(`/api/v1/projects/${this.projectId}/texts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) {
          let errMsg = 'Error al crear la capa de texto';
          try {
            const err = await res.json();
            if (err && err.message) errMsg = err.message;
          } catch {}
          this.uploadError = errMsg;
          return;
        }
        this.textInput = '';
        this.fontColor = '#000000';
        this.fontFamily = 'Arial';
        this.fontSize = 24;
        this.$emit('refreshLayers');
      } catch (e) {
        this.uploadError = 'Error de red al crear la capa de texto';
      }
    },
    async deleteLayer(layerId) {
      await fetch(`/api/v1/projects/${this.projectId}/layers/${layerId}`, { method: 'DELETE' });
      this.$emit('refreshLayers');
    }
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
.layer:hover, .layer:focus-within {
  border: 2px solid #00b894;
  z-index: 20;
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
  width: 340px;
  height: 440px;
  margin-bottom: 24px;
  background: #fff;
  border: 2px solid #00b894;
  border-radius: 18px;
  margin-left: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
}

.design-canvas {
  min-height: 500px;
  background: #f8fafc;
  color: #222;
  padding: 32px 16px 16px 16px;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.10);
  max-width: 900px;
  margin: 0 auto;
}

.color-selector {
  margin-bottom: 18px;
}
.color-list {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.color-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid #bbb;
  cursor: pointer;
  transition: border 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.color-box.selected {
  border: 2px solid #00b894;
  box-shadow: 0 2px 8px rgba(0,184,148,0.15);
}

.upload-section, .text-section {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.upload-section label, .text-section label {
  font-weight: 500;
  margin-right: 8px;
}
.upload-section input[type="file"] {
  border: 1px solid #bbb;
  border-radius: 6px;
  padding: 4px 8px;
  background: #fff;
}
.text-section input[type="text"], .text-section input[type="color"], .text-section select, .text-section input[type="number"] {
  border: 1px solid #bbb;
  border-radius: 6px;
  padding: 4px 8px;
  background: #fff;
  font-size: 1rem;
}
.text-section button {
  background: #00b894;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.text-section button:hover {
  background: #009e74;
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
</style>

<template>
  <div class="design-canvas">
    <!-- Selector de color de polo -->
    <div class="color-selector">
      <label>Color del polo:</label>
      <div class="color-list">
        <div
          v-for="color in garmentColors"
          :key="color.name"
          :title="color.name"
          :style="{ background: color.hex }"
          class="color-box"
          :class="{ selected: selectedColor === color.name }"
          @click="selectColor(color.name)"
        ></div>
      </div>
    </div>

    <!-- Canvas de diseño -->
    <div class="canvas-area" :style="canvasSpriteStyle">
      <div
        v-for="layer in layers"
        :key="layer.id"
        class="layer"
        :style="layer.type === 'Image' ? imageStyle(layer) : textStyle(layer)"
        @mousedown="startDrag($event, layer)"
      >
        <img v-if="layer.type === 'Image'" :src="layer.details.imageUrl" draggable="false" :style="{ width: layer.details.width + 'px', height: layer.details.height + 'px' }" />
        <div v-else-if="layer.type === 'Text'"
          :style="{ width: layer.details.width ? layer.details.width + 'px' : 'auto', height: layer.details.height ? layer.details.height + 'px' : 'auto', resize: 'both', overflow: 'auto', minWidth: '40px', minHeight: '24px', display: 'inline-block' }"
          @mousedown.stop="startDrag($event, layer)">{{ layer.details.text }}</div>
        <div v-if="layer.type === 'Image' || layer.type === 'Text'" class="resize-handle" @mousedown.stop="startResize($event, layer)"></div>
        <button class="delete-btn" @click.stop="deleteLayer(layer.id)">x</button>
      </div>
    </div>

    <!-- Subir imagen -->
    <div class="upload-section">
      <label>Subir imagen:</label>
      <input type="file" @change="onImageUpload" accept="image/*" :disabled="uploading" />
      <span v-if="uploading" class="upload-loader">Subiendo...</span>
      <span v-if="uploadSuccess" class="upload-success">¡Imagen subida!</span>
      <span v-if="uploadError" class="upload-error">{{ uploadError }}</span>
    </div>

    <!-- Agregar texto -->
    <div class="text-section">
      <label>Agregar texto:</label>
      <input v-model="textInput" placeholder="Texto" />
      <input v-model="fontColor" type="color" />
      <select v-model="fontFamily">
        <option value="Arial">Arial</option>
        <option value="Verdana">Verdana</option>
        <option value="Times New Roman">Times New Roman</option>
      </select>
      <input v-model.number="fontSize" type="number" min="10" max="100" />
      <button @click="addTextLayer">Agregar texto</button>
    </div>
  </div>
</template>



<style scoped>
/* Estilos mejorados para el canvas y controles */
.design-canvas {
  min-height: 500px;
  background: #181818;
  color: #fff;
  padding: 24px;
}
.color-selector {
  margin-bottom: 16px;
}
.color-list {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.color-box {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 2px solid #333;
  cursor: pointer;
  transition: border 0.2s;
}
.color-box.selected {
  border: 2px solid #00e676;
}
.canvas-area {
  position: relative;
  width: 300px;
  height: 400px;
  margin-bottom: 24px;
  background: #fff;
  border: 1px solid #ccc;
  margin-left: 24px;
}
.layer {
  position: absolute;
}
.upload-section, .text-section {
  margin-top: 16px;
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
</style>
