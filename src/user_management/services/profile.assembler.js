import { Profile } from "../model/profile.entity";
import { AddressAssembler } from "./address.assembler";

export class ProfileAssembler {
    static toEntityFromResponse(response) {
        const addresses = AddressAssembler.toEntitiesFromResponse(
            response.addresses
        );

        return new Profile({
            firstName: response.first_name,
            lastName: response.last_name,
            gender: response.gender,
            addresses: addresses
        });
    }

    static toEntitiesFromResponse(responses) {
        return responses.map((response) => this.toEntityFromResponse(response));
    }
}
