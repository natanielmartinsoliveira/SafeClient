import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { FlagType } from '../../common/enums/flag-type.enum';

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(FlagType, { each: true })
  flags?: FlagType[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
