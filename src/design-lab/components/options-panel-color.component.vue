<script setup>
import { ref, defineEmits } from "vue";
import Dropdown from "primevue/dropdown";

const props = defineProps({
    modelValue: String,
    garmentColors: Array,
});
const emit = defineEmits(["update:modelValue"]);

const selectedColor = ref(
    props.modelValue || props.garmentColors?.[0]?.value || ""
);

function onColorChange(val) {
    emit("update:modelValue", val);
}
</script>

<template>
    <div class="options-panel">
        <div class="color-row">
            <h3>Change T-shirt Color</h3>
            <Dropdown
                v-model="selectedColor"
                :options="props.garmentColors"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Color"
                @change="onColorChange($event.value)"
                class="color-dropdown"
            >
                <template #option="slotProps">
                    <span
                        :style="{
                            display: 'inline-block',
                            width: '1.5em',
                            height: '1.5em',
                            background: slotProps.option.value,
                            borderRadius: '50%',
                            marginRight: '0.5em',
                            border: '1px solid #ccc',
                        }"
                    ></span>
                    <span>{{ slotProps.option.label.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }}</span>
                </template>
                <template #value="slotProps">
                    <span
                        v-if="slotProps.value"
                        :style="{
                            display: 'inline-block',
                            width: '1.5em',
                            height: '1.5em',
                            background: slotProps.value,
                            borderRadius: '50%',
                            marginRight: '0.5em',
                            border: '1px solid #ccc',
                        }"
                    ></span>
                    <span v-if="slotProps.value">{{
                        props.garmentColors.find(
                            (c) => c.value === slotProps.value
                        )?.label
                    }}</span>
                    <span v-else>Select Color</span>
                </template>
            </Dropdown>
        </div>
    </div>
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
.color-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
}
.color-row h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
    white-space: nowrap;
}
.color-dropdown {
    flex: 1;
    min-width: 0;
    align-self: center;
}
</style>
