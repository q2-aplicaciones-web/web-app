import { Canvas } from "./canvas.entity";

export class Project {
    _id;
    _userId;
    _createdAt;
    _status;

    _genre;
    _previewImageUrl;
    _name;
    _garmentColor;
    _garmentSize;
    _lastModified;
    _canvas;

    constructor({ userId, name, genre, garmentSize, color }) {
        this._id = crypto.randomUUID();
        this._userId = userId;
        this._createdAt = new Date();
        this._status = "blueprint";
        this._previewImageUrl = "";
        this._name = name;
        this._garmentColor = color;
        this._garmentSize = garmentSize;
        this._genre = genre;
        this._lastModified = new Date();
        this._canvas = new Canvas();
    }

    get id() {
        return this._id;
    }
    get userId() {
        return this._userId;
    }
    get createdAt() {
        return this._createdAt;
    }
    get status() {
        return this._status;
    }
    get genre() {
        return this._genre;
    }
    get previewImageUrl() {
        return this._previewImageUrl;
    }
    get name() {
        return this._name;
    }
    get garmentColor() {
        return this._garmentColor;
    }
    get garmentSize() {
        return this._garmentSize;
    }
    get lastModified() {
        return this._lastModified;
    }
    get canvas() {
        return this._canvas;
    }
}
