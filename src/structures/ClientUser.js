class ClientUser {
    constructor(client, data) {
        this.id = data.id,
        this.flags = data.flags || 0

        this._typing = new Map();

        this._set(data)
    }
    _set(data) {
        if ('username' in data) {
            console.log('e');
            this.username = data.username
        } else if (typeof this.username !== 'string') {
            this.username = null;
        }

        if ('bot' in data || typeof this.bot !== 'boolean') {
            this.bot = Boolean(data.bot);
        }

        if ('discriminator' in data) {
            this.discriminator = data.discriminator;
        } else if (typeof this.discriminator !== 'string') {
            this.discriminator = null;
        }

        if ('avatar' in data) {
            this.avatar = data.avatar;
        } else if (typeof this.avatar !== 'string') {
            this.avatar = null;
        }

        if ('system' in data) {
            this.system = Boolean(data.system);
        }

        if ('public_flags' in data) {
            this.flags = data.public_flags
        }
    }

    get tag() {
        return typeof this.username === 'string' ? `${this.username}#${this.discriminator}` : null;
    }
}
module.exports = {
    ClientUser,
}