import { Controller, Get, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { LookupContactDto } from './dto/lookup-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get('lookup')
  lookup(@Query() query: LookupContactDto) {
    return this.contactsService.lookup(query.contact, query.contactType);
  }
}
