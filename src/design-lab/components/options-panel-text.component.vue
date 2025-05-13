<script setup>
import {
    ref,
    computed,
    watch,
    nextTick,
    onMounted,
    onBeforeUnmount,
    defineEmits,
} from "vue";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import ColorPicker from "primevue/colorpicker";
import Button from "primevue/button";
import Card from "primevue/card";

const text = ref("");
const fontFamily = ref("Arial");
const fontSize = ref(24);
const color = ref("#222222");
const bold = ref(false);
const italic = ref(false);
const underline = ref(false);

const fontFamilies = [
    { label: "Arial", value: "Arial" },
    { label: "Helvetica", value: "Helvetica" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Courier New", value: "Courier New" },
    { label: "Verdana", value: "Verdana" },
    { label: "Georgia", value: "Georgia" },
    { label: "Tahoma", value: "Tahoma" },
    { label: "Trebuchet MS", value: "Trebuchet MS" },
];

const layers = ref([]);
const emit = defineEmits(["add-layer"]);

function createTextLayer() {
    const newLayer = {
        id: Date.now(),
        text: text.value,
        fontFamily: fontFamily.value,
        fontSize: fontSize.value,
        color: color.value,
        bold: bold.value,
        italic: italic.value,
        underline: underline.value,
        x: 100,
        y: 100,
        dragging: false,
        offsetX: 0,
        offsetY: 0,
        type: "text",
    };
    emit("add-layer", newLayer);
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
</script>

<template>
    <Card class="options-panel">
        <template #title> Add Text </template>
        <template #content>
            <div class="form-group">
                <label>Text</label>
                <InputText v-model="text" placeholder="Enter your text" />
            </div>
            <div class="form-group">
                <label>Font Family</label>
                <Dropdown
                    v-model="fontFamily"
                    :options="fontFamilies"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Font"
                />
            </div>
            <div class="form-group">
                <label>Font Size</label>
                <InputNumber v-model="fontSize" :min="8" :max="120" />
            </div>
            <div class="form-group">
                <label>Color</label>
                <ColorPicker v-model="color" />
            </div>
            <div class="form-group row">
                <label>Style</label>
                <Button :outlined="!bold" @click="bold = !bold" title="Bold"
                    ><b>B</b></Button
                >
                <Button
                    :outlined="!italic"
                    @click="italic = !italic"
                    title="Italic"
                    ><i>I</i></Button
                >
                <Button
                    :outlined="!underline"
                    @click="underline = !underline"
                    title="Underline"
                    ><u>U</u></Button
                >
            </div>
            <Button
                class="add-btn"
                @click="createTextLayer"
                label="Add Text Layer"
            />
        </template>
    </Card>
</template>

<style scoped>
.options-panel {
    border-radius: 8px;
    min-width: 220px;
}
.form-group {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.form-group.row {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
}
.input {
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 1rem;
}
.input-color {
    width: 2.5rem;
    height: 2.5rem;
    border: none;
    background: none;
    padding: 0;
}
.style-btn {
    border: 1px solid #ccc;
    background: #fff;
    border-radius: 4px;
    padding: 0.2rem 0.6rem;
    font-size: 1.1rem;
    cursor: pointer;
    margin-right: 0.2rem;
}
.style-btn.active {
    background: #d0eaff;
    border-color: #2196f3;
}
.add-btn {
    margin-top: 1rem;
    width: 100%;
    background: #2196f3;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 0.6rem;
    font-size: 1rem;
    cursor: pointer;
}
.add-btn:hover {
    background: #1769aa;
}
.draggable-container {
    position: relative;
    width: 600px;
    height: 600px;
    margin: 2rem auto 0 auto;
    background: #f4f4f4;
    border-radius: 8px;
    border: 2px dashed #e0e0e0;
}
.draggable-text-layer {
    position: absolute;
    cursor: move;
    user-select: none;
    padding: 0.2rem 0.5rem;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.2s;
}
.draggable-text-layer:active {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}
</style>
