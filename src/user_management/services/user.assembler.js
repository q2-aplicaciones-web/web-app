import { User } from "../model/user.entity";
import { ProfileAssembler } from "./profile.assembler";

export class UserAssembler {
    static toEntityFromResponse(response) {
        const profile = ProfileAssembler.toEntityFromResponse(response.profile);

        return new User(
            response.id,
            response.email,
            response.token,
            response.rol,
            profile
        );
    }
}
