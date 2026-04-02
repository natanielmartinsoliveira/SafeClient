import { ContactType } from '../enums/contact-type.enum';

export function normalizeContact(contact: string, type: ContactType): string {
  switch (type) {
    case ContactType.PHONE:
      return contact.replace(/\D/g, '');
    case ContactType.TELEGRAM:
    case ContactType.INSTAGRAM:
      return contact.replace(/^@+/, '').toLowerCase().trim();
    case ContactType.EMAIL:
      return contact.toLowerCase().trim();
    default:
      return contact.trim();
  }
}
