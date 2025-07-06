import axios from "axios";
import { ProjectAssembler } from "./project.assembler";
import { authenticationService } from "../../iam/services/authentication.service.js";

const baseUrl =
    import.meta.env.VITE_FAKE_API_BASE_URL || "http://localhost:3000";



const http = axios.create({
    baseURL: baseUrl,
});

export class ProjectService {
    static async getProjects() {
        console.log("Fetching projects...");
        console.log(baseUrl);
        const userId = authenticationService.currentUserId.value || import.meta.env.VITE_DEFAULT_USER_ID || "user-1";
        try {
            const data = await http
                .get(`/projects?user_id=${userId}`)
                .then((response) =>
                    ProjectAssembler.toEntitiesFromResponse(response.data)
                );
            console.log("Projects fetched successfully:", data);
            return data;
        } catch (error) {
            console.error("Error fetching projects:", error);
            return [];
        }
    }

    static async getProjectById(id) {
        try {
            const response = await http.get(`/projects/${id}`);
            // Transform the response using the assembler
            const project = ProjectAssembler.toEntityFromResponse(response.data);
            return { data: project };
        } catch (error) {
            console.error("Error fetching project by ID:", error);
            throw error;
        }
    }

    static async createProject(data) {
        try {
            console.log('Creating project with data:', data);
            const response = await http.post("/projects", data);
            console.log('Project created successfully:', response);
            return response;
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }

    // async updateProject(id, data) {
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
