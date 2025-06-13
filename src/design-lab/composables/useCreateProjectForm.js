import { ref, computed, onMounted } from 'vue';
import { DesignLabService } from '../services/design-lab.service.js';
import { env } from '../../env';

export function useCreateProjectForm() {
    // Form state
    const name = ref('');
    const gender = ref('');
    const garmentColor = ref('');
    const garmentSize = ref('');
    const loading = ref(false);
    
    // Data arrays
    const genders = ref([]);
    const garmentSizes = ref([]);
    const garmentColors = ref([]);
    const projectStatuses = ref([]);
    const loadingData = ref(true);
    
    // Computed properties
    const isFormValid = computed(() => {
        return name.value.trim() && 
               gender.value && 
               garmentColor.value && 
               garmentSize.value;
    });
    
    const selectedGenderLabel = computed(() => {
        const selectedGender = genders.value.find(g => g.value === gender.value);
        return selectedGender?.label || '';
    });
    
    const selectedColorLabel = computed(() => {
        const selectedColor = garmentColors.value.find(c => c.value === garmentColor.value);
        return selectedColor?.label || '';
    });
    
    const selectedSizeLabel = computed(() => {
        const selectedSize = garmentSizes.value.find(s => s.value === garmentSize.value);
        return selectedSize?.label || '';
    });
    
    // Methods
    async function loadFormData() {
        loadingData.value = true;
        try {
            const [gendersData, sizesData, colorsData, statusesData] = await Promise.all([
                DesignLabService.getGenders(),
                DesignLabService.getSizes(),
                DesignLabService.getColors(),
                DesignLabService.getProjectStatuses()
            ]);
            
            genders.value = gendersData;
            garmentSizes.value = sizesData;
            garmentColors.value = colorsData;
            projectStatuses.value = statusesData;
            
            // Set default values
            setDefaultValues();
            
        } catch (error) {
            console.error('Error loading form data:', error);
            throw error;
        } finally {
            loadingData.value = false;
        }
    }
    
    function setDefaultValues() {
        if (genders.value.length > 0 && !gender.value) {
            gender.value = genders.value[0].value;
        }
        
        if (garmentSizes.value.length > 0 && !garmentSize.value) {
            // Try to find 'M' or use the first size
            const mediumSize = garmentSizes.value.find(s => s.value === 'M');
            garmentSize.value = mediumSize?.value || garmentSizes.value[0].value;
        }
        
        if (garmentColors.value.length > 0 && !garmentColor.value) {
            // Try to find black or use the first color
            const blackColor = garmentColors.value.find(c => c.label === 'black');
            garmentColor.value = blackColor?.value || garmentColors.value[0].value;
        }
    }
    
    function resetForm() {
        name.value = '';
        setDefaultValues();
    }
    
    function getFormData() {
        return {
            name: name.value.trim(),
            gender: gender.value,
            garment_color: garmentColor.value,
            garment_size: garmentSize.value,
            status: 'blueprint', // Default status
            user_id: env.defaultUserId,
            created_at: new Date().toISOString(),
            last_modified: new Date().toISOString(),
            preview_image_url: 'https://picsum.photos/150/150',
            layers: []
        };
    }
    
    // Initialize data on mount
    onMounted(loadFormData);
    
    return {
        // State
        name,
        gender,
        garmentColor,
        garmentSize,
        loading,
        loadingData,
        
        // Data
        genders,
        garmentSizes,
        garmentColors,
        projectStatuses,
        
        // Computed
        isFormValid,
        selectedGenderLabel,
        selectedColorLabel,
        selectedSizeLabel,
        
        // Methods
        loadFormData,
        setDefaultValues,
        resetForm,
        getFormData
    };
}
