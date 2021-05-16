import { Client } from "../client/Client";

export class ClientUser {
    public id: string;
    public username: string;
    public tag: string;
    public discriminator: number;
    public bot: boolean
    public avatar: string;
    public flags: number;
    public MfaEnabled: boolean;

    constructor(client: Client, data: any) {
        this.id = data.user.id
        this.username = data.user.username
        this.tag = `${this.username}#${data.user.discriminator}`
        this.discriminator = data.user.discriminator
        this.bot = data.user.bot
        this.avatar = data.user.avatar
        this.flags = data.user.flags
        this.MfaEnabled = data.user.mfa_enabled
    }
}