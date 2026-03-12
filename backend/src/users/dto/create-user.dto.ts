import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsDateString,
  Matches,
  IsEnum,
} from 'class-validator';
import { Gender } from './update-user.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsNotEmpty()
  role_id: number;

  @IsOptional()
  @IsString()
  @Matches(/^(\+84|0)[0-9]{9}$/)
  phone?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dob?: string;
}
