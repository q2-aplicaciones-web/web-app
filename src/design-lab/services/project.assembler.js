import { Project } from "../model/project.entity";
import { LayerAssembler } from "./layer.assembler";

export class ProjectAssembler {

    static toEntityFromResponse(response) {

        const layers = LayerAssembler.toEntitiesFromResponse(response.layers);

        return new Project(
            response.id,
            response.user_id,
            response.name,
            response.preview_image_url,
            response.status,
            response.gender,
            response.garment_color,
            response.garment_size,
            new Date(response.last_modified),
            new Date(response.created_at),
            layers
        );
    }

    static toEntitiesFromResponse(responses) {
        return responses.map(response => this.toEntityFromResponse(response));
    }
}
