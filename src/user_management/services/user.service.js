import { env } from "../../env";
import axios from "axios";
import { UserAssembler } from "./user.assembler";

const USER_WITH_PROFILE = (id) =>
    `http://localhost:3000/userWithProfile?id=${id}`;

const http = axios.create({
    baseURL: env.apiBaseUrl,
});

export class UserService {
    _userId = env.defaultUserId;

    async getSessionUserId() {
        return this._userId;
    }

    async getCurrentUser() {
        try {
            return http
                .get(USER_WITH_PROFILE(this._userId))
                .then((res) => UserAssembler.toEntityFromResponse(res.data));
        } catch (error) {
            console.error("Error in getCurrentUser:", error);
        }
    }
}
