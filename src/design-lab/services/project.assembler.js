import { CanvasAssembler } from "./canvas.assembler";

export class ProjectAssembler {
    static ToEntityFromResponse(response) {
        return {
            id: response.id,
            userId: response.user_id,
            createdAt: new Date(response.created_at),
            status: response.status,
            previewImageUrl: response.preview_image_url,
            genre: response.genre,
            name: response.name,
            garmentColor: response.tshirt_color,
            garmentSize: response.tshirt_size,
            lastModified: new Date(response.last_modified),
            canvas: CanvasAssembler.toEntityFromResponse(response.canvas),
        };
    }

    static ToEntitiesFromResponse(response) {
        return response.map((projectResponse) => {
            return ProjectAssembler.ToEntityFromResponse(projectResponse);
        });
    }
}
