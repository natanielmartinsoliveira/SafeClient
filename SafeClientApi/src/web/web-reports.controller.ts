import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateReportDto } from '../reports/dto/create-report.dto';
import { ReportsService } from '../reports/reports.service';

@Controller('web/reports')
export class WebReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateReportDto, @Req() req: Request & { user: { id: string; email: string } }) {
    return this.reportsService.create(dto, undefined, req.user.id, req.user.email);
  }
}
