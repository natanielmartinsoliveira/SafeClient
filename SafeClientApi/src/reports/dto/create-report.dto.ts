import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ContactType } from '../../common/enums/contact-type.enum';
import { FlagType } from '../../common/enums/flag-type.enum';

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsEnum(ContactType)
  contactType: ContactType;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(FlagType, { each: true })
  flags: FlagType[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
