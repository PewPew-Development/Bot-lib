class ClientUser {
    constructor(client, data) {
        this.id = data.user.id,
        this.flags = data.flags || 0


        this._set(data)
    }
    _set(data) {
        if ('username' in data.user) {
            console.log('e');
            this.username = data.user.username
        } else if (typeof this.username !== 'string') {
            this.username = null;
        }

        if ('bot' in data.user || typeof this.bot !== 'boolean') {
            this.bot = Boolean(data.user.bot);
        }

        if ('discriminator' in data.user) {
            this.discriminator = data.user.discriminator;
        } else if (typeof this.discriminator !== 'string') {
            this.discriminator = null;
        }

        if ('avatar' in data.user) {
            this.avatar = data.user.avatar;
        } else if (typeof this.avatar !== 'string') {
            this.avatar = null;
        }

        if ('system' in data.user) {
            this.system = Boolean(data.user.system);
        }

        if ('public_flags' in data.user) {
            this.flags = data.user.public_flags
        }
    }

    get tag() {
        return typeof this.username === 'string' ? `${this.username}#${this.discriminator}` : null;
    }
}
module.exports = {
    ClientUser,
}