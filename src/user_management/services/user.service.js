import { env } from "../../env";
import axios from "axios";
import { UserAssembler } from "./user.assembler";

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
                .get(`/userWithProfile?id=${this._userId}`)
                .then((res) => {
                    return UserAssembler.toEntityFromResponse(res.data[0]);
                });
        } catch (error) {
            console.error("Error in getCurrentUser:", error);
            throw error;
        }
    }

    // ✅ NUEVO: Obtener usuario por ID
    static async getUserById(userId) {
        try {
            const response = await http.get(`/userWithProfile?id=${userId}`);
            if (response.data && response.data.length > 0) {
                return UserAssembler.toEntityFromResponse(response.data[0]);
            }
            throw new Error(`User with ID ${userId} not found`);
        } catch (error) {
            console.error("Error in getUserById:", error);
            throw error;
        }
    }

    // ✅ NUEVO: Actualizar perfil completo
    static async updateUserProfile(userId, profileData) {
        try {
            // 1. Obtener el usuario actual de userWithProfile
            const currentUserResponse = await http.get(`/userWithProfile?id=${userId}`);
            
            if (!currentUserResponse.data || currentUserResponse.data.length === 0) {
                throw new Error(`User with ID ${userId} not found`);
            }

            const currentUser = currentUserResponse.data[0];

            // 2. Actualizar userWithProfile
            const updatedUserData = {
                ...currentUser,
                profile: {
                    ...currentUser.profile,
                    first_name: profileData.firstName,
                    last_name: profileData.lastName,
                    gender: profileData.gender
                }
            };

            // 3. PUT request a userWithProfile
            const userWithProfileResponse = await http.put(`/userWithProfile/${currentUser.id}`, updatedUserData);

            // 4. También actualizar tabla profiles separada
            const profileResponse = await http.get(`/profiles?user_id=${userId}`);
            if (profileResponse.data && profileResponse.data.length > 0) {
                const profile = profileResponse.data[0];
                await http.put(`/profiles/${profile.id}`, {
                    ...profile,
                    first_name: profileData.firstName,
                    last_name: profileData.lastName,
                    gender: profileData.gender
                });
            }

            // 5. Retornar entidad actualizada
            return UserAssembler.toEntityFromResponse(userWithProfileResponse.data);

        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    }
}
