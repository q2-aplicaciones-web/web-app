import { Address } from "../model/address.entity";

export class AddressAssembler {
    static toEntityFromResponse(response) {
        return new Address({
            id: response.id,
            profileId: response.profile_id,
            address: response.address,
            city: response.city,
            country: response.country,
            state: response.state,
            zip: response.zip
        });
    }

    static toEntitiesFromResponse(responses) {
        return responses.map((response) => this.toEntityFromResponse(response));
    }
}
