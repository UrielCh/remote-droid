import { Entity, Schema } from "redis-om";

export type DroidUserFull = DroidUserModel & DroidUser;

export interface DroidUserModel {
  entityId?: string;
  createdAt: number;
  updatedAt: number;
  email: string;
  hash?: string;
  name: string;
  role: string;
  devices: string[];
  tokens: string[];
}

export class DroidUser extends Entity {
  allowDevice(serial: string): boolean {
    if ((this as any as DroidUserModel).role === "admin") return true;
    if ((this as any as DroidUserModel).devices.includes(serial)) return true;
    return false;
  }
}

export const droidUserSchema = new Schema(DroidUser, {
  //  id: string;
  createdAt: { type: "date", indexed: false },
  updatedAt: { type: "date", indexed: false },
  email: { type: "string", normalized: true },
  hash: { type: "string", indexed: false },
  name: { type: "string", indexed: false },
  role: { type: "string" },
  devices: { type: "string[]" },
  tokens: { type: "string[]" },
});
