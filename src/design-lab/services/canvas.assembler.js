import { LayerAssembler } from "./layer.assembler";

export class CanvasAssembler {
    static toEntityFromResponse(response) {
        return {
            id: response.id,
            projectId: response.project_id,
            backgroundColor: response.background_color,
            createdAt: new Date(response.created_at),
            lastModified: new Date(response.last_modified),
            layers: LayerAssembler.toEntitiesFromResponse(response.layers),
        };
    }
}
