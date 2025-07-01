/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />

import { type KeyCodes, KeyCodesMap } from './KeyCodes.js';
import DeviceDto from 'src/device/dto/Device.dto.js';
// import { ServiceNodeSerial } from "./common.ts";
// import { KeyCodes } from "./KeyCodes.ts"

const KEY_MAPPING = {
    Enter: KeyCodesMap.KEYCODE_ENTER,
    Backspace: KeyCodesMap.KEYCODE_DEL,
    ArrowLeft: KeyCodesMap.KEYCODE_DPAD_LEFT,
    ArrowRight: KeyCodesMap.KEYCODE_DPAD_RIGHT,
    ArrowUp: KeyCodesMap.KEYCODE_DPAD_UP,
    ArrowDown: KeyCodesMap.KEYCODE_DPAD_DOWN,
    Tab: KeyCodesMap.KEYCODE_TAB,
    Escape: KeyCodesMap.KEYCODE_ESCAPE,
    ShiftLeft: KeyCodesMap.KEYCODE_SHIFT_LEFT,
    ShiftRight: KeyCodesMap.KEYCODE_SHIFT_RIGHT,
    ControlLeft: KeyCodesMap.KEYCODE_CTRL_LEFT,
    ControlRight: KeyCodesMap.KEYCODE_CTRL_RIGHT,
    CapsLock: KeyCodesMap.KEYCODE_CAPS_LOCK,
    AltLeft: KeyCodesMap.KEYCODE_ALT_LEFT,
    AltRight: KeyCodesMap.KEYCODE_ALT_RIGHT,
    F1: KeyCodesMap.KEYCODE_F1,
    F2: KeyCodesMap.KEYCODE_F2,
    F3: KeyCodesMap.KEYCODE_F3,
    F4: KeyCodesMap.KEYCODE_F4,
    F5: KeyCodesMap.KEYCODE_F5,
    F6: KeyCodesMap.KEYCODE_F6,
    F7: KeyCodesMap.KEYCODE_F7,
    F8: KeyCodesMap.KEYCODE_F8,
    F9: KeyCodesMap.KEYCODE_F9,
    F10: KeyCodesMap.KEYCODE_F10,
    F11: KeyCodesMap.KEYCODE_F11,
    F12: KeyCodesMap.KEYCODE_F12,
    PageUp: KeyCodesMap.KEYCODE_PAGE_UP,
    PageDown: KeyCodesMap.KEYCODE_PAGE_DOWN,
    Home: KeyCodesMap.KEYCODE_MOVE_HOME,
    End: KeyCodesMap.KEYCODE_MOVE_END,
    Insert: KeyCodesMap.KEYCODE_INSERT,
    Delete: KeyCodesMap.KEYCODE_DEL,
} as Record<string, number>;

export class RemoteDeviceWs {
    public phoneWs: WebSocket;

    constructor(public srv: DeviceDto & { prefix: string, token?: string }) {
        // const entrypoint = state.entrypoint.replace(/^http/, 'ws');
        let prefix = srv.prefix;
        if (!prefix.endsWith('/'))
            prefix = prefix += "/";
        const phoneUrl = `${prefix}device/${srv.id}`.replace(/^http/, 'ws');
        // console.log('open Ws:', phoneUrl);
        this.phoneWs = new WebSocket(phoneUrl);
        this.phoneWs.binaryType = "blob";

        this.phoneWs.onopen = () => {
            // console.log('CNX Ready:', phoneUrl);
            const displayMode = "MJPEG";
            const action = "on";
            if (srv.token)
                this.phoneWs.send(`auth ${srv.token}`);
            this.phoneWs.send(`${displayMode} ${action}`);
            // screen("MJPEG", "once");
            // notifyOk();
        };
        this.phoneWs.onmessage = (message) => {
            if (message.data instanceof Blob)
                this.onMJPEG(message.data);
        };

        this.phoneWs.onclose = (_e) => {
            console.log("closed");
        }
        this.phoneWs.onerror = (_e) => {
            console.log("error");
        };
    }

    public onMJPEG = (_blob: Blob) => { };

    /**
 * mouve pointer in percent
 * @param px percent X
 * @param py percent Y
 */
    screenMouseUp(px: number, py: number): void {
        this.phoneWs.send(`u ${px} ${py}`);
    }

    screenMouseDown(px: number, py: number): void {
        this.phoneWs.send(`d ${px} ${py}`);
    }

    screenMouseDrag(px: number, py: number): void {
        this.phoneWs.send(`m ${px} ${py}`);
    }
    screenMouseOut(): void {
        this.phoneWs.send(`u`);
    }

    keyPress(keyCode: KeyCodes): void {
        this.phoneWs.send(`key PRESS ${keyCode}`);
    }

    screenKeypress(event: KeyboardEvent): void {
        const { key, code } = event;
        if (key.length > 1) {
            // console.log(code);
            const keycode = KEY_MAPPING[code] || 0;
            if (keycode) {
                // console.log(`key press ${keycode}`);
                this.phoneWs.send(`key press ${keycode}`);
            } else {
                console.log(`need to map ${code}`);
            }
            return;
        } else {
            //const buffer = this.inputBuffer;
            //const last = buffer[buffer.length - 1]; // = (buffer.length)?;
            //if (last && last.ev === 'text') {
            //  last.text += key;
            //} else {
            //  this.inputBuffer.push({ ev: 'text', text: key });
            //}
            this.phoneWs.send(`text ${key}`);
        }
        // this.consumeInputBuffer();
    }

    close() {
        this.phoneWs.close();
    }
}