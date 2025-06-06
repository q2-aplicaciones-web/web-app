

import { Profile } from "../model/profile.entity";
import { AddressAssembler } from "./address.assembler";

export class ProfileAssembler {

    static toEntityFromResponse(response) {
        const addresses = AddressAssembler.toEntitiesFromResponse(response.addresses);

        return new Profile(
            response.first_name,
            response.last_name,
            response.gender,
            addresses
        );
    }

    static toEntitiesFromResponse(responses) {
        return responses.map(response => this.toEntityFromResponse(response));
    }
}
