import axios from "axios";
import { env } from "../../env";

const http = axios.create({
    baseURL: env.apiBaseUrl // + env.designLabPath,
});

export class DesignLabService {
    static baseURL = env.apiBaseUrl;

    static async getGenders() {
        try {
            const response = await http.get('/garment-gender');
            return response.data;
        } catch (error) {
            console.error('Error fetching genders:', error);
            throw error;
        }
    }

    static async getSizes() {
        try {
            const response = await http.get('/garment-sizes');
            return response.data;
        } catch (error) {
            console.error('Error fetching sizes:', error);
            throw error;
        }
    }

    static async getColors() {
        try {
            const response = await http.get('/garment-colors');
            return response.data;
        } catch (error) {
            console.error('Error fetching colors:', error);
            throw error;
        }
    }

    static async getProjectStatuses() {
        try {
            const response = await http.get('/project-status');
            return response.data;
        } catch (error) {
            console.error('Error fetching project statuses:', error);
            throw error;
        }
    }
}
