import { IsNotEmpty, IsString } from 'class-validator';

export class PreviewPromotionDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
