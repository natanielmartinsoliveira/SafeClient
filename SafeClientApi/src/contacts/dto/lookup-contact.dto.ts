import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ContactType } from '../../common/enums/contact-type.enum';

export class LookupContactDto {
  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsEnum(ContactType)
  contactType: ContactType;
}
