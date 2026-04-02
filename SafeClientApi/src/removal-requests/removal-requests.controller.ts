import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RemovalRequestsService } from './removal-requests.service';
import { CreateRemovalRequestDto } from './dto/create-removal-request.dto';

@Controller('removal-requests')
export class RemovalRequestsController {
  constructor(private readonly service: RemovalRequestsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateRemovalRequestDto) {
    return this.service.create(dto);
  }
}
