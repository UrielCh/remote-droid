import { Entity, Schema } from "redis-om";

export interface DroidUserModel {
  id?: string;
  createdAt: number;
  updatedAt: number;
  email: string;
  hash: string;
  name: string;
  role: string;
  devices: string[];
  tokens: string[];
}

export class DroidUser extends Entity implements DroidUserModel {
  id: string;
  createdAt: number;
  updatedAt: number;
  email: string;
  hash: string;
  name: string;
  role: string;
  devices: string[];
  tokens: string[];
}

export const droidUserSchema = new Schema(DroidUser, {
  //  id: string;
  createdAt: { type: "date", indexed: false },
  updatedAt: { type: "date", indexed: false },
  email: { type: "string", normalized: false },
  hash: { type: "string", indexed: false },
  name: { type: "string", indexed: false },
  role: { type: "string" },
  devices: { type: "string[]" },
  tokens: { type: "string[]" },
});
