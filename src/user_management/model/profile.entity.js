
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

    getFullName() {
        return `${this._firstName || ""} ${this._lastName || ""}`.trim();
    }
}
