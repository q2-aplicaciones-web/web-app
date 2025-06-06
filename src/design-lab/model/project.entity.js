export class Project {
    constructor(
        id,
        userId,
        name,
        previewImageUrl,
        status,
        gender,
        garmentColor,
        garmentSize,
        lastModified,
        createdAt,
        layers
    ) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.previewImageUrl = previewImageUrl;
        this.status = status;
        this.gender = gender;
        this.garmentColor = garmentColor;
        this.garmentSize = garmentSize;
        this.lastModified = lastModified;
        this.createdAt = createdAt;
        this.layers = layers;
    }
}
