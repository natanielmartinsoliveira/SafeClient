import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ContactType } from '../../common/enums/contact-type.enum';

export class CreateRemovalRequestDto {
  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsEnum(ContactType)
  contactType: ContactType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
