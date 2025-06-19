import { DEFAULT_LAYER_STYLES, LayerType } from "../../consts";

export class Layer {
    constructor(id, x, y, zIndex, opacity, visible, type) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.zIndex = zIndex;
        this.opacity = opacity;
        this.visible = visible;
        this.type = type;
    }

    getCssStyles() {
        throw new Error("getCssStyles method must be implemented by subclass");
    }

    getContent() {
        throw new Error("getContent method must be implemented by subclass");
    }
}

export class ImageLayer extends Layer {
    constructor(id, x, y, zIndex, opacity, visible, imageUrl) {
        super(id, x, y, zIndex, opacity, visible, LayerType.IMAGE);
        this.imageUrl = imageUrl;
    }

    getCssStyles() {
        return `position: absolute; left: ${this.x}px; top: ${
            this.y
        }px; z-index: ${this.zIndex}; opacity: ${this.opacity}; visibility: ${
            this.visible ? "visible" : "hidden"
        };`;
    }

    getContent() {
        return this.imageUrl;
    }
}

export class TextLayer extends Layer {
    constructor(
        id,
        x,
        y,
        zIndex,
        opacity,
        visible,
        textContent,
        fontSize,
        fontColor,
        fontFamily,
        bold,
        italic,
        underline
    ) {
        super(id, x, y, zIndex, opacity, visible, LayerType.TEXT);
        this.textContent = textContent;
        this.fontSize = fontSize;
        this.fontColor = fontColor;
        this.fontFamily = fontFamily;
        this.bold = bold;
        this.italic = italic;
        this.underline = underline;
    }

    getCssStyles() {
        let fontWeight = this.bold
            ? DEFAULT_LAYER_STYLES.TEXT_LAYER_BOLD_VALUE
            : DEFAULT_LAYER_STYLES.TEXT_LAYER_REGULAR_VALUE;
        let fontStyle = this.italic ? "italic" : "normal"; // As the values wont change over time, we can hardcode them
        let textDecoration = this.underline ? "underline" : "none";
        return `position: absolute; left: ${this.x}px; top: ${
            this.y
        }px; z-index: ${this.zIndex}; opacity: ${this.opacity}; visibility: ${
            this.visible ? "visible" : "hidden"
        }; font-size: ${this.fontSize}px; color: ${
            this.fontColor
        }; font-family: ${
            this.fontFamily
        }; font-weight: ${fontWeight}; font-style: ${fontStyle}; text-decoration: ${textDecoration};`;
    }

    getContent() {
        return this.textContent;
    }
}
