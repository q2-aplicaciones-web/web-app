import axios from "axios";
import { env } from "../../env";

const http = axios.create({
    baseURL: env.apiBaseUrl // + env.designLabPath,
});

export class DesignLabService {
    static async getGarmentColors() {
        try {
            return await http
                .get("/garment-colors")
                .then((response) => response);
        } catch (error) {
            console.error("Error fetching garment colors:", error);
            throw error;
        }
    }

    static async getGarmentSizes() {
        try {
            return await http
                .get("/garment-sizes")
                .then((response) => response);
        } catch (error) {
            console.error("Error fetching garment sizes:", error);
            throw error;
        }
    }

    static async getGarmentGender() {
        try {
            return await http
                .get("/garment-gender")
                .then((response) => response);
        } catch (error) {
            console.error("Error fetching garment gender:", error);
            throw error;
        }
    }
}
