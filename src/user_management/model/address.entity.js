export class Address {
    _id;
    _profileId;
    _address;
    _city;
    _country;
    _state;
    _zip;

    constructor({ id, profileId, address, city, country, state, zip }) {
        this._id = id;
        this._profileId = profileId;
        this._address = address;
        this._city = city;
        this._country = country;
        this._state = state;
        this._zip = zip;
    }

    get id() {
        return this._id;
    }

    get profileId() {
        return this._profileId;
    }

    get address() {
        return this._address;
    }

    get city() {
        return this._city;
    }

    get country() {
        return this._country;
    }

    get state() {
        return this._state;
    }

    get zip() {
        return this._zip;
    }

    formatAddress() {
        const parts = [
            this._address,
            this._city,
            this._state,
            this._zip,
            this._country,
        ].filter((part) => part && part.trim());
        return parts.join(", ");
    }
}
