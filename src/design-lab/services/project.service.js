import axios from "axios";
import { ProjectAssembler } from "./project.assembler";

const baseUrl =
    import.meta.env.VITE_FAKE_API_BASE_URL || "http://localhost:3000";

const http = axios.create({
    baseURL: baseUrl,
});

export class ProjectService {
    async getProjects() {
        console.log("Fetching projects...");
        console.log(baseUrl);
        try {
            return await http
                .get("/projects")
                .then((response) =>
                    ProjectAssembler.toEntitiesFromResponse(response.data)
                );
        } catch (error) {
            this.handleError(error);
        }
    }

    async getProjectById(id) {
        try {
            return await http.get(`/projects/${id}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    // async createProject(data) {
    //     try {
    //         ProjectSchema.parse(data);
    //         return await http.post("/projects", data);
    //     } catch (error) {
    //         this.handleError(error);
    //     }
    // }    async updateProject(id, data) {
    //     try {
    //         console.log('ProjectService.updateProject called with:', { id, data });
    //         ProjectSchema.parse(data);
    //         console.log('Schema validation passed, making HTTP request...');
    //         const response = await http.put(`/projects/${id}`, data);
    //         console.log('HTTP response:', response);
    //         return response;
    //     } catch (error) {
    //         console.error('Error in updateProject:', error);
    //         this.handleError(error);
    //     }
    // }

    // async deleteProject(id) {
    //     try {
    //         return await http.delete(`/projects/${id}`);
    //     } catch (error) {
    //         this.handleError(error);
    //     }
    // }

    // handleError(error) {
    //     if (error.name === 'ZodError') {
    //         throw new Error('Validation failed: ' + error.errors.map(e => e.message).join(', '));
    //     }
    //     if (error.response) {
    //         throw new Error(`API Error: ${error.response.status} ${error.response.statusText}`);
    //     } else if (error.request) {
    //         throw new Error('No response received from server.');
    //     } else {
    //         throw new Error('Request error: ' + error.message);
    //     }
    // }
}
