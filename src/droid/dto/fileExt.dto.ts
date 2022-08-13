import { IsEnum } from "class-validator";

export const VALID_FILE_EXT = [".png", ".jpeg"] as const;
export type ValidTypeExt = typeof VALID_FILE_EXT[number];

export class fileExtDto {
  @IsEnum(VALID_FILE_EXT)
  ext: ValidTypeExt;
}
