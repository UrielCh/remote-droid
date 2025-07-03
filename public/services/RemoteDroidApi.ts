import DeviceDto from 'src/device/dto/Device.dto.js';

export class RemoteDroidApi {
    public baseUrl: string | undefined;
    #prefix?: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl;
        if (!baseUrl) {
            const { protocol, host } = window.location;
            this.baseUrl = `${protocol}//${host}`;
        }
    }

    async getPrefix(): Promise<string> {
        if (this.#prefix) return this.#prefix;
        const url = new URL('/prefix', this.baseUrl);
        const response = await fetch(url);
        const data = await response.json();
        this.#prefix = data.prefix as string;
        return this.#prefix;
    }

    async listDevices(): Promise<DeviceDto[]> {
        const prefix = await this.getPrefix();
        const url = new URL(`${prefix}/device`, this.baseUrl);
        const deviceResponse = await fetch(url);
        const deviceData = await deviceResponse.json();
        return deviceData as DeviceDto[];
    }
}
