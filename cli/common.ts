export type ImgTypes = 'jpeg' | 'png' | 'webp' | 'gif';
export type DeviceType = 'emulator' | 'device' | 'offline' | 'unauthorized';

export interface PhoneRef0 {
  id: string;
  type: DeviceType;
  thumbnails?: string;
  props?: Record<string, string>;
  h: number;
  w: number;
}
export interface PhoneRef extends PhoneRef0 {
  srv: ServiceNode;
}

export type ServiceNode = {
  /**
   * node name
   */
  name: string;
  /**
   * url ending with / like http://dom.com/remote/local/
   */
  remoteDroid: string;
  /**
   * url ending with / like http://dom.com/pilot/local/
   */
  // pilotDroid: string;
  /**
   * Auth token
   */
  token: string;
};

export type ServiceNodeSerial = ServiceNode & { serial: string };
