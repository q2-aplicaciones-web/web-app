import { computed } from 'vue';

export function useGarmentPreview(garmentColors, garmentColor) {
    const garmentColorImages = import.meta.env.VITE_GARMENT_COLOR_IMAGE_URL;
    
    const getGarmentColorPosition = computed(() => {
        return (colorValue) => {
            const idx = garmentColors.value.findIndex(
                (c) => c.label === colorValue || c.value === colorValue
            );
            if (idx === -1) return "0px 0px";
            const col = idx % 4;
            const row = Math.floor(idx / 4);
            return `-${col * 400}px -${row * 400}px`;
        };
    });
    
    const previewStyle = computed(() => ({
        backgroundImage: `url(${garmentColorImages})`,
        backgroundPosition: getGarmentColorPosition.value(garmentColor.value),
        width: '400px',
        height: '400px',
        backgroundSize: '1600px 1600px',
        borderRadius: '16px',
        border: '2px solid #eee',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
    }));
    
    return {
        garmentColorImages,
        getGarmentColorPosition,
        previewStyle
    };
}
