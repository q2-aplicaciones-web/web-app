import axios from "axios";
import { env } from "../../env";
import { Analytics } from "../model/analytics.entity";

export class AnalyticsService {
    static async getUserAnalytics(userId) {
        const response = await axios.get(`${env.apiBaseUrl}/analytics?user_id=${userId}`);
        if (response.data && response.data.length > 0) {
            return new Analytics(response.data[0]);
        }
        return null;
    }
}
