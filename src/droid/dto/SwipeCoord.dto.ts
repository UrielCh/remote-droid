import { IsNumber, IsOptional, Max, Min } from "class-validator";

/**
 * use as a body
 */
export class SwipeCoordDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  x1?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  y1?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  x2?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  y2?: number;

  ///  percent

  @Min(0)
  @Max(100)
  @IsNumber()
  @IsOptional()
  px1?: number;

  @Min(0)
  @Max(100)
  @IsNumber()
  @IsOptional()
  py1?: number;

  @Min(0)
  @Max(100)
  @IsNumber()
  @IsOptional()
  px2?: number;

  @Min(0)
  @Max(100)
  @IsNumber()
  @IsOptional()
  py2?: number;

  @Min(0)
  @Max(5000)
  @IsNumber()
  @IsOptional()
  durrartion = 0;
}
