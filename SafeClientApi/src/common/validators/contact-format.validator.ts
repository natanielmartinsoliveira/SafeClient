import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ContactType } from '../enums/contact-type.enum';

@ValidatorConstraint({ name: 'ContactFormat', async: false })
export class ContactFormatConstraint implements ValidatorConstraintInterface {
  validate(contact: string, args: ValidationArguments): boolean {
    const dto = args.object as { contactType?: ContactType };
    if (!contact || typeof contact !== 'string') return false;
    switch (dto.contactType) {
      case ContactType.PHONE: {
        // E.164 international: 7–15 digits after stripping +, spaces, dashes, parens
        const digits = contact.replace(/[\s\-().+]/g, '');
        return /^\d{7,15}$/.test(digits);
      }
      case ContactType.TELEGRAM:
      case ContactType.INSTAGRAM:
        return /^[a-zA-Z0-9._]{1,50}$/.test(contact.trim());
      case ContactType.EMAIL:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim());
      default:
        return false;
    }
  }

  defaultMessage(): string {
    return 'Formato de contato inválido para o tipo selecionado.';
  }
}
