import { IsEnum, IsNotEmpty, IsString, Validate } from 'class-validator';
import { ContactType } from '../../common/enums/contact-type.enum';
import { ContactFormatConstraint } from '../../common/validators/contact-format.validator';

export class LookupContactDto {
  @IsNotEmpty()
  @IsString()
  @Validate(ContactFormatConstraint)
  contact: string;

  @IsEnum(ContactType)
  contactType: ContactType;
}
