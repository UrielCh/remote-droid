import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

/**
 * use body
 */
export class TabCoordDto {
  @Min(0)
  @IsNumber()
  @IsOptional()
  x?: number;

  @Min(0)
  @IsNumber()
  @IsOptional()
  y?: number;

  @Min(0)
  @Max(100)
  @IsNumber()
  @IsOptional()
  px?: number;

  @Min(0)
  @IsNumber()
  @Max(100)
  @IsOptional()
  py?: number;

  @Min(0)
  @Max(5000)
  @IsNumber()
  @Transform((value) => Number(value.value))
  durartion = 0;
}
