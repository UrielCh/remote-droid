import { IsString } from "class-validator";

/**
 * use as a body
 */
export class execOutDto {
  @IsString()
  command: string;
}
