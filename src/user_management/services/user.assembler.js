import { User } from "../model/user.entity";
import { ProfileAssembler } from "./profile.assembler";

export class UserAssembler {
    static toEntityFromResponse(response) {
        const profile = ProfileAssembler.toEntityFromResponse(response.profile);

        return new User({
            id: response.id,
            email: response.email,
            token: response.token,
            rol: response.rol,
            profile: profile
        });
    }
}
