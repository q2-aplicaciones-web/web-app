
import { Address } from "../model/address.entity";

export class AddressAssembler {

    static toEntityFromResponse(response) {
        return new Address(
            response.id,
            response.profile_id,
            response.address,
            response.city,
            response.country,
            response.state,
            response.zip
        );
    }

    static toEntitiesFromResponse(responses) {
        return responses.map(response => this.toEntityFromResponse(response));
    }
}
