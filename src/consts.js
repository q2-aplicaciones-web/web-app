export const DEFAULT_LAYER_STYLES = {
    IMAGE_URL: '', // TODO: Add default image url
    TEXT_CONTENT: 'Sample Text', // Default text content
    FONT_SIZE: 16,
    FONT_COLOR: '#000000',
    FONT_FAMILY: 'Arial',
    IS_BOLD: false,
    IS_ITALIC: false,
    IS_UNDERLINED: false,
}

export const TEXT_LAYER_BOLD_VALUE = '700';
export const TEXT_LAYER_REGULAR_VALUE = '400';

export const PROJECT_STATUS = {
    BLUEPRINT: 'Blueprint',
    GARMENT: 'Garment',
    TEMPLATE: 'Template',
}

export const PROJECT_GENDER = {
    MEN: 'Men',
    WOMEN: 'Women',
    UNISEX: 'Unisex',
    KIDS: 'Kids',
}

export const GARMENT_COLOR = {
    BLACK: 'Black',
    GRAY: 'Gray',
    LIGHT_GRAY: 'LightGray',
    WHITE: 'White',
    RED: 'Red',
    PINK: 'Pink',
    LIGHT_PURPLE: 'LightPurple',
    PURPLE: 'Purple',
    LIGHT_BLUE: 'LightBlue',
    CYAN: 'Cyan',
    SKY_BLUE: 'SkyBlue',
    BLUE: 'Blue',
    GREEN: 'Green',
    LIGHT_GREEN: 'LightGreen',
    YELLOW: 'Yellow',
    DARK_YELLOW: 'DarkYellow',
}

export const GARMENT_SIZE = {
    XS: 'XS',
    S: 'S',
    M: 'M',
    L: 'L',
    XL: 'XL',
    XXL: 'XXL',
}

export const LAYER_TYPE = {
    IMAGE: 'IMAGE',
    TEXT: 'TEXT',
}

// API Configuration
export const API_CONFIG = {
    BASE_URL: '/api/v1',
    ENDPOINTS: {
        PROJECTS: '/projects',
        PROJECT_BY_ID: '/projects/{projectId}',
        TEXT_LAYERS: '/projects/{projectId}/texts',
        IMAGE_LAYERS: '/projects/{projectId}/images',
        DELETE_LAYER: '/projects/{projectId}/layers/{layerId}',
        UPDATE_TEXT_DETAILS: '/projects/{projectId}/layers/{layerId}/text-details',
        UPDATE_IMAGE_DETAILS: '/projects/{projectId}/layers/{layerId}/image-details',
    }
}

// Canvas configuration
export const CANVAS_CONFIG = {
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 5.0,
    DEFAULT_ZOOM: 1.0,
    GRID_SIZE: 20,
}

// Tool types for design lab
export const TOOL_TYPE = {
    SELECT: 'Select',
    TEXT: 'Text',
    IMAGE: 'Image',
    SHAPE: 'Shape',
    PAN: 'Pan',
    ZOOM: 'Zoom',
}

// Shape types
export const SHAPE_TYPE = {
    RECTANGLE: 'Rectangle',
    CIRCLE: 'Circle',
    TRIANGLE: 'Triangle',
    LINE: 'Line',
}

// Default dimensions for new layers
export const DEFAULT_LAYER_DIMENSIONS = {
    TEXT: { width: 200, height: 'auto' },
    IMAGE: { width: 200, height: 200 },
    SHAPE: { width: 100, height: 100 },
}

// Layer constraints
export const LAYER_CONSTRAINTS = {
    MIN_FONT_SIZE: 8,
    MAX_FONT_SIZE: 200,
    MIN_OPACITY: 0,
    MAX_OPACITY: 1,
    MIN_ROTATION: -360,
    MAX_ROTATION: 360,
}

// API Response status codes
export const API_STATUS = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
}

// Default project settings (aligned with new API)
export const DEFAULT_PROJECT_SETTINGS = {
    TITLE: 'New Project',
    DESCRIPTION: '',
    TAGS: [],
    STATUS: 'Blueprint',
    COLOR: 'White',           // Changed from GARMENT_COLOR
    SIZE: 'M',               // Changed from GARMENT_SIZE  
    GENDER: 'Unisex',        // Changed from GARMENT_GENDER
}

// Layer positioning defaults
export const DEFAULT_LAYER_POSITION = {
    X: 100,
    Y: 100,
    Z: 1,
    OPACITY: 1.0,
    IS_VISIBLE: true,
}

// Cloudinary Configuration (KEEP EXISTING)
import { env } from './env.js';

export const CLOUDINARY_CONFIG = {
    CLOUD_NAME: env.cloudinaryCloudName,
    UPLOAD_PRESET: env.cloudinaryUploadPreset,
    FOLDER: env.cloudinaryFolder,
    // Garment sprite configuration
    GARMENT_SPRITE: {
        TOTAL_WIDTH: 2400,
        TOTAL_HEIGHT: 2400,
        SEGMENT_WIDTH: 600,
        SEGMENT_HEIGHT: 600,
        GRID_COLS: 4,
        GRID_ROWS: 4,
    }
}

// Helper functions to get arrays for dropdowns (migrated from api-enums.js)
export const getGarmentColorOptions = () => 
  Object.values(GARMENT_COLOR);

export const getGarmentGenderOptions = () => 
  Object.values(PROJECT_GENDER);

export const getGarmentSizeOptions = () => 
  Object.values(GARMENT_SIZE);

export const getProjectStatusOptions = () => 
  Object.values(PROJECT_STATUS);
