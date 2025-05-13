export class Layer {
    _id;
    _canvasId;
    _type;
    _zIndex;
    _isVisible;
    _createdAt;
    _content;

    constructor({
        id = "",
        canvasId = "",
        type = "",
        zIndex = 0,
        isVisible = false,
        createdAt = new Date(),
        content = {},
    } = {}) {
        this._id = id;
        this._canvasId = canvasId;
        this._type = type;
        this._zIndex = zIndex;
        this._isVisible = isVisible;
        this._createdAt = createdAt;
        this._content = content;
    }

    get id() {
        return this._id;
    }

    get canvasId() {
        return this._canvasId;
    }

    get type() {
        return this._type;
    }

    get zIndex() {
        return this._zIndex;
    }

    get isVisible() {
        return this._isVisible;
    }

    get createdAt() {
        return this._createdAt;
    }

    get content() {
        return this._content;
    }
}
