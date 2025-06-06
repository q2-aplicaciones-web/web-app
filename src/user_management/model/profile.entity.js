export class Profile {
    _firstName;
    _lastName;
    _gender;
    _addresses;

    constructor({ firstName, lastName, gender, addresses }) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._gender = gender;
        this._addresses = addresses;
    }

    get firstName() {
        return this._firstName;
    }

    get lastName() {
        return this._lastName;
    }

    get gender() {
        return this._gender;
    }

    get addresses() {
        return this._addresses;
    }

    getFullName() {
        return `${this._firstName || ""} ${this._lastName || ""}`.trim();
    }
}
