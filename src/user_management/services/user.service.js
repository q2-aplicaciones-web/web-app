import { env } from "../../env";
import axios from "axios";
import { UserAssembler } from "./user.assembler";

const USER_WITH_PROFILE = (id) =>
    `http://localhost:3000/userWithProfile?id=${id}`;

const http = axios.create({
    baseURL: env.apiBaseUrl,
});

export class UserService {
    static _userId = env.defaultUserId;

    static async getSessionUserId() {
        return this._userId;
    }

    static async getCurrentUser() {
        try {
            return http
                .get(USER_WITH_PROFILE(this._userId))
                .then((res) => {
                    return UserAssembler.toEntityFromResponse(res.data[0])
                });
        } catch (error) {
            console.error("Error in getCurrentUser:", error);
        }
    }
}
