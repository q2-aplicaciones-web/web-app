export const DEFAULT_LAYER_STYLES = {
    IMAGE_URL: "", // TODO: Add default image url
    TEXT_CONTENT: "", // TODO: Add default text content
    FONT_SIZE: 16,
    FONT_COLOR: "#000000",
    FONT_FAMILY: "Arial",
    BOLD: false,
    ITALIC: false,
    UNDERLINE: false,
    TEXT_LAYER_BOLD_VALUE: "700",
    TEXT_LAYER_REGULAR_VALUE: "400",
};

export const PROJECT_STATUS = {
    IN_PROGRESS: "in progress",
    BLUEPRINT: "blueprint",
    COMPLETED: "completed",
};

// Note: PROJECT_GENDER, GARMENT_COLOR, and GARMENT_SIZE are now loaded dynamically via API
// from DesignLabService.getGenders(), getColors(), and getSizes()

export const LayerType = {
    IMAGE: "image",
    TEXT: "text",
};
