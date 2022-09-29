import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

/**
 * use as a body
 */
export class SwipeCoordDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({ description: 'X1 position in screen pixel' })
  x1?: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({ description: 'Y1 position in screen pixel' })
  y1?: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({ description: 'X2 position in screen pixel' })
  x2?: number;

  @ApiProperty({ example: 200 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({ description: 'Y2 position in screen pixel' })
  y2?: number;

  ///  percent

  @Min(0)
  @Max(100)
  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'X1 position in percent' })
  px1?: number;

  @Min(0)
  @Max(100)
  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'Y1 position in percent' })
  py1?: number;

  @Min(0)
  @Max(100)
  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'X2 position in percent' })
  px2?: number;

  @Min(0)
  @Max(100)
  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'Y2 position in percent' })
  py2?: number;

  @Min(0)
  @Max(5000)
  @IsNumber()
  @IsOptional()
  @ApiProperty({ title: 'swipe duration', description: 'change swipe duration, default swape is a 500ms linear swipe' })
  durartion = 500;
}
