export class User {
    _id;
    _email;
    _token;
    _profile;
    _rol;

    constructor({ id, email, token, rol, profile }) {
        this._id = id;
        this._email = email;
        this._token = token;
        this._rol = rol;
        this._profile = profile;
    }

    get id() {
        return this._id;
    }
    get email() {
        return this._email;
    }
    get token() {
        return this._token;
    }
    get rol() {
        return this._rol;
    }
    get profile() {
        return this._profile;
    }
}
