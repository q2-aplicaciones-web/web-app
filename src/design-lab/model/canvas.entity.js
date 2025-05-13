export class Canvas {
    _id;
    _projectId;
    _backgroundColor;
    _createdAt;
    _lastModified;
    _layers;

    constructor({
        id = "",
        projectId = "",
        backgroundColor = "",
        createdAt = new Date(),
        lastModified = new Date(),
        layers = [],
    }) {
        this._id = id;
        this._projectId = projectId;
        this._backgroundColor = backgroundColor;
        this._createdAt = createdAt;
        this._lastModified = lastModified;
        this._layers = layers;
    }
}
