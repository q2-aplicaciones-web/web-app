<script setup>
import { ref } from "vue";
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
    min-height: 580px;
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
</style>
